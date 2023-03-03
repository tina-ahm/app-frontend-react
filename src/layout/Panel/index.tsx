import React from 'react';

import { ComponentType } from 'src/layout';
import { PresentationLayoutComponent } from 'src/layout/LayoutComponent';
import { PanelComponent } from 'src/layout/Panel/PanelComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class Panel extends PresentationLayoutComponent<'Panel'> {
  render(props: PropsFromGenericComponent<'Panel'>): JSX.Element | null {
    return <PanelComponent {...props} />;
  }

  override renderWithLabel(): boolean {
    return false;
  }

  getComponentType(): ComponentType {
    return ComponentType.Presentation;
  }
}
