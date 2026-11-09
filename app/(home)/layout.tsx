import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "ZoneShield — comprueba antes de responder",
  description: "Una segunda opinión clara antes de abrir un enlace, compartir un código o enviar dinero.",
  applicationName: "ZoneShield",
  robots: { index: false, follow: false },
};

export default function HomeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
