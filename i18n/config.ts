export const locales = ['es', 'pt', 'en'] as const;
export const defaultLocale = 'es' as const;

export type Locale = (typeof locales)[number];
