import React from 'react';

import { CustomWebComponent } from 'src/layout/Custom/CustomWebComponent';
import { LayoutComponent } from 'src/layout/LayoutComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';

export class Custom extends LayoutComponent<'Custom'> {
  render(props: PropsFromGenericComponent<'Custom'>): JSX.Element | null {
    return <CustomWebComponent {...props} />;
  }

  override renderWithLabel(): boolean {
    return false;
  }

  getSummaryData(_props: SummaryRendererProps<'Custom'>): string {
    // TODO: Implement
    return '';
  }

  renderSummary(_props: SummaryRendererProps<'Custom'>): JSX.Element | null {
    // TODO: Implement
    return null;
  }
}
