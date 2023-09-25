import React from 'react';

import { HelpText, Radio } from '@digdir/design-system-react';

import { AltinnSpinner } from 'src/components/AltinnSpinner';
import { OptionalIndicator } from 'src/components/form/OptionalIndicator';
import { RadioButton } from 'src/components/form/RadioButton';
import { RequiredIndicator } from 'src/components/form/RequiredIndicator';
import { useLanguage } from 'src/hooks/useLanguage';
import { groupIsRepeatingLikert } from 'src/layout/Group/tools';
import { useRadioButtons } from 'src/layout/RadioButtons/radioButtonsUtils';
import { shouldUseRowLayout } from 'src/utils/layout';
import type { IRadioButtonsContainerProps } from 'src/layout/RadioButtons/RadioButtonsContainerComponent';

export type IControlledRadioGroupProps = IRadioButtonsContainerProps;

export const ControlledRadioGroup = (props: IControlledRadioGroupProps) => {
  const { node, isValid, overrideDisplay } = props;
  const { id, layout, readOnly, textResourceBindings, required, showAsCard } = node.item;
  const labelSettings = 'labelSettings' in node.item ? node.item.labelSettings : undefined;
  const { selected, handleChange, handleBlur, fetchingOptions, calculatedOptions } = useRadioButtons(props);
  const { lang, langAsString } = useLanguage();

  const getLabelPrefixForLikert = () => {
    if (
      node.parent.item.type === 'Group' &&
      groupIsRepeatingLikert(node.parent.item) &&
      node.parent.item.textResourceBindings?.leftColumnHeader
    ) {
      return `${langAsString(node.parent.item.textResourceBindings.leftColumnHeader)} `;
    }
    return null;
  };

  const labelText = (
    <span style={{ fontSize: '1rem', wordBreak: 'break-word' }}>
      {getLabelPrefixForLikert()}
      {lang(textResourceBindings?.title)}
      <RequiredIndicator required={required} />
      <OptionalIndicator
        labelSettings={labelSettings}
        required={required}
      />
    </span>
  );

  const hideLabel = overrideDisplay?.renderedInTable === true && calculatedOptions.length === 1;
  const shouldDisplayHorizontally = shouldUseRowLayout({
    layout,
    optionsCount: calculatedOptions.length,
  });

  return (
    <div>
      {fetchingOptions ? (
        <AltinnSpinner />
      ) : (
        <div
          id={id}
          onBlur={handleBlur}
        >
          <Radio.Group
            legend={
              overrideDisplay?.renderLegend === false ? null : (
                <>
                  {labelText}
                  {textResourceBindings?.help ? (
                    <HelpText title={langAsString(textResourceBindings?.help)}>
                      {lang(textResourceBindings?.help)}
                    </HelpText>
                  ) : null}
                </>
              )
            }
            description={lang(textResourceBindings?.description)}
            error={!isValid}
            disabled={readOnly}
            inline={shouldDisplayHorizontally}
            role='radiogroup'
          >
            {calculatedOptions.map((option) => (
              <RadioButton
                {...option}
                label={langAsString(option.label)}
                description={lang(option.description)}
                helpText={lang(option.helpText)}
                name={id}
                key={option.value}
                checked={option.value === selected}
                showAsCard={showAsCard}
                disabled={readOnly}
                onChange={handleChange}
                hideLabel={hideLabel}
                size='small'
              />
            ))}
          </Radio.Group>
        </div>
      )}
    </div>
  );
};
