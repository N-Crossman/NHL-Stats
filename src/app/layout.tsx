import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/navigation/Navbar";
import Footer from "./components/navigation/Footer";

export const metadata: Metadata = {
  title: "NHL Stats App",
  description: "A Next.js app to display NHL statistics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen bg-gray-100 text-gray-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
