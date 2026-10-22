import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource/titillium-web/400.css";
import "@fontsource/titillium-web/600.css";
import "@fontsource/titillium-web/700.css";
import "@fontsource/titillium-web/900.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Dash F1", template: "%s · Dash F1" },
  description: "Dashboard de ciência de dados da Fórmula 1: classificação, estratégia de pneus, ritmo de corrida e circuitos.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans">{children}</body>
    </html>
  );
}
