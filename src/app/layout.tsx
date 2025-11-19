import '@/styles/globals.css';
import MenuLayout from '@/components/menu/menu-layout';
import { TiendaProvider } from '@/context/TiendaContext';
import { AuthProvider } from '@/context/AuthContext';


export const metadata = {
  title: "Esymbel E-Commerce",
  description: "Tu tienda moderna y minimalista"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <AuthProvider>
      <TiendaProvider>
    
        <MenuLayout>
          {children}
        </MenuLayout>
      </TiendaProvider>
    </AuthProvider>
  );
}