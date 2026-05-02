import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CRYPTCHAT | Secure Encrypted Chat System',
  description: 'Enterprise-grade end-to-end encrypted chat with dynamic key progression',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-mono antialiased bg-black">
        {children}
      </body>
    </html>
  );
}