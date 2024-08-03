"use client";

import { AuthProvider } from '../../context/AuthContext'

export default function ClientOnlyAuthProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthProvider>{children}</AuthProvider>;
}
