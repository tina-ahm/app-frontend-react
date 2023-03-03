import React from 'react';

import { AddressComponent } from 'src/layout/Address/AddressComponent';
import { LayoutComponent } from 'src/layout/LayoutComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';

export class Address extends LayoutComponent<'AddressComponent'> {
  render(props: PropsFromGenericComponent<'AddressComponent'>): JSX.Element | null {
    return <AddressComponent {...props} />;
  }

  override renderWithLabel(): boolean {
    return false;
  }

  getSummaryData(_props: SummaryRendererProps<'AddressComponent'>): string {
    // TODO: Implement
    return '';
  }

  renderSummary(_props: SummaryRendererProps<'AddressComponent'>): JSX.Element | null {
    // TODO: Implement
    return null;
  }
}
