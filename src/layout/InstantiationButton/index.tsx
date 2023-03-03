import React from 'react';

import { ComponentType } from 'src/layout';
import { InstantiationButtonComponent } from 'src/layout/InstantiationButton/InstantiationButtonComponent';
import { PresentationLayoutComponent } from 'src/layout/LayoutComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class InstantiationButton extends PresentationLayoutComponent<'InstantiationButton'> {
  render(props: PropsFromGenericComponent<'InstantiationButton'>): JSX.Element | null {
    return <InstantiationButtonComponent {...props} />;
  }

  override renderWithLabel(): boolean {
    return false;
  }

  getComponentType(): ComponentType {
    return ComponentType.Button;
  }
}
