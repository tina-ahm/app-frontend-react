import { useMemo } from 'react';

import { useAppSelector } from 'src/common/hooks';
import {
  LayoutRootNodeCollection,
  nodesInLayout,
  resolvedNodesInLayout,
} from 'src/utils/layout/hierarchy';
import type { ContextDataSources } from 'src/features/form/layout/expressions/ExpressionContext';

// TODO: Implement a test for this hook (and verify that it can resolve expressions)

/**
 * React hook used for getting a memoized LayoutRootNodeCollection where you can look up components.
 *
 * It can optionally also resolve layout expressions, if provided with expression data sources. If you only
 * want to resolve layout expressions for a single component, it is more efficient to use the hook specific
 * for that.
 *
 * @see useLayoutExpression
 * @see useLayoutExpressionForComponent
 */
export function useLayoutsAsNodes(
  dataSources?: undefined,
): LayoutRootNodeCollection;
export function useLayoutsAsNodes(
  dataSources?: ContextDataSources,
): LayoutRootNodeCollection<'resolved'>;
export function useLayoutsAsNodes(
  dataSources?: ContextDataSources | undefined,
): LayoutRootNodeCollection<any> {
  const repeatingGroups = useAppSelector(
    (state) => state.formLayout.uiConfig.repeatingGroups,
  );
  const layouts = useAppSelector((state) => state.formLayout.layouts);
  const current = useAppSelector(
    (state) => state.formLayout.uiConfig.currentView,
  );

  return useMemo(() => {
    const asNodes = {};
    for (const key of Object.keys(layouts)) {
      if (dataSources) {
        asNodes[key] = resolvedNodesInLayout(
          layouts[key],
          repeatingGroups,
          dataSources,
        );
      } else {
        asNodes[key] = nodesInLayout(layouts[key], repeatingGroups);
      }
    }

    return new LayoutRootNodeCollection(
      current as keyof typeof asNodes,
      asNodes,
    );
  }, [layouts, current, repeatingGroups, dataSources]);
}