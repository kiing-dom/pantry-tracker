import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientOnlyAuthProvider from "./components/providers/ClientOnlyAuthProvider";
import Layout from './components/sections/Layout'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pantry Tracker",
  description: "Created by Dom",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      </head>
      <body className={inter.className}>
        <ClientOnlyAuthProvider>
          <Layout>
            {children}
          </Layout>
        </ClientOnlyAuthProvider>
      </body>
    </html>
  );
}
