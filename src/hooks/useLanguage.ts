import { useAppLanguage } from 'src/hooks/useAppLanguage';
import { getLanguageFromCode } from 'src/language/languages';
import type { ILanguage } from 'src/types/shared';

export const useLanguage = (allowAnonymous: boolean | undefined): ILanguage | void => {
  const languageCode = useAppLanguage(allowAnonymous);
  if (languageCode) {
    return getLanguageFromCode(languageCode);
  }
};
