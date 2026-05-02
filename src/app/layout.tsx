import type { Metadata } from 'next';
import { Inter, Fira_Code } from 'next/font/google';
import './globals.css';

const firaCode = Fira_Code({ 
  subsets: ['latin'],
  variable: '--font-fira-code',
});

export const metadata: Metadata = {
  title: 'CRYPTCHAT | Secure Encrypted Chat System',
  description: 'Enterprise-grade end-to-end encrypted chat with dynamic key progression. Real-time analytics for security penetration testing.',
  keywords: 'encryption, chat, security, RSA, AES, socket.io, penetration testing',
  authors: [{ name: 'Security Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${firaCode.variable} font-mono antialiased`}>
        {children}
      </body>
    </html>
  );
}