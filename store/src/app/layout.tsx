import type { Metadata } from "next";
import "./globals.css";
import { BuyerAuthProvider } from "@/context/BuyerAuthContext";

export const metadata: Metadata = {
  title: "Adera Foundation - Impact Store",
  description: "Shop premium electronics, fashion, and curated goods where 100% of proceeds fund humanitarian causes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
        <BuyerAuthProvider>
          {children}
        </BuyerAuthProvider>
      </body>
    </html>
  );
}
