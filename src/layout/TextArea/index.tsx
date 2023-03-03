import React from 'react';

import { LayoutComponent } from 'src/layout/LayoutComponent';
import { TextAreaComponent } from 'src/layout/TextArea/TextAreaComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';

export class TextArea extends LayoutComponent<'TextArea'> {
  render(props: PropsFromGenericComponent<'TextArea'>): JSX.Element | null {
    return <TextAreaComponent {...props} />;
  }

  getSummaryData({ targetNode, lookups }: SummaryRendererProps<'TextArea'>): string {
    if (!targetNode.item.dataModelBindings?.simpleBinding) {
      return '';
    }

    return lookups.formData[targetNode.item.dataModelBindings.simpleBinding] || '';
  }

  renderSummary(_props: SummaryRendererProps<'TextArea'>): JSX.Element | null {
    // TODO: Implement
    return <span>Nothing implemented yet</span>;
  }
}
