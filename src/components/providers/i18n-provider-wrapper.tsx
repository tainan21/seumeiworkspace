"use client";

import { I18nProviderClient } from "~/locales/client";

type Props = {
  children: React.ReactNode;
  locale: string;
};

export function I18nProviderWrapper({ children, locale }: Props) {
  return <I18nProviderClient locale={locale}>{children}</I18nProviderClient>;
}

