import React from 'react';

import { LayoutComponent } from 'src/layout/LayoutComponent';
import { ListComponent } from 'src/layout/List/ListComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';

export class List extends LayoutComponent<'List'> {
  render(props: PropsFromGenericComponent<'List'>): JSX.Element | null {
    return <ListComponent {...props} />;
  }

  override renderWithLabel(): boolean {
    return false;
  }

  getSummaryData(_props: SummaryRendererProps<'List'>): string {
    // TODO: Implement
    return '';
  }

  renderSummary(_props: SummaryRendererProps<'List'>): JSX.Element | null {
    // TODO: Implement
    return null;
  }
}
