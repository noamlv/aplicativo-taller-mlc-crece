import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Taller de Monitoreo Liderado por la Comunidad | Proyecto CRECE",
  description:
    "Formulario de manifestación de interés para el Taller de Monitoreo Liderado por la Comunidad del proyecto CRECE.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
