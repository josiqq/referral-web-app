import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['es', 'pt', 'en'],
  defaultLocale: 'es',
  localePrefix: 'as-needed'
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
