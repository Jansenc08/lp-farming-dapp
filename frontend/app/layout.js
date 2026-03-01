import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "FarmX — LP Token Farming",
  description: "Deposit LP tokens, earn FRT rewards. Decentralised farming on Sepolia.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className: "!bg-slate-800 !text-slate-100 !border-slate-700",
              success: { iconTheme: { primary: "#8b5cf6" } },
              error: { iconTheme: { primary: "#f87171" } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
