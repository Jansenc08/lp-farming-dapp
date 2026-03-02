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
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className: "!bg-white !text-gray-900 !border !border-gray-200 !shadow-lg",
              success: { iconTheme: { primary: "#8b5cf6" } },
              error: { iconTheme: { primary: "#ef4444" } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
