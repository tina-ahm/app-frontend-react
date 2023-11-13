import type { IProfile } from 'src/types/shared';

export interface IProfileState {
  profile: IProfile;
  selectedAppLanguage: string;
}

export interface IFetchProfileFulfilled {
  profile: IProfile;
}

export interface IFetchProfileRejected {
  error: Error | null;
}
