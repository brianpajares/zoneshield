import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/messages";
import "../globals.css";

export const metadata: Metadata = {
  title: {
    default: "ZoneShield — comprueba antes de responder",
    template: "%s | ZoneShield",
  },
  applicationName: "ZoneShield",
  robots: { index: false, follow: false },
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
