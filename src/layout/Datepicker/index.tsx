import React from 'react';

import { DatepickerComponent } from 'src/layout/Datepicker/DatepickerComponent';
import { LayoutComponent } from 'src/layout/LayoutComponent';
import { getDateFormat } from 'src/utils/dateHelpers';
import { formatISOString } from 'src/utils/formatDate';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';

export class Datepicker extends LayoutComponent<'Datepicker'> {
  render(props): JSX.Element | null {
    return <DatepickerComponent {...props} />;
  }

  getSummaryData({ targetNode, lookups }: SummaryRendererProps<'Datepicker'>): string {
    if (!targetNode.item.dataModelBindings?.simpleBinding) {
      return '';
    }

    const dateFormat = getDateFormat(targetNode.item.format);
    const data = lookups.formData[targetNode.item.dataModelBindings?.simpleBinding] || '';
    return formatISOString(data, dateFormat) ?? data;
  }

  renderSummary(_props: SummaryRendererProps<'Datepicker'>): JSX.Element | null {
    // TODO: Implement
    return <span>Nothing implemented yet</span>;
  }
}
