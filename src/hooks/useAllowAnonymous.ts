import { getDataTypeByLayoutSetId, isStatelessApp } from 'src/utils/appMetadata';
import type { IApplicationMetadata } from 'src/features/applicationMetadata';
import type { ILayoutSets } from 'src/types';

export const useGetAllowAnonymous = (applicationMetadata: IApplicationMetadata, layoutsets: ILayoutSets) => {
  if (!isStatelessApp(applicationMetadata)) {
    return false;
  }

  // Require layout sets for stateless apps - return undefined if not yet loaded
  if (!layoutsets.sets) {
    return undefined;
  }

  const dataTypeId = getDataTypeByLayoutSetId(applicationMetadata.onEntry?.show, layoutsets);
  const dataType = applicationMetadata.dataTypes.find(({ id }) => id === dataTypeId);

  if (dataType?.appLogic?.allowAnonymousOnStateless !== undefined) {
    return dataType.appLogic.allowAnonymousOnStateless;
  }
  return false;
};
