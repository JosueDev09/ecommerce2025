import '@/styles/globals.css';
import MenuLayout from '@/components/menu/menu-layout';


export const metadata = {
  title: "Esymbel E-Commerce",
  description: "Tu tienda moderna y minimalista",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <MenuLayout>
      {children}
    </MenuLayout>
  );
}