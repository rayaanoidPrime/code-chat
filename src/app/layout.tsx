import "./globals.css";
import styles from "./page.module.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Example App for RAG with Nile and OpenAI - Code Assist",
  description:
    "Built on Nile - The Postgres platform for AI-native B2B companies",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className={styles.main}>
          <div className={styles.description}>
            <div>
              <a
                href="https://github.com/rayaanoidPrime"
                target="_blank"
                rel="noopener noreferrer"
              >
                Created by @rayaanoidprime
              </a>
            </div>
          </div>
          <div></div>
          {children}
        </main>
      </body>
    </html>
  );
}
