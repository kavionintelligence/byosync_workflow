// src/app/layout.tsx
import { Open_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans", // This creates the CSS variable
});


export const metadata = {
  title: "ByoSync | Zero-Biometric Auth Infrastructure",
  description: "Replacing OTPs and passwords across India's digital ecosystem with secure, token-based authentication.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${openSans.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}