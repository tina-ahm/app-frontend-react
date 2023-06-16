import React from 'react';

import { AltinnSpinner } from 'src/components/AltinnSpinner';
import { OptionalIndicator } from 'src/components/form/OptionalIndicator';
import { RadioButton } from 'src/components/form/RadioButton';
import { RadioGroup } from 'src/components/form/RadioGroup';
import { RequiredIndicator } from 'src/components/form/RequiredIndicator';
import { useRadioButtons } from 'src/layout/RadioButtons/radioButtonsUtils';
import { shouldUseRowLayout } from 'src/utils/layout';
import type { IRadioButtonsContainerProps } from 'src/layout/RadioButtons/RadioButtonsContainerComponent';

export type IControlledRadioGroupProps = IRadioButtonsContainerProps;

export const ControlledRadioGroup = (props: IControlledRadioGroupProps) => {
  const { node, getTextResource, text, language, isValid, overrideDisplay, getTextResourceAsString } = props;
  const { id, layout, readOnly, textResourceBindings, required, labelSettings, showAsCard } = node.item;
  const { selected, handleChange, handleBlur, fetchingOptions, calculatedOptions } = useRadioButtons(props);

  const labelText = (
    <span style={{ fontSize: '1rem', wordBreak: 'break-word' }}>
      {text}
      <RequiredIndicator
        required={required}
        language={language}
      />
      <OptionalIndicator
        labelSettings={labelSettings}
        language={language}
        required={required}
      />
    </span>
  );

  const hideLabel = overrideDisplay?.renderedInTable === true && calculatedOptions.length === 1;

  return (
    <div>
      {fetchingOptions ? (
        <AltinnSpinner />
      ) : (
        <div
          id={id}
          onBlur={handleBlur}
        >
          <RadioGroup
            legend={overrideDisplay?.renderLegend === false ? null : labelText}
            description={textResourceBindings?.description && getTextResource(textResourceBindings.description)}
            helpText={textResourceBindings?.help && getTextResource(textResourceBindings.help)}
            shouldDisplayHorizontally={shouldUseRowLayout({
              layout,
              optionsCount: calculatedOptions.length,
            })}
          >
            {calculatedOptions.map((option) => (
              <RadioButton
                {...option}
                label={hideLabel ? getTextResourceAsString(option.label) : getTextResource(option.label)}
                name={id}
                key={option.value}
                checked={option.value === selected}
                showAsCard={showAsCard}
                error={!isValid}
                disabled={readOnly}
                onChange={handleChange}
                hideLabel={hideLabel}
                size='small'
              />
            ))}
          </RadioGroup>
        </div>
      )}
    </div>
  );
};
