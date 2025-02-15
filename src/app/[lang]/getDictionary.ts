export type LocaleType = keyof typeof dictionaries;

export const languages = [
    {
        code: 'en',
        title: 'English'
    },
    {
        code: 'it',
        title: "Italian"
    },
    {
        code: 'ro',
        title: 'Romanian'
    }
]

const dictionaries = languages.reduce((acc, lang) => {
    acc[lang.code] = () => import(`./dictionaries/${lang.code}.json`).then((module) => module.default);
    return acc;
}, {} as { [key: string]: () => Promise<any> });

// const dictionaries = {
//     en: () => import('./dictionaries/en.json').then((module) => module.default),
//     ro: () => import('./dictionaries/ro.json').then((module) => module.default),
//     it: () => import('./dictionaries/it.json').then((module) => module.default),
// };

// Returns the dictionary corresponding to the locale
export const getDictionary = async (locale: LocaleType) => {
    const dictionary = await dictionaries[locale]();
    return dictionary;
}