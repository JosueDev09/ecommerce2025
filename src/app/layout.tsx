import '@/styles/globals.css';
import MenuLayout from '@/components/menu/menu-layout';
import { TiendaProvider } from '@/context/TiendaContext';
import { AuthProvider } from '@/context/AuthContext';
import { Playfair_Display, Inter } from 'next/font/google';

// Fuentes de lujo
const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: "Esymbel E-Commerce",
  description: "Tu tienda moderna y minimalista"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <TiendaProvider>
        
            <MenuLayout>
              {children}
            </MenuLayout>
          </TiendaProvider>
        </AuthProvider>
      </body>
    </html>
  );
}