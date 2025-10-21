import '@/styles/globals.css';
import Menu from '../components/menu/menu';
import { Footer } from '@/components/footer/footer';

export const metadata = {
  title: "Esymbel E-Commerce",
  description: "Tu tienda moderna y minimalista",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="w-full overflow-x-hidden">
       <link rel="icon" href="/favicon.svg" sizes="any" />
      <body className="w-full max-w-screen overflow-x-hidden">
        <Menu />
        {children}
        <Footer />
      </body>
    </html>
  );
}