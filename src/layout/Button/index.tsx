import React from 'react';

import { ComponentType } from 'src/layout';
import { ButtonComponent } from 'src/layout/Button/ButtonComponent';
import { PresentationLayoutComponent } from 'src/layout/LayoutComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class Button extends PresentationLayoutComponent<'Button'> {
  render(props: PropsFromGenericComponent<'Button'>): JSX.Element | null {
    return <ButtonComponent {...props} />;
  }

  override renderWithLabel(): boolean {
    return false;
  }

  getComponentType(): ComponentType {
    return ComponentType.Button;
  }
}
