'use client';
import Menu from './menu';
import { Footer } from '@/components/footer/footer';
import { usePathname } from "next/navigation";


export default function MenuLayout({ children }: { children: React.ReactNode }) {

      const pathname = usePathname();
  
  // Rutas donde ocultar el menú
  const hideLayoutPaths = ['/login', '/registro', '/processBuy', '/cart', '/dashboard', '/dashboard/pedidos', '/dashboard/perfil', '/dashboard/direcciones'];
  const hideLayout = hideLayoutPaths.includes(pathname as string) || pathname.startsWith('/pedido/confirmacion/');
  
  // Rutas donde ocultar el footer
  const hideLayoutFooter = ['/login', '/registro', '/processBuy'].includes(pathname as string);
  
  return (
    <html lang="es" className="w-full overflow-x-hidden">
       <link rel="icon" href="/favicon.svg" sizes="any" />
      <body className="w-full max-w-screen overflow-x-hidden">
        {!hideLayout && (
            <Menu />
        )}
        {children}
       {!hideLayoutFooter && (
         <Footer />
       )}
      </body>
    </html>
  );
}