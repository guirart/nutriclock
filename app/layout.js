import "./globals.css";

export const metadata = {
  title: "NutriClock",
  description: "Acompanhamento nutricional inteligente",
  manifest: "/manifest.webmanifest"
};

export default function RootLayout({ children }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
