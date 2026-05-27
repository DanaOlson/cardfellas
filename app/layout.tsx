import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CardFellas — Buy, Sell & Trade TCG Cards in Layton, UT",
    template: "%s | CardFellas",
  },
  description:
    "Your local TCG destination in Layton, Utah. Shop Magic: The Gathering, Pokémon, Yu-Gi-Oh!, sports cards, and more. Grand Opening October 1st!",
  keywords: [
    "TCG store Utah",
    "Magic The Gathering Layton",
    "Pokemon cards Utah",
    "Yu-Gi-Oh cards",
    "sports cards Layton",
    "buy sell trade cards",
    "CardFellas",
  ],
  openGraph: {
    siteName: "CardFellas",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${dmSans.variable}`}>
      <body className="min-h-screen flex flex-col bg-cf-dark font-body antialiased">
        <SessionProvider>
          <CartProvider>
            <WishlistProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <CartDrawer />
            </WishlistProvider>
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
