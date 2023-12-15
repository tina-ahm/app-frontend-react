import React, { useEffect } from 'react';

import { Button } from '@digdir/design-system-react';
import { Grid } from '@material-ui/core';
import { Add as AddIcon } from '@navikt/ds-icons';

import { ConditionalWrapper } from 'src/components/ConditionalWrapper';
import { FullWidthWrapper } from 'src/components/form/FullWidthWrapper';
import { useLanguage } from 'src/features/language/useLanguage';
import { Triggers } from 'src/layout/common.generated';
import { useRepeatingGroup } from 'src/layout/Group/RepeatingGroupContext';
import { RepeatingGroupsEditContainer } from 'src/layout/Group/RepeatingGroupsEditContainer';
import { useRepeatingGroupsFocusContext } from 'src/layout/Group/RepeatingGroupsFocusContext';
import { RepeatingGroupTable } from 'src/layout/Group/RepeatingGroupTable';
import { BaseLayoutNode } from 'src/utils/layout/LayoutNode';
import { renderValidationMessagesForComponent } from 'src/utils/render';
import type { CompGroupRepeatingInternal } from 'src/layout/Group/config.generated';
import type { LayoutNodeForGroup } from 'src/layout/Group/LayoutNodeForGroup';

export interface IRepGroupProps {
  node: LayoutNodeForGroup<CompGroupRepeatingInternal>;
}

const getValidationMethod = (node: LayoutNodeForGroup<CompGroupRepeatingInternal>) => {
  // Validation for whole group takes precedent over single-row validation if both are present.
  const triggers = node.item.triggers;
  if (triggers && triggers.includes(Triggers.Validation)) {
    return Triggers.Validation;
  }
  if (triggers && triggers.includes(Triggers.ValidateRow)) {
    return Triggers.ValidateRow;
  }
};

export function RepeatingGroupContainer({ node }: IRepGroupProps): JSX.Element | null {
  const { triggerFocus } = useRepeatingGroupsFocusContext();
  const resolvedTextBindings = node.item.textResourceBindings;
  const id = node.item.id;
  const edit = node.item.edit;
  const { isEditingAnyRow, addRow } = useRepeatingGroup();

  const numRows = node.item.rows.length;
  const lastIndex = numRows - 1;
  const { lang, langAsString } = useLanguage();

  const AddButton = (): JSX.Element => (
    <Button
      id={`add-button-${id}`}
      onClick={handleOnAddButtonClick}
      onKeyUp={handleOnAddKeypress}
      variant='secondary'
      icon={<AddIcon aria-hidden='true' />}
      iconPlacement='left'
      fullWidth
    >
      {resolvedTextBindings?.add_button_full
        ? lang(resolvedTextBindings.add_button_full)
        : `${langAsString('general.add_new')} ${langAsString(resolvedTextBindings?.add_button)}`}
    </Button>
  );

  const handleOnAddButtonClick = (): void => {
    addRow();
    triggerFocus(lastIndex + 1);
  };

  // Add new row if openByDefault is true and no rows exist. This also makes a new row appear
  // when the last row is deleted.
  useEffect((): void => {
    if (edit?.openByDefault === true && lastIndex === -1) {
      addRow();
    }
  }, [addRow, edit?.openByDefault, lastIndex]);

  const handleOnAddKeypress = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    const allowedKeys = ['enter', ' ', 'spacebar'];
    if (allowedKeys.includes(event.key.toLowerCase())) {
      addRow();
      triggerFocus(lastIndex + 1);
    }
  };

  if (node.isHidden() || node.item.type !== 'Group') {
    return null;
  }

  const isNested = node.parent instanceof BaseLayoutNode;

  const displayBtn =
    edit?.addButton !== false &&
    numRows < node.item.maxCount &&
    (edit?.mode === 'showAll' || !isEditingAnyRow || edit?.alwaysShowAddButton === true);

  return (
    <Grid
      container={true}
      item={true}
      data-componentid={node.item.id}
    >
      {(!edit?.mode ||
        edit?.mode === 'showTable' ||
        edit?.mode === 'onlyTable' ||
        (edit?.mode === 'hideTable' && !isEditingAnyRow)) && <RepeatingGroupTable />}
      {edit?.mode !== 'showAll' && displayBtn && <AddButton />}
      <ConditionalWrapper
        condition={!isNested}
        wrapper={(children) => <FullWidthWrapper>{children}</FullWidthWrapper>}
      >
        <>
          {isEditingAnyRow && edit?.mode === 'hideTable' && <RepeatingGroupsEditContainer />}
          {edit?.mode === 'showAll' &&
            // Generate array of length repeatingGroupIndex and iterate over indexes
            Array(numRows).map((_, index) => (
              <div
                key={index}
                style={{ width: '100%', marginBottom: !isNested && index == lastIndex ? 15 : 0 }}
              >
                <RepeatingGroupsEditContainer forceHideSaveButton={true} />
              </div>
            ))}
        </>
      </ConditionalWrapper>
      {edit?.mode === 'showAll' && displayBtn && <AddButton />}
      <Grid
        item={true}
        xs={12}
      >
        {node.getValidations('group') && renderValidationMessagesForComponent(node.getValidations('group'), id)}
      </Grid>
    </Grid>
  );
}
