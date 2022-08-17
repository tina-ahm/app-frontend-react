describe('textConversion', () => {
  const oldApiTextFormat = {
    id: 'ttd-frontend-test-nb',
    org: 'ttd',
    language: 'nb',
    resources: [
      {
        id: '37130.SkattemeldingEndringEtterFristPostdatadef37130.Label',
        value:
          'Post i RF-1030 Skattemelding for formues- og inntektsskatt som skal  endres',
      },
      {
        id: '37132.SkattemeldingEndringEtterFristNyttBelopdatadef37132.Label',
        value: '2\\. Endre verdi {0} til ',
        variables: [
          {
            key: 'Endringsmelding-grp-9786.OversiktOverEndringene-grp-9788[{0}].SkattemeldingEndringEtterFristOpprinneligBelop-datadef-37131.value',
            dataSource: 'dataModel.nested-group',
          },
        ],
      },
      {
        id: 'HintMellomnavn',
        value:
          'Mellomnavn må være et navn som kan benyttes som etternavn. Du har nå skrevet {0}',
        variables: [
          {
            key: 'NyttNavn-grp-9313.NyttNavn-grp-9314.PersonMellomnavnNytt-datadef-34759.value',
            dataSource: 'dataModel.ServiceModel-test',
          },
        ],
      },
      {
        id: 'confirm.body',
        value:
          'Vennligst vent, endrer navn til {1}. <br/> <br/> Du har startet instance: {2} for app: {3}. <br/> <br/>Trykk [her]({4}) for å starte på nytt.',
        variables: [
          {
            key: 'Innledning-grp-9309.Kontaktinformasjon-grp-9311.MelderFultnavn.value',
            dataSource: 'dataModel.ServiceModel-test',
          },
          {
            key: 'Innledning-grp-9309.NavneendringenGjelderFor-grp-9310.SubjektFornavnFolkeregistrert-datadef-34730.value',
            dataSource: 'dataModel.ServiceModel-test',
          },
          { key: 'instanceId', dataSource: 'instanceContext' },
          {
            key: 'appId',
            dataSource: 'instanceContext',
          },
          { key: 'appUrl', dataSource: 'applicationSettings' },
        ],
      },
      {
        id: 'error.testValue',
        value:
          "test er ikke en gyldig <a href='https://www.altinn.no/' target='_blank'>verdi</a>",
      },
      {
        id: 'startAgain',
        value:
          'Du har startet instance: {0} for app: {1}.<br/> <br/> Trykk [her]({2}) for å starte på nytt.',
        variables: [
          { key: 'instanceId', dataSource: 'instanceContext' },
          {
            key: 'appId',
            dataSource: 'instanceContext',
          },
          { key: 'appUrl', dataSource: 'applicationSettings' },
        ],
      },
      {
        id: 'optionsFromRepeatingGroup',
        value: 'Endre fra: {0}, Endre til: {1}',
        variables: [
          {
            key: 'Endringsmelding-grp-9786.OversiktOverEndringene-grp-9788[{0}].SkattemeldingEndringEtterFristOpprinneligBelop-datadef-37131.value',
            dataSource: 'dataModel.nested-group',
          },
          {
            key: 'Endringsmelding-grp-9786.OversiktOverEndringene-grp-9788[{0}].SkattemeldingEndringEtterFristNyttBelop-datadef-37132.value',
            dataSource: 'dataModel.nested-group',
          },
        ],
      },
    ],
  };
  const newApiTextFormat = {
    resource: {
      nb: {
        optionsFromRepeatingGroup:
          'Endre fra: ${{nested-group.SkattemeldingEndringEtterFristOpprinneligBelop}}, til: ${{nested-group.SkattemeldingEndringEtterFristNyttBelop}}',
        confirm: {
          body: 'Vennligst vent, endrer navn til ${{ServiceModel-test.updatedName}}. Du har startet instance: ${{instanceContext.instanceId}} for app: ${{instanceContext.appId}}. Trykk [her](${{applicationSettings.appUrl}}) for å starte på nytt.',
        },
      },
    },
    datamodel: {
      'nested-group': {
        SkattemeldingEndringEtterFristOpprinneligBelop:
          'Endringsmelding-grp-9786.OversiktOverEndringene-grp-9788[{0}].SkattemeldingEndringEtterFristOpprinneligBelop-datadef-37131.value',
        SkattemeldingEndringEtterFristNyttBelop:
          'Endringsmelding-grp-9786.OversiktOverEndringene-grp-9788[{0}].SkattemeldingEndringEtterFristNyttBelop-datadef-37132.value',
      },
      'ServiceModel-test': {
        SubjektFornavnFolkeregistrert:
          'Innledning-grp-9309.NavneendringenGjelderFor-grp-9310.SubjektFornavnFolkeregistrert-datadef-34730.value',
      },
    },
  };
  type ValuePair = { [key: string]: string };
  type NestedValuePair = {
    [key: string]: string | ValuePair | NestedValuePair;
  };
  type OldVariables = { key: string; dataSource: string }[];
  type OldLangResource = {
    id: string;
    value: string;
    variables?: OldVariables;
  };
  type UnclearAPIFormat = {
    id?: string;
    org?: string;
    language?: string;
    resources?: OldLangResource[];
    resource?: NestedValuePair;
    datamodel?: NestedValuePair;
  };

  interface OldApiFormat extends UnclearAPIFormat {
    language: string;
    resources: OldLangResource[];
    resource?: never;
    datamodel?: never;
  }
  interface NewAPI extends UnclearAPIFormat {
    id?: never;
    org?: never;
    language?: never;
    resources?: never;
    resource: NestedValuePair;
    datamodel?: NestedValuePair;
  }
  it('converts the text from the old format to the new format', () => {
    const convertToNewAPIFormat = function (apiFormat: UnclearAPIFormat) {
      if (!apiFormat.language) {
        // this is likely already the new format or something is wrong
        return apiFormat as NewAPI;
      }
      const oldFormat = apiFormat as OldApiFormat;
      const newResources = {
        [oldFormat.language]: {

        }
      }
      const newFormatBody: NewAPI = {
        resource: {
          [oldFormat.language]: {
            ...oldFormat.resources.flatMap((v: OldLangResource) => {
              console.log(v.variables);
              return { [v.id]: v.value };
            }),
          },
        },
      };

      return newFormatBody;
    };
    expect(convertToNewAPIFormat(oldApiTextFormat)).toStrictEqual(
      newApiTextFormat,
    );
  });
});
