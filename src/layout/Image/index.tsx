import React from 'react';

import { ComponentType } from 'src/layout';
import { ImageComponent } from 'src/layout/Image/ImageComponent';
import { PresentationLayoutComponent } from 'src/layout/LayoutComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class Image extends PresentationLayoutComponent<'Image'> {
  render(props: PropsFromGenericComponent<'Image'>): JSX.Element | null {
    return <ImageComponent {...props} />;
  }

  override renderWithLabel(): boolean {
    return false;
  }

  getComponentType(): ComponentType {
    return ComponentType.Presentation;
  }
}
