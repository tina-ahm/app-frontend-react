import React from 'react';

import { ComponentType } from 'src/layout';
import { PresentationLayoutComponent } from 'src/layout/LayoutComponent';
import { NavigationButtonsComponent } from 'src/layout/NavigationButtons/NavigationButtonsComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class NavigationButtons extends PresentationLayoutComponent<'NavigationButtons'> {
  render(props: PropsFromGenericComponent<'NavigationButtons'>): JSX.Element | null {
    return <NavigationButtonsComponent {...props} />;
  }

  override renderWithLabel(): boolean {
    return false;
  }

  getComponentType(): ComponentType {
    return ComponentType.Button;
  }
}
