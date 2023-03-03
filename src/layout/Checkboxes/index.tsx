import React from 'react';

import { CheckboxContainerComponent } from 'src/layout/Checkboxes/CheckboxesContainerComponent';
import { LayoutComponent } from 'src/layout/LayoutComponent';
import { commaSeparatedToSummaryValues } from 'src/utils/formComponentUtils';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';

export class Checkboxes extends LayoutComponent<'Checkboxes', { [key: string]: string }> {
  render(props: PropsFromGenericComponent<'Checkboxes'>): JSX.Element | null {
    return <CheckboxContainerComponent {...props} />;
  }

  override renderWithLabel(): boolean {
    return false;
  }

  getSummaryData({ targetNode, lookups }: SummaryRendererProps<'Checkboxes'>): { [key: string]: string } {
    if (!targetNode.item.dataModelBindings?.simpleBinding) {
      return {};
    }

    const value = lookups.formData[targetNode.item.dataModelBindings.simpleBinding] || '';
    return commaSeparatedToSummaryValues(targetNode.item, value, lookups);
  }

  renderSummary(_props: SummaryRendererProps<'Checkboxes'>): JSX.Element | null {
    return <span>Not implemented</span>;
  }
}
