import React from 'react';

import { FD } from 'src/features/formData2/Compatibility';
import { getCommaSeparatedOptionsToText } from 'src/features/options/getCommaSeparatedOptionsToText';
import { getOptionList } from 'src/features/options/getOptionList';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { type IUseLanguage, useLanguage } from 'src/hooks/useLanguage';
import { MultipleChoiceSummary } from 'src/layout/Checkboxes/MultipleChoiceSummary';
import { MultipleSelectDef } from 'src/layout/MultipleSelect/config.def.generated';
import { MultipleSelectComponent } from 'src/layout/MultipleSelect/MultipleSelectComponent';
import type { IFormData } from 'src/features/formData';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { IOptions, IRepeatingGroups } from 'src/types';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export class MultipleSelect extends MultipleSelectDef {
  render(props: PropsFromGenericComponent<'MultipleSelect'>): JSX.Element | null {
    return <MultipleSelectComponent {...props} />;
  }

  private getSummaryData(
    node: LayoutNode<'MultipleSelect'>,
    formData: IFormData,
    langTools: IUseLanguage,
    repeatingGroups: IRepeatingGroups | null,
    options: IOptions,
  ): { [key: string]: string } {
    if (!node.item.dataModelBindings?.simpleBinding) {
      return {};
    }

    const value = formData[node.item.dataModelBindings.simpleBinding] || '';
    const optionList = getOptionList(node.item, langTools.textResources, formData, repeatingGroups, options);
    return getCommaSeparatedOptionsToText(value, optionList, langTools);
  }

  getDisplayData(node: LayoutNode<'MultipleSelect'>, { formData, langTools, uiConfig, options }): string {
    return Object.values(this.getSummaryData(node, formData, langTools, uiConfig.repeatingGroups, options)).join(', ');
  }

  renderSummary({ targetNode }: SummaryRendererProps<'MultipleSelect'>): JSX.Element | null {
    const formData = FD.useAsDotMap();
    const langTools = useLanguage();
    const repeatingGroups = useAppSelector((state) => state.formLayout.uiConfig.repeatingGroups);
    const options = useAppSelector((state) => state.optionState.options);
    const summaryData = this.getSummaryData(targetNode, formData, langTools, repeatingGroups, options);
    return <MultipleChoiceSummary formData={summaryData} />;
  }
}
