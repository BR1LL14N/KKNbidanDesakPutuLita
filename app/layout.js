import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "SI-KABID | Sistem Informasi Kasir & Keuangan Bidan",
  description: "Sistem Informasi Kasir dan Manajemen Keuangan Bidan berbasis web.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${outfit.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
