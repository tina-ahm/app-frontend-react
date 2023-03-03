import React from 'react';

import { ComponentType } from 'src/layout';
import { InstanceInformationComponent } from 'src/layout/InstanceInformation/InstanceInformationComponent';
import { PresentationLayoutComponent } from 'src/layout/LayoutComponent';
import type { PropsFromGenericComponent } from 'src/layout';

export class InstanceInformation extends PresentationLayoutComponent<'InstanceInformation'> {
  render(props: PropsFromGenericComponent<'InstanceInformation'>): JSX.Element | null {
    return <InstanceInformationComponent {...props} />;
  }

  getComponentType(): ComponentType {
    return ComponentType.Presentation;
  }
}
