import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ZoneShieldApp from "@/components/ZoneShieldApp";
import { isLocale, type Locale, messages } from "@/lib/i18n/messages";

export function generateStaticParams() {
  return [{ locale: "es" }, { locale: "en" }, { locale: "pt" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = messages[locale];
  return {
    title:
      locale === "es"
        ? "Revisa mensajes y enlaces sospechosos"
        : locale === "en"
          ? "Check suspicious messages and links"
          : "Verifique mensagens e links suspeitos",
    description: copy.heroBody as string,
    alternates: { languages: { es: "/es", en: "/en", pt: "/pt" } },
  };
}

export default async function LocalePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <ZoneShieldApp locale={locale as Locale} messages={messages[locale]} />;
}
