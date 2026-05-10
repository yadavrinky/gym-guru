import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SidebarLayout from "@/components/SidebarLayout";
import { AuthProvider } from "../context/AuthContext";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gym Guru | AI Fitness Assistant",
  description: "Your personalized AI-powered fitness and nutrition companion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <SidebarLayout>
            {children}
            <Toaster />
          </SidebarLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
