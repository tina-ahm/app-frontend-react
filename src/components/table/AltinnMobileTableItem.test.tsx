import React from 'react';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AltinnMobileTableItem } from 'src/components/table/AltinnMobileTableItem';
import { renderWithProviders } from 'src/testUtils';
import type { IAltinnMobileTableItemProps, IMobileTableItem } from 'src/components/table/AltinnMobileTableItem';
import type { ILanguage } from 'src/types/shared';

const user = userEvent.setup();

describe('AltinnMobileTableItem', () => {
  it('triggers onEditClick when editbutton is present and clicked', async () => {
    const onEditClick = jest.fn();
    render({
      onEditClick,
    });

    await user.click(
      screen.getByRole('button', {
        name: /edit-value1/i,
      }),
    );

    expect(onEditClick).toHaveBeenCalledTimes(1);
  });
});

const render = (props: Partial<IAltinnMobileTableItemProps> = {}) => {
  const items = [
    { key: 'test1', label: 'label1', value: 'value1' },
    { key: 'test2', label: 'label2', value: 'value2' },
  ] as IMobileTableItem[];

  const language: ILanguage = {
    general: {
      delete: 'Delete',
      edit_alt: 'Edit',
    },
  };

  const allProps = {
    items,
    onEditClick: jest.fn(),
    onDeleteClick: jest.fn(),
    editIconNode: ' i ',
    editButtonText: 'Edit',
    language,
    ...props,
  } as IAltinnMobileTableItemProps;

  return renderWithProviders(<AltinnMobileTableItem {...allProps} />);
};
