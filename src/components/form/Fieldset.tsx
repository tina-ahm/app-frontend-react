import React from 'react';
import type { HTMLAttributes } from 'react';

import { Fieldset as DSFieldset } from '@digdir/designsystemet-react';

import { Description } from 'src/components/form/Description';
import classes from 'src/components/form/Fieldset.module.css';
import { HelpTextContainer } from 'src/components/form/HelpTextContainer';
import { OptionalIndicator } from 'src/components/form/OptionalIndicator';
import { RequiredIndicator } from 'src/components/form/RequiredIndicator';
import { useLanguage } from 'src/features/language/useLanguage';
import type { ILabelSettings } from 'src/layout/common.generated';

export type FieldsetProps = {
  legend?: React.ReactNode;
  description?: React.ReactNode;
  helpText?: React.ReactNode;
  required?: boolean;
  labelSettings?: ILabelSettings;
} & HTMLAttributes<HTMLFieldSetElement>;

export const Fieldset = ({
  legend,
  description,
  helpText,
  required,
  labelSettings,
  children,
  id,
  ...rest
}: FieldsetProps) => {
  const { elementAsString } = useLanguage();
  const legendAsText = elementAsString(legend);
  return (
    <DSFieldset
      size='sm'
      hideLegend={!legend}
      legend={
        <div className={classes.legendContent}>
          {legend}
          <RequiredIndicator required={required} />
          <OptionalIndicator
            readOnly={false}
            required={required}
            showOptionalMarking={!!labelSettings?.optionalIndicator}
          />
          {helpText && (
            <HelpTextContainer
              helpText={helpText}
              title={legendAsText}
            />
          )}
        </div>
      }
      description={
        description ? (
          <Description
            componentId={id}
            description={description}
            className={classes.description}
          />
        ) : undefined
      }
      {...rest}
    >
      {children}
    </DSFieldset>
  );
};
