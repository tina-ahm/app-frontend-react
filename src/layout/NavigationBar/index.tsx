import React from 'react';

import { ComponentType } from 'src/layout';
import { PresentationLayoutComponent } from 'src/layout/LayoutComponent';
import { NavigationBarComponent } from 'src/layout/NavigationBar/NavigationBarComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class NavigationBar extends PresentationLayoutComponent<'NavigationBar'> {
  render(props: PropsFromGenericComponent<'NavigationBar'>): JSX.Element | null {
    return <NavigationBarComponent {...props} />;
  }

  override renderWithLabel(): boolean {
    return false;
  }

  getComponentType(): ComponentType {
    return ComponentType.Button;
  }
}
