'use client';
import Menu from './menu';
import { Footer } from '@/components/footer/footer';
import { usePathname } from "next/navigation";


export default function MenuLayout({ children }: { children: React.ReactNode }) {

      const pathname = usePathname();
  
  // Rutas donde ocultar el menú
  const hideLayoutPaths = ['/login', '/registro', '/processBuy', '/dashboard', '/dashboard/pedidos', '/dashboard/perfil', '/dashboard/direcciones'];
  const hideLayout = hideLayoutPaths.includes(pathname as string) || pathname.startsWith('/pedido/confirmacion/');
  
  // Rutas donde ocultar el footer
  const hideLayoutFooter = ['/login', '/registro', '/processBuy','/quejas'].includes(pathname as string);
  
  return (
    <>
      {!hideLayout && (
        <Menu />
      )}
      {children}
      {!hideLayoutFooter && (
        <Footer />
      )}
    </>
  );
}