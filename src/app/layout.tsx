import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/cart-context';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: 'Vaaradhi Farms',
  description: 'Pure, authentic flavors from Vaaradhi Farms.',
  icons: {
    icon: 'https://firebasestorage.googleapis.com/v0/b/getpik-digital.firebasestorage.app/o/Vaaradhi_Farms%2FVF_logo_final-02.webp?alt=media&token=648ab03a-a11d-4d9e-9614-b4408da79a4c',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "build-time-placeholder",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "build-time-placeholder",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "build-time-placeholder",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "build-time-placeholder",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "build-time-placeholder",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "build-time-placeholder",
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <FirebaseClientProvider config={firebaseConfig}>
          <CartProvider>
            {children}
          </CartProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
