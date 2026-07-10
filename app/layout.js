import "./globals.css";

export const metadata = {
  title: "NutriClock Cloud",
  description: "Diário sincronizado de dieta e treino",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "NutriClock", statusBarStyle: "black-translucent" }
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
