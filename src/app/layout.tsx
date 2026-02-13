import type { Metadata } from "next";
import { Inter, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/contexts/theme-context";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Caramelt - A Swirl of Caramel, A Heart of Chocolate",
  description:
    "Premium handcrafted desserts made with love. Order your favorite caramel treats online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${cormorant.variable} antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: "12px",
              fontFamily: "var(--font-inter)",
            },
          }}
        />
      </body>
    </html>
  );
}
