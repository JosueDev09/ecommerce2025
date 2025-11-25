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
   console.log(formData);

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
          strNombre: usuarioData.strNombre, // Usar el nombre real del servidor
          strUsuario: usuarioData.strUsuario,
          strCorreo: usuarioData.strEmail || usuarioData.strUsuario,
          strTelefono: usuarioData.strTelefono || "",
        };

        console.log("✅ Usuario construido para login:", usuario);
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
        
        console.log("Usuario registrado:", usuario);
        
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
    
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] via-white to-[#F5F5F5] flex items-center justify-center p-4">
        
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center gap-8 lg:gap-16">

      
        
        {/* Sección izquierda - Branding */}
        {/* Sección izquierda - Branding */}
        <div className="flex-1 text-center lg:text-left space-y-6">

        {/* 🔹 Fila con botón y logo */}
        <div className="flex items-center justify-between lg:justify-start lg:gap-8 mb-4">
            {/* Botón regresar */}
            <a
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#3A6EA5]/30 text-[#3A6EA5] font-semibold text-sm hover:bg-[#3A6EA5]/10 hover:border-[#3A6EA5]/50 transition-all duration-300"
            >
            <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
                />
            </svg>
            Regresar a la tienda
            </a>

            {/* Logo / Nombre tienda */}
            <div className="inline-block text-left">
            <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#3A6EA5] to-[#8BAAAD] bg-clip-text text-transparent mb-2">
                Ecommerce
            </h1>
            <div className="h-1 bg-gradient-to-r from-[#3A6EA5] to-[#8BAAAD] rounded-full"></div>
            </div>
        </div>

        {/* Descripción */}
        <p className="text-xl text-gray-600 max-w-md">
            Descubre productos únicos y vive una experiencia de compra excepcional
        </p>
          
          <div className="hidden lg:flex flex-col gap-4 pt-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#3A6EA5]/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#3A6EA5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-700">Envío gratis en pedidos +$500</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#8BAAAD]/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#8BAAAD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-gray-700">Pagos 100% seguros</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#E6C89C]/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#3A6EA5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-gray-700">Garantía de satisfacción</span>
            </div>
          </div>
        </div>

        {/* Sección derecha - Formulario */}
        <div className="w-full lg:w-auto lg:min-w-[480px]">
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10">
            
            {/* Tabs */}
            <div className="flex gap-2 mb-8 bg-gray-100 p-1.5 rounded-xl">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                  mode === 'login'
                    ? 'bg-gradient-to-r from-[#3A6EA5] to-[#8BAAAD] text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setMode('register')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                  mode === 'register'
                    ? 'bg-gradient-to-r from-[#3A6EA5] to-[#8BAAAD] text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Registrarse
              </button>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-600 text-sm">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Formulario de Login */}
            {mode === 'login' && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de usuario
                  </label>
                  <input
                    type="text"
                    name="strUsuario"
                    value={formData.strUsuario}
                    onChange={handleInputChange}
                    placeholder="Usuario123"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 outline-none transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    name="strContra"
                    value={formData.strContra}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 outline-none transition-all"
                    required
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#3A6EA5] focus:ring-[#3A6EA5]" />
                    <span className="text-gray-600">Recordarme</span>
                  </label>
                  <a href="#" className="text-[#3A6EA5] hover:text-[#8BAAAD] font-medium">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}                
                  className="w-full py-4 bg-gradient-to-r from-[#3A6EA5] to-[#8BAAAD] text-white rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    name="strNombre"
                    value={formData.strNombre}
                    onChange={handleInputChange}
                    placeholder="Juan Pérez"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    name="strUsuario"
                    value={formData.strUsuario}
                    onChange={handleInputChange}
                    placeholder="Usuario123"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 outline-none transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    name="strContra"
                    value={formData.strContra}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar contraseña
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#3A6EA5] focus:ring-2 focus:ring-[#3A6EA5]/20 outline-none transition-all"
                    required
                  />
                </div>

                <label className="flex items-start gap-2 cursor-pointer text-sm">
                  <input type="checkbox" className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#3A6EA5] focus:ring-[#3A6EA5]" required />
                  <span className="text-gray-600">
                    Acepto los <a href="#" className="text-[#3A6EA5] hover:underline">términos y condiciones</a> y la <a href="#" className="text-[#3A6EA5] hover:underline">política de privacidad</a>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[#3A6EA5] to-[#8BAAAD] text-white rounded-xl font-semibold hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">o</span>
              </div>
            </div>

            {/* Botón Continuar como Invitado */}
            <button
              onClick={handleGuestContinue}
              className="w-full py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-[#3A6EA5] hover:text-[#3A6EA5] hover:bg-[#3A6EA5]/5 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Continuar como Invitado
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            {/* Social Login (opcional) */}
            <div className="mt-6 space-y-3">
              <button className="w-full py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </button>
            </div>

            <p className="text-center text-xs text-gray-500 mt-6">
              Al continuar, aceptas nuestros términos de servicio y política de privacidad
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}