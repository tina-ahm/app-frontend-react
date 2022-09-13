import Ajv from 'ajv';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import dot from 'dot-object';
import JsonPointer from 'jsonpointer';
import moment from 'moment';
import type { Options } from 'ajv';
import type * as AjvCore from 'ajv/dist/core';

import { Severity } from 'src/types';
import { getDataTaskDataTypeId } from 'src/utils/appMetadata';
import { AsciiUnitSeparator } from 'src/utils/attachment';
import {
  convertDataBindingToModel,
  getFormDataFromFieldKey,
  getKeyWithoutIndex,
} from 'src/utils/databindings';
import { getFlagBasedDate } from 'src/utils/dateHelpers';
import {
  getFieldName,
  getFormDataForComponent,
} from 'src/utils/formComponentUtils';
import { createRepeatingGroupComponents } from 'src/utils/formLayout';
import { matchLayoutComponent, setupGroupComponents } from 'src/utils/layout';
import { resolvedNodesInLayout } from 'src/utils/layout/hierarchy';
import { getTextResourceByKey } from 'src/utils/textResource';
import type { IFormData } from 'src/features/form/data';
import type {
  ILayout,
  ILayoutComponent,
  ILayoutGroup,
  ILayouts,
} from 'src/features/form/layout';
import type {
  IAttachment,
  IAttachments,
} from 'src/shared/resources/attachments';
import type {
  DateFlags,
  IComponentBindingValidation,
  IComponentValidations,
  IDataModelBindings,
  ILayoutValidations,
  IRepeatingGroups,
  IRuntimeState,
  ISchemaValidator,
  ITextResource,
  ITextResourceBindings,
  IValidationIssue,
  IValidationResult,
  IValidations,
} from 'src/types';
import type {
  LayoutNode,
  LayoutObject,
  LayoutRootNode,
  LayoutRootNodeCollection,
} from 'src/utils/layout/hierarchy';

import {
  getLanguageFromKey,
  getParsedLanguageFromKey,
} from 'altinn-shared/utils';
import { buildInstanceContext } from 'altinn-shared/utils/instanceContext';
import type { ILanguage } from 'altinn-shared/types';

export interface ISchemaValidators {
  [id: string]: ISchemaValidator;
}

const validators: ISchemaValidators = {};

export function getValidator(currentDataTaskTypeId, schemas) {
  if (!validators[currentDataTaskTypeId]) {
    validators[currentDataTaskTypeId] = createValidator(
      schemas[currentDataTaskTypeId],
    );
  }
  return validators[currentDataTaskTypeId];
}

export function createValidator(schema: any): ISchemaValidator {
  const ajvOptions: Options = {
    allErrors: true,
    coerceTypes: true,

    /**
     * This option is deprecated in AJV, but continues to work for now. We have unit tests that will fail if the
     * functionality is removed from AJV. The jsPropertySyntax (ex. 'Path.To.Array[0].Item') was replaced with JSON
     * pointers in v7 (ex. '/Path/To/Array/0/Item'). If the option to keep the old syntax is removed at some point,
     * we'll have to implement a translator ourselves, as we'll need this format to equal our data model bindings.
     *
     * @see https://github.com/ajv-validator/ajv/issues/1577#issuecomment-832216719
     */
    jsPropertySyntax: true,

    strict: false,
    strictTypes: false,
    strictTuples: false,
    unicodeRegExp: false,
    code: { es5: true },
  };
  let ajv: AjvCore.default;
  let rootElementPath;
  if (schema.$schema?.includes('2020-12')) {
    // we have to use a different ajv-instance for 2020-12 draft
    // here we actually validate against the root json-schema object
    ajv = new Ajv2020(ajvOptions);
    rootElementPath = '';
  } else {
    // leave existing schemas untouched. Here we actually validate against a sub schema with the name of the model
    // for instance "skjema"
    ajv = new Ajv(ajvOptions);
    const rootKey: string = Object.keys(schema.properties)[0];
    rootElementPath = schema.properties[rootKey].$ref;
  }
  addFormats(ajv);
  ajv.addFormat('year', /^\d{4}$/);
  ajv.addFormat('year-month', /^\d{4}-(0[1-9]|1[0-2])$/);
  ajv.addSchema(schema, 'schema');
  return {
    validator: ajv,
    schema,
    rootElementPath,
  };
}

export const errorMessageKeys = {
  minimum: {
    textKey: 'min',
    paramKey: 'limit',
  },
  exclusiveMinimum: {
    textKey: 'min',
    paramKey: 'limit',
  },
  maximum: {
    textKey: 'max',
    paramKey: 'limit',
  },
  exclusiveMaximum: {
    textKey: 'max',
    paramKey: 'limit',
  },
  minLength: {
    textKey: 'minLength',
    paramKey: 'limit',
  },
  maxLength: {
    textKey: 'maxLength',
    paramKey: 'limit',
  },
  pattern: {
    textKey: 'pattern',
    paramKey: 'pattern',
  },
  format: {
    textKey: 'pattern',
    paramKey: 'format',
  },
  type: {
    textKey: 'pattern',
    paramKey: 'type',
  },
  required: {
    textKey: 'required',
    paramKey: 'limit',
  },
  enum: {
    textKey: 'enum',
    paramKey: 'allowedValues',
  },
  const: {
    textKey: 'enum',
    paramKey: 'allowedValues',
  },
  multipleOf: {
    textKey: 'multipleOf',
    paramKey: 'multipleOf',
  },
  oneOf: {
    textKey: 'oneOf',
    paramKey: 'passingSchemas',
  },
  anyOf: {
    textKey: 'anyOf',
    paramKey: 'passingSchemas',
  },
  allOf: {
    textKey: 'allOf',
    paramKey: 'passingSchemas',
  },
  not: {
    textKey: 'not',
    paramKey: 'passingSchemas',
  },
};

export function validateEmptyFields(
  formData: IFormData,
  layouts: LayoutRootNodeCollection<'resolved'>,
  layoutOrder: string[],
  language: ILanguage,
  hiddenFields: string[],
  textResources: ITextResource[],
) {
  const validations = {};
  const allLayouts = layouts.all();
  for (const id of Object.keys(allLayouts)) {
    if (layoutOrder.includes(id)) {
      validations[id] = validateEmptyFieldsForNodes(
        formData,
        allLayouts[id],
        language,
        hiddenFields,
        textResources,
      );
    }
  }
  return validations;
}

export function validateEmptyFieldsForNodes(
  formData: IFormData,
  nodes: LayoutRootNode<'resolved'> | LayoutNode<'resolved'>,
  language: ILanguage,
  hiddenFields: string[],
  textResources: ITextResource[],
): ILayoutValidations {
  const hidden = new Set<string>(hiddenFields);

  const validations: any = {};
  for (const node of nodes.flat(false)) {
    if (
      // These components have their own validation in validateFormComponents(). With data model bindings enabled for
      // attachments, the empty field validations would interfere.
      node.item.type === 'FileUpload' ||
      node.item.type === 'FileUploadWithTag' ||
      node.item.required === false ||
      node.isHidden(hidden)
    ) {
      continue;
    }

    const result = validateEmptyField(
      formData,
      node.item.dataModelBindings,
      node.item.textResourceBindings,
      textResources,
      language,
    );
    if (result !== null) {
      validations[node.item.id] = result;
    }
  }

  return validations;
}

export function getParentGroup(groupId: string, layout: ILayout): ILayoutGroup {
  if (!groupId || !layout) {
    return null;
  }
  return layout.find((element) => {
    if (element.id !== groupId && element.type === 'Group') {
      const childrenWithoutMultiPage = element.children?.map((childId) =>
        element.edit?.multiPage ? childId.split(':')[1] : childId,
      );
      if (childrenWithoutMultiPage?.indexOf(groupId) > -1) {
        return true;
      }
    }
    return false;
  }) as ILayoutGroup;
}

export function getGroupChildren(
  groupId: string,
  layout: ILayout,
): (ILayoutGroup | ILayoutComponent)[] {
  const layoutGroup = layout.find(
    (element) => element.id === groupId,
  ) as ILayoutGroup;
  return layout.filter((element) =>
    layoutGroup?.children?.includes(element.id),
  );
}

export function validateEmptyField(
  formData: any,
  dataModelBindings: IDataModelBindings,
  textResourceBindings: ITextResourceBindings,
  textResources: ITextResource[],
  language: ILanguage,
): IComponentValidations {
  if (!dataModelBindings) {
    return null;
  }
  const fieldKeys = Object.keys(
    dataModelBindings,
  ) as (keyof IDataModelBindings)[];
  const componentValidations: IComponentValidations = {};
  fieldKeys.forEach((fieldKey) => {
    const value = getFormDataFromFieldKey(
      fieldKey,
      dataModelBindings,
      formData,
    );
    if (!value && fieldKey) {
      componentValidations[fieldKey] = {
        errors: [],
        warnings: [],
      };

      const fieldName = getFieldName(
        textResourceBindings,
        textResources,
        language,
        fieldKey !== 'simpleBinding' ? fieldKey : undefined,
      );
      componentValidations[fieldKey].errors.push(
        getParsedLanguageFromKey(
          'form_filler.error_required',
          language,
          [fieldName],
          true,
        ),
      );
    }
  });
  if (Object.keys(componentValidations).length > 0) {
    return componentValidations;
  }
  return null;
}

export function validateFormComponents(
  attachments: IAttachments,
  nodeLayout: LayoutRootNodeCollection<'resolved'>,
  layoutOrder: string[],
  formData: IFormData,
  language: ILanguage,
  hiddenFields: string[],
) {
  const validations: any = {};
  const layouts = nodeLayout.all();
  for (const id of Object.keys(layouts)) {
    if (layoutOrder.includes(id)) {
      validations[id] = validateFormComponentsForNodes(
        attachments,
        layouts[id],
        formData,
        language,
        hiddenFields,
      );
    }
  }

  return validations;
}

/*
  Fetches component specific validations
*/
function validateFormComponentsForNodes(
  attachments: IAttachments,
  nodes: LayoutRootNode<'resolved'> | LayoutNode<'resolved'>,
  formData: IFormData,
  language: ILanguage,
  hiddenFields: string[],
): ILayoutValidations {
  const validations: ILayoutValidations = {};
  const fieldKey: keyof IDataModelBindings = 'simpleBinding';
  const flatNodes = nodes.flat(false);
  const hiddenSet = new Set<string>(hiddenFields);

  for (const node of flatNodes) {
    if (node.isHidden(hiddenSet)) {
      continue;
    }

    if (
      node.item.type === 'FileUpload' &&
      !attachmentsValid(attachments, node.item)
    ) {
      validations[node.item.id] = {
        [fieldKey]: {
          errors: [],
          warnings: [],
        },
      };
      validations[node.item.id][fieldKey].errors.push(
        `${getLanguageFromKey(
          'form_filler.file_uploader_validation_error_file_number_1',
          language,
        )} ${node.item.minNumberOfAttachments} ${getLanguageFromKey(
          'form_filler.file_uploader_validation_error_file_number_2',
          language,
        )}`,
      );
    }
    if (node.item.type === 'FileUploadWithTag') {
      validations[node.item.id] = {
        [fieldKey]: {
          errors: [],
          warnings: [],
        },
      };

      if (attachmentsValid(attachments, node.item)) {
        const missingTagAttachments = attachments[node.item.id]
          ?.filter((attachment) => attachmentIsMissingTag(attachment))
          .map((attachment) => attachment.id);

        if (missingTagAttachments?.length > 0) {
          missingTagAttachments.forEach((missingId) => {
            validations[node.item.id][fieldKey].errors.push(
              `${
                missingId +
                AsciiUnitSeparator +
                getLanguageFromKey(
                  'form_filler.file_uploader_validation_error_no_chosen_tag',
                  language,
                )
              } ${(
                node.item.textResourceBindings.tagTitle || ''
              ).toLowerCase()}.`,
            );
          });
        }
      } else {
        validations[node.item.id][fieldKey].errors.push(
          `${getLanguageFromKey(
            'form_filler.file_uploader_validation_error_file_number_1',
            language,
          )} ${node.item.minNumberOfAttachments} ${getLanguageFromKey(
            'form_filler.file_uploader_validation_error_file_number_2',
            language,
          )}`,
        );
      }
    }

    if (node.item.type === 'DatePicker') {
      let componentValidations: IComponentValidations = {};
      const date = getFormDataForComponent(
        formData,
        node.item.dataModelBindings,
      );
      const flagBasedMinDate =
        getFlagBasedDate(node.item.minDate as DateFlags) ?? node.item.minDate;
      const flagBasedMaxDate =
        getFlagBasedDate(node.item.maxDate as DateFlags) ?? node.item.maxDate;
      const datepickerValidations = validateDatepickerFormData(
        date?.simpleBinding,
        flagBasedMinDate,
        flagBasedMaxDate,
        node.item.format,
        language,
      );
      componentValidations = {
        [fieldKey]: datepickerValidations,
      };
      validations[node.item.id] = componentValidations;
    }
  }

  return validations;
}

function attachmentsValid(attachments: any, component: any): boolean {
  return (
    component.minNumberOfAttachments === 0 ||
    (attachments &&
      attachments[component.id] &&
      attachments[component.id].length >= component.minNumberOfAttachments)
  );
}

export function attachmentIsMissingTag(attachment: IAttachment): boolean {
  return attachment.tags === undefined || attachment.tags.length === 0;
}

export const DatePickerMinDateDefault = '1900-01-01T12:00:00.000Z';
export const DatePickerMaxDateDefault = '2100-01-01T12:00:00.000Z';
export const DatePickerFormatDefault = 'DD.MM.YYYY';
export const DatePickerSaveFormatNoTimestamp = 'YYYY-MM-DD';

/*
  Validates the datepicker form data, returns an array of error messages or empty array if no errors found
*/
export function validateDatepickerFormData(
  formData: string,
  minDate: string = DatePickerMinDateDefault,
  maxDate: string = DatePickerMaxDateDefault,
  format: string = DatePickerFormatDefault,
  language: ILanguage,
): IComponentBindingValidation {
  const validations: IComponentBindingValidation = { errors: [], warnings: [] };
  const date = formData ? moment(formData) : null;

  if (formData === null) {
    // is only set to NULL if the format is malformed. Is otherwise undefined or empty string
    validations.errors.push(
      getParsedLanguageFromKey(
        'date_picker.invalid_date_message',
        language,
        [format],
        true,
      ),
    );
  }

  if (date && date.isBefore(minDate)) {
    validations.errors.push(
      getLanguageFromKey('date_picker.min_date_exeeded', language),
    );
  } else if (date && date.isAfter(maxDate)) {
    validations.errors.push(
      getLanguageFromKey('date_picker.max_date_exeeded', language),
    );
  }

  return validations;
}

/*
  Validates formData for a single component, returns a IComponentValidations object
*/
export function validateComponentFormData(
  layoutId: string,
  formData: any,
  dataModelField: string,
  component: ILayoutComponent,
  language: ILanguage,
  textResources: ITextResource[],
  schemaValidator: ISchemaValidator,
  existingValidationErrors: IComponentValidations | undefined,
  componentIdWithIndex: string | null,
  checkIfRequired: boolean,
): IValidationResult {
  const { validator, rootElementPath, schema } = schemaValidator;
  const fieldKey = Object.keys(component.dataModelBindings).find(
    (binding: string) =>
      component.dataModelBindings[binding] ===
      getKeyWithoutIndex(dataModelField),
  );
  const data = {};
  dot.str(dataModelField, formData, data);
  const valid =
    !formData ||
    formData === '' ||
    validator.validate(`schema${rootElementPath}`, data);
  const id = componentIdWithIndex || component.id;
  const validationResult: IValidationResult = {
    validations: {
      [layoutId]: {
        [id]: {
          [fieldKey]: {
            errors: [],
            warnings: [],
          },
        },
      },
    },
    invalidDataTypes: false,
  };

  if (!valid) {
    validator.errors
      .filter(
        (error) => processInstancePath(error.instancePath) === dataModelField,
      )
      .forEach((error) => {
        if (
          error.keyword === 'type' ||
          error.keyword === 'format' ||
          error.keyword === 'maximum'
        ) {
          validationResult.invalidDataTypes = true;
        }
        let errorParams =
          error.params[errorMessageKeys[error.keyword].paramKey];
        if (Array.isArray(errorParams)) {
          errorParams = errorParams.join(', ');
        }
        // backward compatible if we are validating against a sub scheme.
        const fieldSchema = rootElementPath
          ? getSchemaPartOldGenerator(error.schemaPath, schema, rootElementPath)
          : getSchemaPart(error.schemaPath, schema);
        let errorMessage: string;
        if (fieldSchema?.errorMessage) {
          errorMessage = getTextResourceByKey(
            fieldSchema.errorMessage,
            textResources,
          );
        } else {
          errorMessage = getParsedLanguageFromKey(
            `validation_errors.${errorMessageKeys[error.keyword].textKey}`,
            language,
            [errorParams],
            true,
          );
        }

        mapToComponentValidationsGivenComponent(
          layoutId,
          { ...component, id },
          getKeyWithoutIndex(dataModelField),
          errorMessage,
          validationResult.validations,
        );
      });
  }
  if (checkIfRequired && component.required && (!formData || formData === '')) {
    const fieldName = getFieldName(
      component.textResourceBindings,
      textResources,
      language,
      fieldKey !== 'simpleBinding' ? fieldKey : undefined,
    );
    validationResult.validations[layoutId][id][fieldKey].errors.push(
      getParsedLanguageFromKey(
        'form_filler.error_required',
        language,
        [fieldName],
        true,
      ),
    );
  }

  if (
    existingValidationErrors ||
    validationResult.validations[layoutId][id][fieldKey].errors.length > 0
  ) {
    return validationResult;
  }

  return null;
}

/**
 * Wrapper method around getSchemaPart for schemas made with our old generator tool
 * @param schemaPath the path, format #/properties/model/properties/person/properties/name/maxLength
 * @param mainSchema the main schema to get part from
 * @param rootElementPath the subschema to get part from
 * @returns the part, or null if not found
 */
export function getSchemaPartOldGenerator(
  schemaPath: string,
  mainSchema: object,
  rootElementPath: string,
): any {
  // for old generators we can have a ref to a definition that is placed outside of the subSchema we validate against.
  // if we are looking for #/definitons/x we search in main schema

  if (schemaPath.startsWith('#/definitions/')) {
    return getSchemaPart(schemaPath, mainSchema);
  }
  // all other in sub schema
  return getSchemaPart(
    schemaPath,
    getSchemaPart(`${rootElementPath}/#`, mainSchema),
  );
}

/**
 * Gets a json schema part by a schema patch
 * @param schemaPath the path, format #/properties/model/properties/person/properties/name/maxLength
 * @param jsonSchema the json schema to get part from
 * @returns the part, or null if not found
 */
export function getSchemaPart(schemaPath: string, jsonSchema: object): any {
  try {
    // want to transform path example format to to /properties/model/properties/person/properties/name
    const pointer = schemaPath.substr(1).split('/').slice(0, -1).join('/');
    return JsonPointer.compile(pointer).get(jsonSchema);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export function validateFormData(
  formDataAsObject: any,
  layouts: LayoutRootNodeCollection<'resolved'>,
  layoutOrder: string[],
  schemaValidator: ISchemaValidator,
  language: ILanguage,
  textResources: ITextResource[],
): IValidationResult {
  const validations: IValidations = {};
  let invalidDataTypes = false;

  const allLayouts = layouts.all();
  for (const id of Object.keys(allLayouts)) {
    if (layoutOrder.includes(id)) {
      const result = validateFormDataForLayout(
        formDataAsObject,
        allLayouts[id],
        id,
        schemaValidator,
        language,
        textResources,
      );
      validations[id] = result.validations[id];
      if (!invalidDataTypes) {
        invalidDataTypes = result.invalidDataTypes;
      }
    }
  }

  return { validations, invalidDataTypes };
}

/*
  Validates the entire formData and returns an IValidations object with validations mapped for all components
*/
function validateFormDataForLayout(
  formDataAsObject: any,
  node: LayoutRootNode<'resolved'> | LayoutNode<'resolved'>,
  layoutKey: string,
  schemaValidator: ISchemaValidator,
  language: ILanguage,
  textResources: ITextResource[],
): IValidationResult {
  const { validator, rootElementPath, schema } = schemaValidator;
  const valid = validator.validate(
    `schema${rootElementPath}`,
    formDataAsObject,
  );
  const result: IValidationResult = {
    validations: {},
    invalidDataTypes: false,
  };

  if (valid) {
    return result;
  }

  for (const error of validator.errors) {
    // Required fields are handled separately
    if (error.keyword === 'required') {
      continue;
    }

    result.invalidDataTypes =
      error.keyword === 'type' ||
      error.keyword === 'format' ||
      result.invalidDataTypes;

    let errorParams = error.params[errorMessageKeys[error.keyword].paramKey];
    if (Array.isArray(errorParams)) {
      errorParams = errorParams.join(', ');
    }

    const dataBinding = processInstancePath(error.instancePath);
    // backward compatible if we are validating against a sub scheme.
    const fieldSchema = rootElementPath
      ? getSchemaPartOldGenerator(error.schemaPath, schema, rootElementPath)
      : getSchemaPart(error.schemaPath, schema);
    let errorMessage;
    if (fieldSchema?.errorMessage) {
      errorMessage = getTextResourceByKey(
        fieldSchema.errorMessage,
        textResources,
      );
    } else {
      errorMessage = getParsedLanguageFromKey(
        `validation_errors.${errorMessageKeys[error.keyword].textKey}`,
        language,
        [errorParams],
        true,
      );
    }

    mapToComponentValidationsGivenNode(
      layoutKey,
      node,
      dataBinding,
      errorMessage,
      result.validations,
    );
  }

  return result;
}

export function processInstancePath(path: string): string {
  let result = path.startsWith('.') ? path.slice(1) : path;
  result = result
    .replace(/"]\["|']\['/g, '.')
    .replace(/\["|\['/g, '')
    .replace(/"]|']/g, '');
  return result;
}

function addErrorToValidations(
  validations: ILayoutValidations,
  layoutId: string,
  id: string,
  fieldKey: string,
  errorMessage: string,
) {
  if (!validations[layoutId]) {
    validations[layoutId] = {};
  }
  if (!validations[layoutId][id]) {
    validations[layoutId][id] = {};
  }
  if (!validations[layoutId][id][fieldKey]) {
    validations[layoutId][id][fieldKey] = {};
  }
  if (!validations[layoutId][id][fieldKey].errors) {
    validations[layoutId][id][fieldKey].errors = [];
  }
  if (!validations[layoutId][id][fieldKey].errors.includes(errorMessage)) {
    validations[layoutId][id][fieldKey].errors.push(errorMessage);
  }
}

function mapToComponentValidationsGivenComponent(
  layoutId: string,
  component: ILayoutComponent | ILayoutGroup,
  dataBinding: string,
  errorMessage: string,
  validations: ILayoutValidations,
) {
  const fieldKey = Object.keys(component.dataModelBindings).find((name) => {
    return component.dataModelBindings[name] === dataBinding;
  });

  if (!fieldKey) {
    return;
  }

  const index = getIndex(dataBinding);
  const id = index ? `${component.id}-${index}` : component.id;
  addErrorToValidations(validations, layoutId, id, fieldKey, errorMessage);
}

export function mapToComponentValidationsGivenNode(
  layoutId: string,
  node: LayoutObject<'resolved'>,
  dataBinding: string,
  errorMessage: string,
  validations: ILayoutValidations,
) {
  let fieldKey = null;
  const component = node.flat(true).find((item) => {
    if (item.item.dataModelBindings) {
      fieldKey = Object.keys(item.item.dataModelBindings).find((key) => {
        return (
          item.item.dataModelBindings[key].toLowerCase() ===
          dataBinding.toLowerCase()
        );
      });
    }
    return !!fieldKey;
  });

  if (!fieldKey || !component) {
    return;
  }

  addErrorToValidations(
    validations,
    layoutId,
    component.item.id,
    fieldKey,
    errorMessage,
  );
}

/*
 * Gets the total number of validation errors
 */
export function getErrorCount(validations: IValidations) {
  let count = 0;
  if (!validations) {
    return count;
  }
  Object.keys(validations).forEach((layoutId: string) => {
    Object.keys(validations[layoutId])?.forEach((componentId: string) => {
      const componentValidations: IComponentValidations =
        validations[layoutId]?.[componentId];
      if (componentValidations === null) {
        return;
      }
      Object.keys(componentValidations).forEach((bindingKey: string) => {
        const componentErrors = componentValidations[bindingKey].errors;
        if (componentErrors) {
          count += componentErrors.length;
        }
      });
    });
  });
  return count;
}

/*
 * Checks if form can be saved. If it contains anything other than valid error messages it returns false
 */
export function canFormBeSaved(
  validationResult: IValidationResult,
  apiMode?: string,
): boolean {
  if (validationResult && validationResult.invalidDataTypes) {
    return false;
  }

  const validations = validationResult?.validations;
  if (!validations || apiMode !== 'Complete') {
    return true;
  }
  return Object.keys(validations).every((layoutId: string) => {
    return Object.keys(validations[layoutId])?.every((componentId: string) => {
      const componentValidations: IComponentValidations =
        validations[layoutId][componentId];
      if (componentValidations === null) {
        return true;
      }
      return Object.keys(componentValidations).every((bindingKey: string) => {
        const componentErrors = componentValidations[bindingKey].errors;
        return !componentErrors || componentErrors.length === 0;
      });
    });
  });
}

export function findLayoutIdsFromValidationIssue(
  layouts: ILayouts,
  validationIssue: IValidationIssue,
): string[] {
  if (!validationIssue.field) {
    // validation issue could be mapped to task and not to a field in the datamodel
    return ['unmapped'];
  }
  return Object.keys(layouts).filter((id) => {
    const foundInLayout = layouts[id].find((c: ILayoutComponent) => {
      // Special handling for FileUpload components
      if (c.type === 'FileUpload' || c.type === 'FileUploadWithTag') {
        return c.id === validationIssue.field;
      }
      return (
        c.dataModelBindings &&
        Object.values(c.dataModelBindings).includes(
          getKeyWithoutIndex(validationIssue.field),
        )
      );
    });
    return !!foundInLayout;
  });
}

export function findComponentFromValidationIssue(
  layout: ILayout,
  validation: IValidationIssue,
  textResources: ITextResource[],
) {
  let componentId;
  const componentValidations: IComponentValidations = {};
  const component = layout.find((layoutElement) => {
    const componentCandidate = layoutElement as ILayoutComponent;
    let found = false;
    const match = matchLayoutComponent(validation.field, componentCandidate.id);
    if (validation.field && match && match.length > 0) {
      found = true;
      componentValidations.simpleBinding = addValidation(
        componentValidations,
        validation,
        textResources,
      );
      componentId = validation.field;
    } else {
      let index: string;
      if (validation.field) {
        index = getIndex(validation.field);
      }
      if (!componentCandidate.dataModelBindings) {
        return found;
      }
      Object.keys(componentCandidate.dataModelBindings).forEach(
        (dataModelBindingKey) => {
          const fieldToCheck = getKeyWithoutIndex(
            validation.field.toLowerCase(),
          );
          if (
            validation.field &&
            componentCandidate.dataModelBindings[
              dataModelBindingKey
            ].toLowerCase() === fieldToCheck
          ) {
            found = true;
            componentId = index
              ? `${layoutElement.id}-${index}`
              : layoutElement.id;
            componentValidations[dataModelBindingKey] = addValidation(
              componentValidations,
              validation,
              textResources,
            );
          }
        },
      );
    }

    return found;
  });

  return {
    componentId,
    component,
    componentValidations,
  };
}

/* Function to map the new data element validations to our internal redux structure */
export function mapDataElementValidationToRedux(
  validations: IValidationIssue[],
  layouts: ILayouts,
  textResources: ITextResource[],
) {
  const validationResult: IValidations = {};
  if (!validations) {
    return validationResult;
  }
  validations.forEach((validation) => {
    // for each validation, map to correct component and field key
    const layoutIds = findLayoutIdsFromValidationIssue(layouts, validation);
    if (layoutIds.length === 0) {
      layoutIds.push('unmapped');
    }

    layoutIds.forEach((layoutId) => {
      const { componentId, component, componentValidations } =
        findComponentFromValidationIssue(
          layouts[layoutId] || [],
          validation,
          textResources,
        );

      if (component) {
        // we have found a matching component
        if (!validationResult[layoutId]) {
          validationResult[layoutId] = {};
        }
        if (!validationResult[layoutId][componentId]) {
          validationResult[layoutId][componentId] = componentValidations;
        } else {
          const currentValidations = validationResult[layoutId][componentId];
          validationResult[layoutId][componentId] = mergeComponentValidations(
            currentValidations,
            componentValidations,
          );
        }
      } else {
        // unmapped error
        if (!validationResult[layoutId]) {
          validationResult[layoutId] = {};
        }
        if (!validationResult[layoutId].unmapped) {
          validationResult[layoutId].unmapped = {};
        }

        validationResult[layoutId].unmapped[validation.field] = addValidation(
          validationResult[layoutId].unmapped[validation.field],
          validation,
          textResources,
        );
      }
    });
  });

  return validationResult;
}

/**
 * Returns index of a data model binding. If it is part of a repeating group we return it on the form {group1-index}-{group2-index}-{groupN-index}
 * @param dataModelBinding the data model binding
 */
export function getIndex(dataModelBinding: string) {
  let start = dataModelBinding.indexOf('[');
  if (start > -1) {
    let index = '';
    while (start > -1) {
      index += dataModelBinding.substring(start + 1, start + 2);
      start = dataModelBinding.indexOf('[', start + 1);
      if (start > -1) {
        index += '-';
      }
    }
    return index;
  }
  return null;
}

function addValidation(
  componentValidations: IComponentBindingValidation,
  validation: IValidationIssue,
  textResources: ITextResource[],
): IComponentBindingValidation {
  const updatedValidations: IComponentBindingValidation = {
    errors: componentValidations?.errors || [],
    warnings: componentValidations?.warnings || [],
    fixed: componentValidations?.fixed || [],
    success: componentValidations?.success || [],
    info: componentValidations?.info || [],
  };

  switch (validation.severity) {
    case Severity.Error: {
      updatedValidations.errors.push(
        getTextResourceByKey(validation.description, textResources),
      );
      break;
    }
    case Severity.Warning: {
      updatedValidations.warnings.push(
        getTextResourceByKey(validation.description, textResources),
      );
      break;
    }
    case Severity.Fixed: {
      updatedValidations.fixed.push(
        getTextResourceByKey(validation.description, textResources),
      );
      break;
    }
    case Severity.Success: {
      updatedValidations.success.push(
        getTextResourceByKey(validation.description, textResources),
      );
      break;
    }
    case Severity.Informational: {
      updatedValidations.info.push(
        getTextResourceByKey(validation.description, textResources),
      );
      break;
    }
    default:
      break;
  }

  Object.keys(updatedValidations).forEach((key) => {
    if (!updatedValidations[key] || updatedValidations[key].length === 0) {
      delete updatedValidations[key];
    }
  });

  return updatedValidations;
}

/**
 * gets unmapped errors from validations as string array
 * @param validations the validations
 */
export function getUnmappedErrors(validations: IValidations): string[] {
  const messages: string[] = [];
  if (!validations) {
    return messages;
  }
  Object.keys(validations).forEach((layout: string) => {
    Object.keys(validations[layout]?.unmapped || {}).forEach((key: string) => {
      validations[layout].unmapped[key]?.errors?.forEach((message) => {
        messages.push(message);
      });
    });
  });
  return messages;
}

export interface FlatError {
  layout: string;
  componentId: string;
  message: string;
}

/**
 * Gets all mapped errors as flat array
 */
export const getMappedErrors = (validations: IValidations): FlatError[] => {
  const errors: FlatError[] = [];

  for (const layout in validations) {
    for (const componentId in validations[layout]) {
      if (componentId === 'unmapped') {
        continue;
      }

      const validationObject = validations[layout][componentId];
      for (const fieldKey in validationObject) {
        for (const message of validationObject[fieldKey].errors || []) {
          errors.push({
            layout,
            componentId,
            message,
          });
        }
      }
    }
  }

  return errors;
};

/**
 * Returns true if there are errors in the form at all (faster than getting all mapped/unmapped errors)
 * When this returns true, ErrorReport.tsx should be displayed
 */
export const getFormHasErrors = (validations: IValidations): boolean => {
  for (const layout in validations) {
    for (const key in validations[layout]) {
      const validationObject = validations[layout][key];
      for (const fieldKey in validationObject) {
        const fieldValidationErrors = validationObject[fieldKey].errors;
        if (fieldValidationErrors && fieldValidationErrors.length > 0) {
          return true;
        }
      }
    }
  }
  return false;
};

/**
 * checks if a validation contains any errors of a given severity.
 * @param validations the validations
 * @param severity the severity
 */
export function hasValidationsOfSeverity(
  validations: IValidations,
  severity: Severity,
): boolean {
  if (!validations) {
    return false;
  }

  return Object.keys(validations).some((layout) => {
    return Object.keys(validations[layout]).some((componentKey: string) => {
      return Object.keys(validations[layout][componentKey] || {}).some(
        (bindingKey: string) => {
          if (
            severity === Severity.Error &&
            validations[layout][componentKey][bindingKey].errors?.length > 0
          ) {
            return true;
          }
          return (
            severity === Severity.Warning &&
            validations[layout][componentKey][bindingKey].warnings?.length > 0
          );
        },
      );
    });
  });
}

/*
  Checks if a given component has any validation errors. Returns true/false.
*/
export function componentHasValidations(
  validations: IValidations,
  layoutKey: string,
  componentId: string,
): boolean {
  if (!validations || !componentId) {
    return false;
  }
  return Object.keys(validations[layoutKey]?.[componentId] || {})?.some(
    (bindingKey: string) => {
      return validations[layoutKey][componentId][bindingKey].errors?.length > 0;
    },
  );
}

/*
  Checks if a given repeating group has any child components with errors.
*/
export function repeatingGroupHasValidations(
  group: ILayoutGroup,
  repeatingGroupComponents: Array<Array<ILayoutGroup | ILayoutComponent>>,
  validations: IValidations,
  currentView: string,
  repeatingGroups: IRepeatingGroups,
  layout: ILayout,
  hiddenFields?: string[],
): boolean {
  if (!group || !validations || !layout) {
    return false;
  }

  return repeatingGroupComponents.some(
    (
      groupIndexArray: Array<ILayoutGroup | ILayoutComponent>,
      index: number,
    ) => {
      return groupIndexArray.some((element) => {
        if (element.type !== 'Group') {
          return componentHasValidations(validations, currentView, element.id);
        }

        if (!element.dataModelBindings?.group) {
          return false;
        }
        const childGroupIndex = repeatingGroups[element.id]?.index;
        const childGroupComponents = layout.filter(
          (childElement) => element.children?.indexOf(childElement.id) > -1,
        );
        const renderComponents = setupGroupComponents(
          childGroupComponents,
          element.dataModelBindings?.group,
          index,
        );
        const deepCopyComponents = createRepeatingGroupComponents(
          element,
          renderComponents,
          childGroupIndex,
          [],
          hiddenFields,
        );
        return repeatingGroupHasValidations(
          element,
          deepCopyComponents,
          validations,
          currentView,
          repeatingGroups,
          layout,
          hiddenFields,
        );
      });
    },
  );
}

export function mergeValidationObjects(
  ...sources: (IValidations | null)[]
): IValidations {
  const validations: IValidations = {};
  if (!sources?.length) {
    return validations;
  }

  sources.forEach((source: IValidations | null) => {
    if (source === null) {
      return;
    }
    Object.keys(source).forEach((layout: string) => {
      validations[layout] = mergeLayoutValidations(
        validations[layout] || {},
        source[layout] || {},
      );
    });
  });

  return validations;
}

export function mergeLayoutValidations(
  currentLayoutValidations: ILayoutValidations,
  newLayoutValidations: ILayoutValidations,
): ILayoutValidations {
  const mergedValidations: ILayoutValidations = { ...currentLayoutValidations };
  Object.keys(newLayoutValidations).forEach((component) => {
    mergedValidations[component] = mergeComponentValidations(
      currentLayoutValidations[component] || {},
      newLayoutValidations[component] || {},
    );
  });
  return mergedValidations;
}

export function mergeComponentValidations(
  currentComponentValidations: IComponentValidations,
  newComponentValidations: IComponentValidations,
): IComponentValidations {
  const mergedValidations: IComponentValidations = {
    ...currentComponentValidations,
  };
  Object.keys(newComponentValidations).forEach((binding) => {
    mergedValidations[binding] = mergeComponentBindingValidations(
      currentComponentValidations[binding],
      newComponentValidations[binding],
    );
  });
  return mergedValidations;
}

export function mergeComponentBindingValidations(
  existingValidations?: IComponentBindingValidation,
  newValidations?: IComponentBindingValidation,
): IComponentBindingValidation {
  const existingErrors = existingValidations?.errors || [];
  const existingWarnings = existingValidations?.warnings || [];
  const existingInfo = existingValidations?.info || [];
  const existingSuccess = existingValidations?.success || [];

  // Only merge items that are not already in the existing components errors/warnings array
  const uniqueNewErrors = getUniqueNewElements(
    existingErrors,
    newValidations?.errors,
  );
  const uniqueNewWarnings = getUniqueNewElements(
    existingWarnings,
    newValidations?.warnings,
  );
  const uniqueNewInfo = getUniqueNewElements(
    existingInfo,
    newValidations?.info,
  );
  const uniqueNewSuccess = getUniqueNewElements(
    existingSuccess,
    newValidations?.success,
  );

  const merged = {
    errors: removeFixedValidations(
      existingErrors.concat(uniqueNewErrors),
      newValidations?.fixed,
    ),
    warnings: removeFixedValidations(
      existingWarnings.concat(uniqueNewWarnings),
      newValidations?.fixed,
    ),
    info: removeFixedValidations(
      existingInfo.concat(uniqueNewInfo),
      newValidations?.fixed,
    ),
    success: removeFixedValidations(
      existingSuccess.concat(uniqueNewSuccess),
      newValidations?.fixed,
    ),
  };

  Object.keys(merged).forEach((key) => {
    if (!merged[key] || merged[key].length === 0) {
      delete merged[key];
    }
  });

  return merged;
}

export function getUniqueNewElements(
  originalArray: string[],
  newArray?: string[],
) {
  if (!newArray || newArray.length === 0) {
    return [];
  }

  if (originalArray.length === 0) {
    return newArray;
  }

  return newArray.filter(
    (element) =>
      originalArray.findIndex(
        (existingElement) => existingElement === element,
      ) < 0,
  );
}

function removeFixedValidations(
  validations?: string[],
  fixed?: string[],
): string[] {
  if (!fixed || fixed.length === 0) {
    return validations;
  }

  return validations.filter((element) => {
    return fixed.findIndex((fixedElement) => fixedElement === element) < 0;
  });
}

/**
 * Validates a specific group. Validates all rows, with all child components and child groups.
 * @param groupId the group to validate
 * @param state the current state
 * @returns validations for a given group
 */
export function validateGroup(
  groupId: string,
  state: IRuntimeState,
): IValidations {
  const language = state.language.language;
  const textResources = state.textResources.resources;
  const hiddenFields = state.formLayout.uiConfig.hiddenFields;
  const attachments = state.attachments.attachments;
  const repeatingGroups = state.formLayout.uiConfig.repeatingGroups;
  const formData = state.formData.formData;
  const jsonFormData = convertDataBindingToModel(formData);
  const currentView = state.formLayout.uiConfig.currentView;
  const currentLayout = state.formLayout.layouts[currentView];

  const instanceContext = buildInstanceContext(state.instanceData?.instance);
  const resolvedLayout = resolvedNodesInLayout(currentLayout, repeatingGroups, {
    formData,
    instanceContext,
    applicationSettings: state.applicationSettings?.applicationSettings,
  });

  const node = resolvedLayout.findById(groupId);
  if (!node) {
    return {};
  }

  const currentDataTaskDataTypeId = getDataTaskDataTypeId(
    state.instanceData.instance.process.currentTask.elementId,
    state.applicationMetadata.applicationMetadata.dataTypes,
  );
  const validator = getValidator(
    currentDataTaskDataTypeId,
    state.formDataModel.schemas,
  );
  const emptyFieldsValidations = validateEmptyFieldsForNodes(
    formData,
    node,
    language,
    hiddenFields,
    textResources,
  );
  const componentValidations = validateFormComponentsForNodes(
    attachments,
    node,
    formData,
    language,
    hiddenFields,
  );
  const formDataValidations = validateFormDataForLayout(
    jsonFormData,
    node,
    currentView,
    validator,
    language,
    textResources,
  ).validations;

  return mergeValidationObjects(
    { [currentView]: emptyFieldsValidations },
    { [currentView]: componentValidations },
    formDataValidations,
  );
}

/*
 * Removes the validations for a given group index and shifts higher indexes if necessary.
 * @param id the group id
 * @param index the index to remove
 * @param currentLayout the current layout
 * @param layout the layout state
 * @param repeatingGroups the repeating groups
 * @param validations the current validations
 * @returns a new validation object with the validations for the given group index removed
 */
export function removeGroupValidationsByIndex(
  id: string,
  index: number,
  currentLayout: string,
  layout: ILayouts,
  repeatingGroups: IRepeatingGroups,
  validations: IValidations,
  shift = true,
): IValidations {
  if (!validations[currentLayout]) {
    return validations;
  }
  let result = JSON.parse(JSON.stringify(validations));
  const indexedId = `${id}-${index}`;
  const repeatingGroup = repeatingGroups[id];
  delete result[currentLayout][indexedId];
  const children = getGroupChildren(
    repeatingGroup.baseGroupId || id,
    layout[currentLayout],
  );
  const parentGroup = getParentGroup(
    repeatingGroup.baseGroupId || id,
    layout[currentLayout],
  );

  // Remove validations for child elements on given index
  children?.forEach((element) => {
    let childKey;
    if (parentGroup) {
      const splitId = id.split('-');
      const parentIndex = splitId[splitId.length - 1];
      childKey = `${element.id}-${parentIndex}-${index}`;
    } else {
      childKey = `${element.id}-${index}`;
    }
    if (element.type !== 'Group') {
      // delete component directly
      delete result[currentLayout][childKey];
    } else {
      // recursively call delete if we have a child group
      const childGroupCount = repeatingGroups[`${element.id}-${index}`]?.index;
      for (let i = 0; i <= childGroupCount; i++) {
        result = removeGroupValidationsByIndex(
          `${element.id}-${index}`,
          i,
          currentLayout,
          layout,
          repeatingGroups,
          result,
          false,
        );
      }
    }
  });

  // Shift validations if necessary
  if (shift && index < repeatingGroup.index + 1) {
    for (let i = index + 1; i <= repeatingGroup.index + 1; i++) {
      const key = `${id}-${i}`;
      const newKey = `${id}-${i - 1}`;
      delete result[currentLayout][key];
      result[currentLayout][newKey] = validations[currentLayout][key];
      children?.forEach((element) => {
        let childKey;
        let shiftKey;
        if (parentGroup) {
          const splitId = id.split('-');
          const parentIndex = splitId[splitId.length - 1];
          childKey = `${element.id}-${parentIndex}-${i}`;
          shiftKey = `${element.id}-${parentIndex}-${i - 1}`;
        } else {
          childKey = `${element.id}-${i}`;
          shiftKey = `${element.id}-${i - 1}`;
        }
        if (element.type !== 'Group') {
          delete result[currentLayout][childKey];
          result[currentLayout][shiftKey] =
            validations[currentLayout][childKey];
        } else {
          result = shiftChildGroupValidation(
            element,
            i,
            result,
            repeatingGroups,
            layout[currentLayout],
            currentLayout,
          );
        }
      });
    }
  }

  return result;
}

function shiftChildGroupValidation(
  group: ILayoutGroup,
  indexToShiftFrom: number,
  validations: IValidations,
  repeatingGroups: IRepeatingGroups,
  layout: ILayout,
  currentLayout: string,
) {
  const result = JSON.parse(JSON.stringify(validations));
  const highestIndexOfChildGroup = getHighestIndexOfChildGroup(
    group.id,
    repeatingGroups,
  );
  const children = getGroupChildren(group.id, layout);

  for (let i = indexToShiftFrom; i <= highestIndexOfChildGroup + 1; i++) {
    const givenIndexCount = repeatingGroups[`${group.id}-${i}`]?.index ?? -1;
    for (let childIndex = 0; childIndex < givenIndexCount + 1; childIndex++) {
      const childGroupKey = `${group.id}-${i}-${childIndex}`;
      const shiftGroupKey = `${group.id}-${i - 1}-${childIndex}`;
      delete result[currentLayout][childGroupKey];
      result[currentLayout][shiftGroupKey] =
        validations[currentLayout][childGroupKey];
      children?.forEach((child) => {
        const childKey = `${child.id}-${i}-${childIndex}`;
        const shiftKey = `${child.id}-${i - 1}-${childIndex}`;
        delete result[currentLayout][childKey];
        result[currentLayout][shiftKey] = validations[currentLayout][childKey];
      });
    }
  }
  return result;
}

export function getHighestIndexOfChildGroup(
  group: string,
  repeatingGroups: IRepeatingGroups,
) {
  if (!group || !repeatingGroups) {
    return -1;
  }
  let index = 0;
  while (repeatingGroups[`${group}-${index}`]?.index !== undefined) {
    index += 1;
  }
  return index - 1;
}

export function missingFieldsInLayoutValidations(
  layoutValidations: ILayoutValidations,
  language: ILanguage,
): boolean {
  let result = false;
  let requiredMessage: string = getLanguageFromKey(
    'form_filler.error_required',
    language,
  );
  // Strip away parametrized part of error message, as this will vary with each component.
  requiredMessage = requiredMessage.substring(
    0,
    requiredMessage.indexOf('{0}'),
  );
  const lookForRequiredMsg = (e: any) => {
    if (typeof e === 'string') {
      return e.includes(requiredMessage);
    }
    if (Array.isArray(e)) {
      return e.findIndex(lookForRequiredMsg) > -1;
    }
    return (e?.props?.children as string).includes(requiredMessage);
  };

  Object.keys(layoutValidations).forEach((component: string) => {
    if (!layoutValidations[component]) return;
    if (result) return;
    Object.keys(layoutValidations[component]).forEach((binding: string) => {
      if (!layoutValidations[component][binding]) return;
      if (result) return;

      const errors = layoutValidations[component][binding].errors;
      result =
        errors &&
        errors.length > 0 &&
        errors.findIndex(lookForRequiredMsg) > -1;
    });
  });

  return result;
}
