import { useProfileQuery } from 'src/hooks/useProfileQuery';

// TODO implement selectedAppLanguage from localStorage. It might be a hook?
// See appLanguageStateSelector.ts

const defaultLanguage = 'nb';

export const useAppLanguage = (allowAnonymous: boolean | undefined): string | void => {
  const { data: profile } = useProfileQuery(allowAnonymous === false);

  if (allowAnonymous === undefined) {
    return;
  }

  if (!allowAnonymous && profile) {
    // Fallback to profile language if not anonymous
    return profile.profileSettingPreference.language || defaultLanguage;
  }

  return defaultLanguage;
};
