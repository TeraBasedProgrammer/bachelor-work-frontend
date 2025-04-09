export const fallbackLng = 'en';
export const languages = [fallbackLng, 'ua'];
export const cookieName = 'langCookie';
export const defaultNS = 'translation';

export const languageNames: {
  [key: string]: string;
} = {
  en: 'English',
  ua: 'Українська',
};

export function getOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    ketSeparator: '.',
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  };
}
