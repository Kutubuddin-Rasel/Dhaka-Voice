import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Layout from "@/components/layout/layout";
import { AuthProvider } from "@/lib/auth-context";
import { NotificationsProvider } from "@/lib/notifications-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DhakaVoice - Public Complaint Portal",
  description: "Empowering citizens to voice their concerns and improve Dhaka together",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <NotificationsProvider>
            <Layout>
              {children}
            </Layout>
          </NotificationsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}