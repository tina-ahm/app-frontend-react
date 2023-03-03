import React from 'react';

import { ComponentType } from 'src/layout';
import { AttachmentListComponent } from 'src/layout/AttachmentList/AttachmentListComponent';
import { PresentationLayoutComponent } from 'src/layout/LayoutComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class AttachmentList extends PresentationLayoutComponent<'AttachmentList'> {
  render(props: PropsFromGenericComponent<'AttachmentList'>): JSX.Element | null {
    return <AttachmentListComponent {...props} />;
  }

  override renderWithLabel(): boolean {
    return false;
  }

  getComponentType(): ComponentType {
    return ComponentType.Presentation;
  }
}
