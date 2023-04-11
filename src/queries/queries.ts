import { httpPost } from 'src/utils/network/networking';
import { httpGet } from 'src/utils/network/sharedNetworking';
import {
  applicationMetadataApiUrl,
  applicationSettingsApiUrl,
  getActiveInstancesUrl,
  getFooterLayoutUrl,
  getLayoutSetsUrl,
  getPartyValidationUrl,
  getProcessStateUrl,
  instancesControllerUrl,
  profileApiUrl,
} from 'src/utils/urls/appUrlHelper';
import { orgsListUrl } from 'src/utils/urls/urlHelper';
import type { IApplicationMetadata } from 'src/features/applicationMetadata';
import type { IFooterLayout } from 'src/features/footer/types';
import type { ILayoutSets, ISimpleInstance } from 'src/types';
import type { IAltinnOrgs, IApplicationSettings, IInstance, IProcess, IProfile } from 'src/types/shared';

export const fetchApplicationSettings = (): Promise<IApplicationSettings> => httpGet(applicationSettingsApiUrl);
export const fetchApplicationMetadata = (): Promise<IApplicationMetadata> => httpGet(applicationMetadataApiUrl);
export const fetchUserProfile = (): Promise<IProfile> => httpGet(profileApiUrl);
export const fetchOrgs = (): Promise<IAltinnOrgs> =>
  httpGet(orgsListUrl, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

export const fetchFooterLayout = (): Promise<IFooterLayout> => httpGet(getFooterLayoutUrl());
export const fetchActiveInstances = (partyId: string): Promise<ISimpleInstance[]> =>
  httpGet(getActiveInstancesUrl(partyId));

export const getPartyValidation = (partyId: string) => httpPost(getPartyValidationUrl(partyId));
export const fetchInstanceByInstanceId = (instanceId: string): Promise<IInstance> =>
  httpGet(`${instancesControllerUrl}/${instanceId}`);
export const fetchLayoutSets = (): Promise<ILayoutSets> => httpGet(getLayoutSetsUrl());
export const fetchProcess = (): Promise<IProcess> => httpGet(getProcessStateUrl());
