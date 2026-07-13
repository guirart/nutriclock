import "./globals.css";

export const metadata = {
  title: "NutriClock",
  description: "Acompanhamento nutricional, hábitos e evolução semanal",
  manifest: "/manifest.webmanifest"
};

export default function RootLayout({ children }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
