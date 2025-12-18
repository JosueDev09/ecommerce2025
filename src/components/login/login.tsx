'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'guest'
  const [formData, setFormData] = useState({
    strUsuario: '',
    strContra: '',
    strNombre: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [strUsuario, setUsuario] = useState("");
  const [strContra, setContra] = useState("");
  const { login, continueAsGuest, getRedirectPath } = useAuth();
  const router = useRouter();

  const handleInputChange = (e:any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Limpiar error al escribir
  };

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
   //console.log(formData);

    if (mode === 'login') {
      try {
        // Llamar a tu API de GraphQL para login
        const response = await fetch("http://localhost:3000/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
           body: JSON.stringify({
          query: `
            mutation Login($data: LoginInput!) {
              login(data: $data) {
                token
                usuario {
                  ... on Empleado {
                    intEmpleado
                    strNombre
                    strUsuario
                    strRol,
                    strTelefono,
                    strEmail
                  }
                  ... on Cliente {
                    intCliente
                    strUsuario
                    strEmail
                    strTelefono
                    strNombre
                    
                  }
                }
              }
            }
          `,
          variables: {
            data: {
              strUsuario: formData.strUsuario,
              strContra: formData.strContra,
            },
          },
        }),
        });
       
        const result = await response.json();
        
        console.log(result);

        if (result.errors) {
          setError(result.errors[0].message || 'Error al iniciar sesión');
          setLoading(false);
          return;
        }

        //console.log("Usuario completo:", result.data);
        const token = result.data.login.token;  
        const usuarioData = result.data.login.usuario;
        
        // Construir objeto de usuario con la estructura correcta
        const usuario = {
          // Determinar tipo de usuario basado en qué campo está presente
          intCliente: usuarioData.intCliente || undefined,
          intEmpleado: usuarioData.intEmpleado || undefined,
          tipoUsuario: usuarioData.intCliente ? 'cliente' as const : 'empleado' as const,
          strNombre: usuarioData.strNombre, // Usar el nombre real del servidor
          strUsuario: usuarioData.strUsuario,
          strCorreo: usuarioData.strEmail || usuarioData.strUsuario,
          strTelefono: usuarioData.strTelefono || "",
          strRol: usuarioData.strRol || (usuarioData.intCliente ? 'cliente' : 'empleado'),
        };

       // console.log("✅ Usuario construido para login:", usuario);
        //console.log("Token:", token);
        
        // Guardar en contexto
        login(token, usuario);
        
        // Redirigir a la página anterior o al checkout
        const redirectPath = getRedirectPath();
        router.push(redirectPath);
        
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
        setError('Error de conexión. Intenta de nuevo.');
      }
      
    } else if (mode === 'register') {
      try {
        // Validar que las contraseñas coincidan
        if (formData.strContra !== formData.confirmPassword) {
          setError('Las contraseñas no coinciden');
          setLoading(false);
          return;
        }

        // Llamar a tu API de GraphQL para registro
        const response = await fetch("http://localhost:3000/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              mutation ($input: UsuarioInput!) {
                crearUsuario(input: $input) {
                  token
                  usuario {
                    intUsuario
                    strNombre
                    strCorreo
                    strTelefono
                  }
                }
              }
            `,
            variables: {
              input: {
                strCorreo: formData.strUsuario,
                strContrasena: formData.strContra
              }
            },
          }),
        });

        const result = await response.json();

        if (result.errors) {
          setError(result.errors[0].message || 'Error al registrarse');
          setLoading(false);
          return;
        }

        const { token, usuario: usuarioData } = result.data.crearUsuario;
        
        // Construir objeto de usuario con la estructura correcta
        const usuario = {
          strNombre: usuarioData.strNombre || formData.strNombre,
          strUsuario: usuarioData.strCorreo || formData.strUsuario,
          strCorreo: usuarioData.strCorreo || formData.strUsuario,
          strTelefono: usuarioData.strTelefono || "",
        };
        
      //  console.log("Usuario registrado:", usuario);
        
        // Guardar en contexto
        login(token, usuario);
        
        // Redirigir a la página anterior o al checkout
        const redirectPath = getRedirectPath();
        router.push(redirectPath);
        
      } catch (error) {
        console.error('Error al registrarse:', error);
        setError('Error de conexión. Intenta de nuevo.');
      }
    }
    
    setLoading(false);
  };

  const handleGuestContinue = () => {
    continueAsGuest();
    
    // Redirigir a la página anterior o al checkout
    const redirectPath = getRedirectPath();
    router.push(redirectPath);
  };

  return (
    
    <div className="min-h-screen bg-black flex items-center justify-center p-4 pt-[80px]">
        
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center gap-8 lg:gap-16">

      
        
        {/* Sección izquierda - Branding */}
        {/* Sección izquierda - Branding */}
        <div className="flex-1 text-center lg:text-left space-y-8">

        {/* 🔹 Fila con botón y logo */}
        <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-6 lg:gap-8 mb-4">
            {/* Botón regresar */}
            <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/20 text-white/80 font-[family-name:var(--font-inter)] text-xs tracking-[0.1em] uppercase hover:bg-white/5 hover:border-white/40 transition-all duration-300"
            >
            <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 19l-7-7 7-7"
                />
            </svg>
            Regresar a la tienda
            </button>

            {/* Logo / Nombre tienda */}
            <div className="inline-block text-center lg:text-left">
            <h1 className="font-[family-name:var(--font-playfair)] text-5xl lg:text-6xl text-white tracking-tight mb-2">
                ESYMBEL
            </h1>
            <div className="h-[1px] bg-white/40"></div>
            </div>
        </div>

        {/* Descripción */}
        <p className="font-[family-name:var(--font-inter)] text-white/60 text-sm tracking-[0.1em] uppercase max-w-md mx-auto lg:mx-0">
            Donde el lujo se encuentra con la artesanía
        </p>
          
          <div className="hidden lg:flex flex-col gap-6 pt-12">
            <div className="flex items-center gap-4">
              <div className="w-1 h-12 bg-white/20"></div>
              <span className="font-[family-name:var(--font-inter)] text-white/70 text-sm tracking-wide">Envío gratuito en pedidos superiores a $500</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-1 h-12 bg-white/20"></div>
              <span className="font-[family-name:var(--font-inter)] text-white/70 text-sm tracking-wide">Procesamiento de pagos seguro</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-1 h-12 bg-white/20"></div>
              <span className="font-[family-name:var(--font-inter)] text-white/70 text-sm tracking-wide">Satisfacción garantizada</span>
            </div>
          </div>
        </div>

        {/* Sección derecha - Formulario */}
        <div className="w-full lg:w-auto lg:min-w-[480px]">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 lg:p-10">
            
            {/* Tabs */}
            <div className="flex gap-0 mb-8 border-b border-white/10">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-4 px-4 font-[family-name:var(--font-inter)] text-xs tracking-[0.15em] uppercase transition-all duration-300 relative ${
                  mode === 'login'
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                Iniciar Sesión
                {mode === 'login' && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white"></div>
                )}
              </button>
              <button
                onClick={() => setMode('register')}
                className={`flex-1 py-4 px-4 font-[family-name:var(--font-inter)] text-xs tracking-[0.15em] uppercase transition-all duration-300 relative ${
                  mode === 'register'
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                Registrarse
                {mode === 'register' && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white"></div>
                )}
              </button>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="mb-6 p-4 border border-red-500/20 bg-red-500/10 flex items-start gap-3 text-red-400 text-sm">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-[family-name:var(--font-inter)]">{error}</span>
              </div>
            )}

            {/* Formulario de Login */}
            {mode === 'login' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block font-[family-name:var(--font-inter)] text-white/50 text-xs tracking-[0.15em] uppercase mb-3">
                    Nombre de usuario
                  </label>
                  <input
                    type="text"
                    name="strUsuario"
                    value={formData.strUsuario}
                    onChange={handleInputChange}
                    placeholder="Username"
                    className="w-full px-0 py-3 bg-transparent border-b border-white/20 text-white font-[family-name:var(--font-inter)] text-sm tracking-wide focus:outline-none focus:border-white/60 transition-colors placeholder:text-white/30"
                    required
                  />
                </div>
                
                <div>
                  <label className="block font-[family-name:var(--font-inter)] text-white/50 text-xs tracking-[0.15em] uppercase mb-3">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    name="strContra"
                    value={formData.strContra}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-0 py-3 bg-transparent border-b border-white/20 text-white font-[family-name:var(--font-inter)] text-sm tracking-wide focus:outline-none focus:border-white/60 transition-colors placeholder:text-white/30"
                    required
                  />
                </div>

                <div className="flex items-center justify-between text-sm pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 border-white/20 bg-transparent text-white focus:ring-white/20" />
                    <span className="font-[family-name:var(--font-inter)] text-white/60 text-xs tracking-wide">Recuérdame</span>
                  </label>
                  <a href="#" className="font-[family-name:var(--font-inter)] text-white/60 hover:text-white text-xs tracking-wide transition-colors">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}                
                  className="w-full py-4 mt-8 bg-white text-black font-[family-name:var(--font-inter)] text-xs tracking-[0.15em] uppercase font-medium hover:bg-white/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Iniciando sesión...
                    </span>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>
              </form>
            )}

            {/* Formulario de Registro */}
            {mode === 'register' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block font-[family-name:var(--font-inter)] text-white/50 text-xs tracking-[0.15em] uppercase mb-3">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    name="strNombre"
                    value={formData.strNombre}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    className="w-full px-0 py-3 bg-transparent border-b border-white/20 text-white font-[family-name:var(--font-inter)] text-sm tracking-wide focus:outline-none focus:border-white/60 transition-colors placeholder:text-white/30"
                    required
                  />
                </div>

                <div>
                  <label className="block font-[family-name:var(--font-inter)] text-white/50 text-xs tracking-[0.15em] uppercase mb-3">
                    Dirección de correo electrónico
                  </label>
                  <input
                    type="email"
                    name="strUsuario"
                    value={formData.strUsuario}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="w-full px-0 py-3 bg-transparent border-b border-white/20 text-white font-[family-name:var(--font-inter)] text-sm tracking-wide focus:outline-none focus:border-white/60 transition-colors placeholder:text-white/30"
                    required
                  />
                </div>
                
                <div>
                  <label className="block font-[family-name:var(--font-inter)] text-white/50 text-xs tracking-[0.15em] uppercase mb-3">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    name="strContra"
                    value={formData.strContra}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-0 py-3 bg-transparent border-b border-white/20 text-white font-[family-name:var(--font-inter)] text-sm tracking-wide focus:outline-none focus:border-white/60 transition-colors placeholder:text-white/30"
                    required
                  />
                </div>

                <div>
                  <label className="block font-[family-name:var(--font-inter)] text-white/50 text-xs tracking-[0.15em] uppercase mb-3">
                    Confirmar Contraseña
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-0 py-3 bg-transparent border-b border-white/20 text-white font-[family-name:var(--font-inter)] text-sm tracking-wide focus:outline-none focus:border-white/60 transition-colors placeholder:text-white/30"
                    required
                  />
                </div>

                <label className="flex items-start gap-3 cursor-pointer text-sm pt-2">
                  <input type="checkbox" className="w-4 h-4 mt-0.5 border-white/20 bg-transparent text-white focus:ring-white/20" required />
                  <span className="font-[family-name:var(--font-inter)] text-white/60 text-xs tracking-wide">
                    Acepto los <a href="#" className="text-white hover:underline">términos y condiciones</a> y la <a href="#" className="text-white hover:underline">política de privacidad</a>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-8 bg-white text-black font-[family-name:var(--font-inter)] text-xs tracking-[0.15em] uppercase font-medium hover:bg-white/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creando cuenta...
                    </span>
                  ) : (
                    'Crear Cuenta'
                  )}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent font-[family-name:var(--font-inter)] text-white/50 text-xs tracking-[0.15em] uppercase">or</span>
              </div>
            </div>

            {/* Botón Continuar como Invitado */}
            <button
              onClick={handleGuestContinue}
              className="w-full py-4 border border-white/20 text-white font-[family-name:var(--font-inter)] text-xs tracking-[0.15em] uppercase hover:border-white/40 hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              Continuar como Invitado
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            {/* Social Login (opcional) */}
            <div className="mt-6">
              <button className="w-full py-3 border border-white/20 font-[family-name:var(--font-inter)] text-xs tracking-[0.1em] uppercase text-white/70 hover:bg-white/5 hover:border-white/30 transition-all flex items-center justify-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </button>
            </div>

            <p className="text-center font-[family-name:var(--font-inter)] text-white/40 text-xs tracking-wide mt-8">
              Al continuar, aceptas nuestros términos de servicio y política de privacidad
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}