import React from 'react';

import { LayoutComponent } from 'src/layout/LayoutComponent';
import { LikertComponent } from 'src/layout/Likert/LikertComponent';
import { LayoutStyle } from 'src/types';
import { selectedValueToSummaryText } from 'src/utils/formComponentUtils';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';

export class Likert extends LayoutComponent<'Likert'> {
  render(props: PropsFromGenericComponent<'Likert'>): JSX.Element | null {
    return <LikertComponent {...props} />;
  }

  override directRender(props: PropsFromGenericComponent<'Likert'>): boolean {
    return props.layout === LayoutStyle.Table;
  }

  override renderWithLabel(): boolean {
    return false;
  }

  getSummaryData({ targetNode, lookups }: SummaryRendererProps<'Likert'>): string {
    if (!targetNode.item.dataModelBindings?.simpleBinding) {
      return '';
    }

    const value = lookups.formData[targetNode.item.dataModelBindings.simpleBinding] || '';
    return selectedValueToSummaryText(targetNode.item, value, lookups) || '';
  }

  renderSummary(_props: SummaryRendererProps<'Likert'>): JSX.Element | null {
    // TODO: Implement
    return <span>Nothing implemented yet</span>;
  }
}
