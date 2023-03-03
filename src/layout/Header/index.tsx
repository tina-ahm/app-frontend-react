import React from 'react';

import { ComponentType } from 'src/layout';
import { HeaderComponent } from 'src/layout/Header/HeaderComponent';
import { PresentationLayoutComponent } from 'src/layout/LayoutComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class Header extends PresentationLayoutComponent<'Header'> {
  render(props: PropsFromGenericComponent<'Header'>): JSX.Element | null {
    return <HeaderComponent {...props} />;
  }

  override renderWithLabel(): boolean {
    return false;
  }

  getComponentType(): ComponentType {
    return ComponentType.Presentation;
  }

  // TODO: The Header is actually rendered in a Summary? Make sure we keep that functionality
}
