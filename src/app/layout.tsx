import '@/styles/globals.css';
import Menu from '../components/menu/menu';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="w-full overflow-x-hidden">
      
      <body className="w-full max-w-screen overflow-x-hidden">
        <Menu />
        {children}
      </body>
      
    </html>
    
  );
}

