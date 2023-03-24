import React from 'react';
import type { PropsWithChildren } from 'react';

import { Table, TableBody, TableCell, TableHeader, TableRow } from '@digdir/design-system-react';
import cn from 'classnames';

import { ConditionalWrapper } from 'src/components/ConditionalWrapper';
import { FullWidthWrapper } from 'src/features/form/components/FullWidthWrapper';
import { GenericComponent } from 'src/layout/GenericComponent';
import css from 'src/layout/Grid/Grid.module.css';
import { getColumnStylesGrid } from 'src/utils/formComponentUtils';
import { useResolvedNode } from 'src/utils/layout/ExprContext';
import { LayoutPage } from 'src/utils/layout/hierarchy';
import type { PropsFromGenericComponent } from 'src/layout';
import type { GridRow } from 'src/layout/Grid/types';
import type { ITableColumnFormatting, ITableColumnProperties } from 'src/layout/layout';

export function GridComponent({ node }: PropsFromGenericComponent<'Grid'>) {
  const { rows } = node.item;
  const shouldHaveFullWidth = node.parent instanceof LayoutPage;
  const columnSettings: ITableColumnFormatting = {};

  return (
    <ConditionalWrapper
      condition={shouldHaveFullWidth}
      wrapper={(child) => <FullWidthWrapper>{child}</FullWidthWrapper>}
    >
      <Table>
        {rows.map((row, rowIdx) => (
          <Row
            key={rowIdx}
            header={row.header}
            readOnly={row.readOnly}
          >
            {row.cells.map((cell, cellIdx) => {
              const isFirst = cellIdx === 0;
              const isLast = cellIdx === row.cells.length - 1;
              const className = cn({
                [css.fullWidthCellFirst]: isFirst,
                [css.fullWidthCellLast]: isLast,
              });

              if (row.header && cell && 'columnOptions' in cell && cell.columnOptions) {
                columnSettings[cellIdx] = cell.columnOptions;
                console.log(columnSettings);
              }

              if (cell && 'text' in cell) {
                return (
                  <CellWithText
                    key={cell.text}
                    className={className}
                    columnStyleOptions={columnSettings[cellIdx]}
                  >
                    {cell.text}
                  </CellWithText>
                );
              }

              const componentId = cell && 'id' in cell && typeof cell.id === 'string' ? cell.id : undefined;
              return (
                <CellWithComponent
                  key={componentId || `${rowIdx}-${cellIdx}`}
                  id={componentId}
                  className={className}
                  columnStyleOptions={columnSettings[cellIdx]}
                />
              );
            })}
          </Row>
        ))}
      </Table>
    </ConditionalWrapper>
  );
}

type RowProps = PropsWithChildren<Pick<GridRow<any>, 'header' | 'readOnly'>>;

function Row({ header, readOnly, children }: RowProps) {
  const className = readOnly ? css.rowReadOnly : undefined;

  // PRIORITY: Do not duplicate TableHeader/TableBody elements?
  if (header) {
    return (
      <TableHeader>
        <TableRow className={className}>{children}</TableRow>
      </TableHeader>
    );
  }

  return (
    <TableBody>
      <TableRow className={className}>{children}</TableRow>
    </TableBody>
  );
}

interface CellProps {
  className?: string;
  columnStyleOptions?: ITableColumnProperties;
}

interface CellWithComponentProps extends CellProps {
  id?: string;
}

function CellWithComponent({ id, className, columnStyleOptions }: CellWithComponentProps) {
  const node = useResolvedNode(id);
  if (node && !node.isHidden()) {
    const columnStyles = columnStyleOptions && getColumnStylesGrid(columnStyleOptions);
    return (
      <TableCell
        className={cn(css.tableCellFormatting, className)}
        style={columnStyles}
      >
        <GenericComponent
          node={node}
          overrideDisplay={{
            renderLabel: false,
            renderLegend: false,
            renderCheckboxRadioLabelsWhenOnlyOne: false,
          }}
        />
      </TableCell>
    );
  }

  return <TableCell className={className} />;
}

type CellWithTextProps = CellProps & PropsWithChildren;

function CellWithText({ children, className, columnStyleOptions }: CellWithTextProps) {
  const columnStyles = columnStyleOptions && getColumnStylesGrid(columnStyleOptions);
  return (
    <TableCell
      className={cn(css.tableCellFormatting, className)}
      style={columnStyles}
    >
      <span
        className={css.contentFormatting}
        style={columnStyles}
      >
        {children}
      </span>
    </TableCell>
  );
}
