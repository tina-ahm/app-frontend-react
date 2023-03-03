import React from 'react';

import { ComponentType } from 'src/layout';
import { PresentationLayoutComponent } from 'src/layout/LayoutComponent';
import { PrintButtonComponent } from 'src/layout/PrintButton/PrintButtonComponent';

export class PrintButton extends PresentationLayoutComponent<'PrintButton'> {
  render(): JSX.Element | null {
    return <PrintButtonComponent />;
  }

  getComponentType(): ComponentType {
    return ComponentType.Button;
  }
}
