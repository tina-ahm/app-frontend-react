import type { ILayoutCompBase } from 'src/layout/layout';

export interface ILayoutCompPanelBase {
  variant?: 'info' | 'warning' | 'error' | 'success';
  showIcon?: boolean;
}

export interface IGroupPanel extends ILayoutCompPanelBase {
  iconUrl?: string;
  iconAlt?: string;
  groupReference?: { group: string };
}

export type ILayoutCompPanel = ILayoutCompBase<'Panel'> & ILayoutCompPanelBase;
