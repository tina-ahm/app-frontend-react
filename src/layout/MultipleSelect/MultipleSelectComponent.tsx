import React from 'react';

import { Combobox } from '@digdir/design-system-react';

import { FD } from 'src/features/formData/FormDataWrite';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useGetOptions } from 'src/features/options/useGetOptions';
import type { PropsFromGenericComponent } from 'src/layout';

export type IMultipleSelectProps = PropsFromGenericComponent<'MultipleSelect'>;
export function MultipleSelectComponent({ node, isValid, overrideDisplay }: IMultipleSelectProps) {
  const { id, readOnly, textResourceBindings } = node.item;
  const debounce = FD.useDebounceImmediately();
  const { options, currentStringy, setData } = useGetOptions({
    ...node.item,
    node,
    removeDuplicates: true,
    valueType: 'multi',
  });
  const { langAsString } = useLanguage();

  return (
    <Combobox
      id={id}
      multiple
      virtual
      value={currentStringy}
      onValueChange={(value) => setData(value)}
      onBlur={debounce}
      disabled={readOnly}
      error={!isValid}
      label={langAsString('general.choose')}
      hideLabel={true}
      aria-label={overrideDisplay?.renderedInTable ? langAsString(textResourceBindings?.title) : undefined}
    >
      {options.map((option) => (
        <Combobox.Option
          key={option.value}
          value={option.value}
          displayValue={langAsString(option?.label)}
          description={langAsString(option.description)}
        >
          <Lang id={option?.label} />
        </Combobox.Option>
      ))}
    </Combobox>
  );
}
