import { useQuery } from '@tanstack/react-query';

import { useAppServicesContext } from 'src/contexts/appServiceContext';
import { preProcessItem } from 'src/features/expressions/validation';
import { cleanLayout } from 'src/features/layout/fetch/fetchFormLayoutSagas';
import { FormLayoutActions } from 'src/features/layout/formLayoutSlice';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import type { ExprObjConfig, ExprUnresolved, ExprVal } from 'src/features/expressions/types';
import type { ILayouts } from 'src/layout/layout';
import type { IHiddenLayoutsExpressions } from 'src/types';

enum ServerStateCacheKey {
  GetLayout = 'getLayout',
}

const processLayoutResponse = (dispatch, layoutToProcess, applicationMetadataId: string, instanceId?: string) => {
  // TODO for readability this method should be splitted.
  const layouts: ILayouts = {};
  const navigationConfig: any = {};
  const hiddenLayoutsExpressions: ExprUnresolved<IHiddenLayoutsExpressions> = {};
  let autoSave: boolean | undefined;
  let currentViewKey: string;

  if (layoutToProcess.data?.layout) {
    layouts.FormLayout = layoutToProcess.data.layout;
    hiddenLayoutsExpressions.FormLayout = layoutToProcess.data.hidden;
    currentViewKey = 'FormLayout';
    autoSave = layoutToProcess.data.autoSave;
  } else {
    const orderedLayoutKeys = Object.keys(layoutToProcess).sort();

    // use instance id (or application id for stateless) as cache key for current page
    const currentViewCacheKey = instanceId || applicationMetadataId;
    dispatch(FormLayoutActions.setCurrentViewCacheKey({ key: currentViewCacheKey }));

    const lastVisitedPage = localStorage.getItem(currentViewCacheKey);
    if (lastVisitedPage && orderedLayoutKeys.includes(lastVisitedPage)) {
      currentViewKey = lastVisitedPage;
    } else {
      currentViewKey = orderedLayoutKeys[0];
    }

    orderedLayoutKeys.forEach((key) => {
      layouts[key] = cleanLayout(layoutToProcess[key].data.layout);
      hiddenLayoutsExpressions[key] = layoutToProcess[key].data.hidden;
      navigationConfig[key] = layoutToProcess[key].data.navigation;
      autoSave = layoutToProcess[key].data.autoSave;
    });
  }

  const config: ExprObjConfig<{ hidden: ExprVal.Boolean; whatever: string }> = {
    hidden: {
      returnType: 'test',
      defaultValue: false,
      resolvePerRow: false,
    },
  };

  for (const key of Object.keys(hiddenLayoutsExpressions)) {
    hiddenLayoutsExpressions[key] = preProcessItem(hiddenLayoutsExpressions[key], config, ['hidden'], key);
  }

  return { layouts, navigationConfig, hiddenLayoutsExpressions, autoSave, currentViewKey };
};

export const useProcessedLayoutQuery = ({ layoutSetId, applicationMetadataId, instanceId }) => {
  const dispatch = useAppDispatch();
  const { fetchLayout } = useAppServicesContext();
  return useQuery(
    [ServerStateCacheKey.GetLayout, layoutSetId || applicationMetadataId || instanceId],
    () =>
      fetchLayout(layoutSetId).then((layout) =>
        processLayoutResponse(dispatch, layout, applicationMetadataId, instanceId),
      ),
    {
      enabled: !!(applicationMetadataId || instanceId),
      onSuccess: ({ layouts, navigationConfig, hiddenLayoutsExpressions, autoSave, currentViewKey }) => {
        // Update the ReduxStore to ensure that "legacy code" has access to the data from the ReduxStore
        const actionsToDispatch = [
          FormLayoutActions.fetchFulfilled({
            layouts,
            navigationConfig,
            hiddenLayoutsExpressions,
          }),
          FormLayoutActions.updateAutoSave({ autoSave }),
          FormLayoutActions.updateCurrentView({ newView: currentViewKey, skipPageCaching: true }),
        ];

        actionsToDispatch.forEach((action) => dispatch(action));
      },
    },
  );
};
