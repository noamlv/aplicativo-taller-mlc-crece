import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Taller de Monitoreo Liderado por la Comunidad | Proyecto CRECE",
  description:
    "Manifestación de interés para el taller teórico-práctico de MLC con enfoque de género y derechos del proyecto CRECE.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
