export type LocaleType = keyof typeof dictionaries;

const dictionaries = {
    en: () => import('./dictionaries/en.json').then((module) => module.default),
    ro: () => import('./dictionaries/ro.json').then((module) => module.default),
    it: () => import('./dictionaries/it.json').then((module) => module.default),
};

// Returns the dictionary corresponding to the locale
export const getDictionary = async (locale: LocaleType) => {
    const dictionary = await dictionaries[locale]();
    return dictionary;
}