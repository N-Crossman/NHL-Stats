import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/navigation/Navbar";

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
    <html lang="en">
      <body
      className="min-h-screen bg-gray-100 text-gray-900"
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
