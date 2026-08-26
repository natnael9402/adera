import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { DonateProvider } from "@/context/DonateContext";
import DonateModal from "@/components/DonateModal";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Adera Foundation — Crypto-Powered Philanthropy",
  description:
    "Donate crypto, change lives. Adera connects donors with verified causes through transparent, blockchain-powered giving.",
  keywords: [
    "crypto charity", "blockchain donations", "bitcoin philanthropy", "crypto fundraising",
    "charity", "crowdfunding", "donate crypto", "web3 giving", "ethereum donations",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-white text-slate-900 antialiased font-[var(--font-inter)]">
        <AuthProvider>
          <DonateProvider>
            {children}
            <DonateModal />
          </DonateProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
