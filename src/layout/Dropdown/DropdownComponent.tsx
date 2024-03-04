import React from 'react';

import { Combobox } from '@digdir/design-system-react';

import { AltinnSpinner } from 'src/components/AltinnSpinner';
import { FD } from 'src/features/formData/FormDataWrite';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useGetOptions } from 'src/features/options/useGetOptions';
import type { PropsFromGenericComponent } from 'src/layout';

export type IDropdownProps = PropsFromGenericComponent<'Dropdown'>;

export function DropdownComponent({ node, isValid, overrideDisplay }: IDropdownProps) {
  const { id, readOnly, textResourceBindings } = node.item;
  const { langAsString } = useLanguage();

  const debounce = FD.useDebounceImmediately();

  const { options, isFetching, currentStringy, current, setData } = useGetOptions({
    ...node.item,
    node,
    removeDuplicates: true,
    valueType: 'single',
  });

  if (isFetching) {
    return <AltinnSpinner />;
  }

  return (
    <Combobox
      id={id}
      onValueChange={(newValue) => {
        setData(newValue.at(0) ?? '');
      }}
      value={current ? [current?.value] : []}
      onBlur={debounce}
      readOnly={readOnly}
      error={!isValid}
      label={langAsString('general.choose')}
      hideLabel={true}
      aria-label={overrideDisplay?.renderedInTable ? langAsString(textResourceBindings?.title) : undefined}
    >
      <Combobox.Empty>test</Combobox.Empty>
      {options &&
        options?.map((option) => (
          <Combobox.Option
            key={option?.value}
            value={option?.value}
            displayValue={langAsString(option.label)}
            description={langAsString(option?.description)}
          >
            <Lang id={option?.label} />
          </Combobox.Option>
        ))}
    </Combobox>
  );
}
