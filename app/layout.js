import "./globals.css";
import { AuthProvider } from "../components/providers/AuthProvider";

export const metadata = {
  title: "NutriClock",
  description: "Acompanhamento nutricional, hábitos e evolução semanal",
  manifest: "/manifest.webmanifest"
};

export default function RootLayout({ children }) {
  return <html lang="pt-BR"><body><AuthProvider>{children}</AuthProvider></body></html>;
}
