import React from 'react';

import { LayoutComponent } from 'src/layout/LayoutComponent';
import { MapComponent } from 'src/layout/Map/MapComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';

export class Map extends LayoutComponent<'Map'> {
  render(props: PropsFromGenericComponent<'Map'>): JSX.Element | null {
    return <MapComponent {...props} />;
  }

  getSummaryData(_props: SummaryRendererProps<'Map'>): string {
    // TODO: Implement
    return '';
  }

  renderSummary(_props: SummaryRendererProps<'Map'>): JSX.Element | null {
    // TODO: Implement
    return null;
  }
}
