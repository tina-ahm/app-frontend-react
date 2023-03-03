import React from 'react';

import {
  attachmentNamesFromComponentId,
  attachmentNamesFromUuids,
  extractListFromBinding,
} from 'src/layout/FileUpload/shared/summary';
import { FileUploadWithTagComponent } from 'src/layout/FileUploadWithTag/FileUploadWithTagComponent';
import { LayoutComponent } from 'src/layout/LayoutComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';

export class FileUploadWithTag extends LayoutComponent<'FileUploadWithTag', string[]> {
  render(props: PropsFromGenericComponent<'FileUploadWithTag'>): JSX.Element | null {
    return <FileUploadWithTagComponent {...props} />;
  }

  override renderDefaultValidations(): boolean {
    return false;
  }

  getSummaryData({ targetNode, lookups }: SummaryRendererProps<'FileUploadWithTag'>): string[] {
    const listBinding = targetNode.item.dataModelBindings?.list;
    if (listBinding) {
      const values = extractListFromBinding(lookups.formData, listBinding);
      return attachmentNamesFromUuids(targetNode.item.id, values, lookups.attachments);
    }

    return attachmentNamesFromComponentId(targetNode.item.id, lookups.attachments);
  }

  renderSummary(_props: SummaryRendererProps<'FileUploadWithTag'>): JSX.Element | null {
    // TODO: Implement
    return <span>Nothing implemented yet</span>;
  }
}
