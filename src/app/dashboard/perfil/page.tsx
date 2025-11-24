"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

export default function PerfilPage() {
  const router = useRouter();
  const { user, isAuthenticated, isGuest } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    telefono: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user) {
      setFormData({
        nombre: user?.strNombre || "",
        correo: user?.strCorreo || user?.strUsuario || "",
        telefono: user?.strTelefono || "",
      });
    }
  }, [mounted, user]);

  useEffect(() => {
    if (mounted && (!isAuthenticated || isGuest)) {
      router.push("/login");
    }
  }, [mounted, isAuthenticated, isGuest, router]);

  if (!mounted || !isAuthenticated || isGuest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A6EA5] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    console.log("Actualizando perfil:", formData);
    setIsEditing(false);
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    console.log("Cambiando contraseña");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswordSection(false);
  };

  return (
    <div className="min-h-screen bg-[#EDEDEE]">
      {/* Header estilo Mercado Libre */}
         <div className="bg-[#FFFF] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-gray-700 hover:text-gray-900 transition-colors"
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
              </button>
              <h1 className="text-lg font-normal text-gray-800">Datos personales</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Información Personal */}
        <div className="bg-white rounded-md shadow-sm p-6 mb-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Tus datos personales
              </h3>
              <p className="text-sm text-gray-500">
                Administra tu información personal
              </p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 text-sm font-normal text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                Editar
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      nombre: user?.strNombre || "",
                      correo: user?.strCorreo || user?.strUsuario || "",
                      telefono: user?.strTelefono || "",
                    });
                  }}
                  className="px-6 py-2 text-sm font-normal text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-6 py-2 text-sm font-normal text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                >
                  Guardar cambios
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-normal text-gray-700 mb-2">
                Nombre completo
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-4 py-3 rounded border text-sm ${
                  isEditing
                    ? "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    : "border-gray-200 bg-gray-50 text-gray-600"
                } outline-none transition-all`}
              />
            </div>

            <div>
              <label className="block text-sm font-normal text-gray-700 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-4 py-3 rounded border text-sm ${
                  isEditing
                    ? "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    : "border-gray-200 bg-gray-50 text-gray-600"
                } outline-none transition-all`}
              />
            </div>

            <div>
              <label className="block text-sm font-normal text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="(123) 456-7890"
                className={`w-full px-4 py-3 rounded border text-sm ${
                  isEditing
                    ? "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    : "border-gray-200 bg-gray-50 text-gray-600"
                } outline-none transition-all`}
              />
            </div>
          </div>
        </div>

        {/* Seguridad */}
        <div className="bg-white rounded-md shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Lock className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">Seguridad</h3>
              </div>
              <p className="text-sm text-gray-500">
                Cambia tu contraseña periódicamente para mantener tu cuenta segura
              </p>
            </div>
            <button
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="px-6 py-2 text-sm font-normal text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              {showPasswordSection ? "Cancelar" : "Cambiar contraseña"}
            </button>
          </div>

          {showPasswordSection && (
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  Contraseña actual
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 pr-12 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 pr-12 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Debe tener al menos 8 caracteres
                </p>
              </div>

              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  Confirmar nueva contraseña
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-sm"
                />
              </div>

              <button
                onClick={handleChangePassword}
                className="w-full py-3 text-sm font-normal text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              >
                Actualizar contraseña
              </button>
            </div>
          )}

          {!showPasswordSection && (
            <div className="text-sm text-gray-600 pt-4 border-t border-gray-200">
              <p>Última actualización: 15 de Octubre, 2024</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
