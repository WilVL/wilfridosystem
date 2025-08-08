// Componente Layout: estructura base de la app, incluye barra de navegación lateral (escritorio), barra inferior (móvil) y renderiza el contenido principal.
// Recibe onLogout para cerrar sesión.
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Home, Users, GraduationCap, FileText, ArrowRightLeft, LogOut } from 'lucide-react';
import { getCurrentUser, logout } from '../services/api';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();

  // Obtiene los ítems del menú según el rol del usuario
  const getMenuItems = () => {
    const baseItems = [
      { id: 'home', path: '/home', label: 'Home', icon: Home }
    ];

    // Solo Direccion puede ver usuarios
    if (currentUser?.rol === 'Direccion') {
      baseItems.push(
        { id: 'personal', path: '/usuarios', label: 'Perfiles Personal', icon: Users }
      );
    }

    // Direccion y Trabajo Social pueden ver alumnos
    if (currentUser?.rol === 'Direccion' || currentUser?.rol === 'Trabajo Social') {
      baseItems.push(
        { id: 'students', path: '/alumnos', label: 'Perfiles alumnos', icon: GraduationCap }
      );
    }

    // Direccion, Prefecto, Trabajo Social y Maestro pueden ver entradas/salidas
    if (
      currentUser?.rol === 'Direccion' ||
      currentUser?.rol === 'Prefecto' ||
      currentUser?.rol === 'Trabajo Social' ||
      currentUser?.rol === 'Maestro'
    ) {
      baseItems.push(
        { id: 'entries', path: '/entradas-salidas', label: 'Entradas y salidas', icon: ArrowRightLeft }
      );
    }

    // Todos pueden ver justificantes
    baseItems.push(
      { id: 'justifications', path: '/justificantes', label: 'Justificantes', icon: FileText }
    );

    return baseItems;
  };

  const menuItems = getMenuItems();

  // Cierra sesión y ejecuta callback
  const handleLogout = () => {
    logout();
    onLogout();
  };

  // Determina si la ruta es la actual
  const isCurrentPage = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar lateral (solo escritorio) */}
      <div className="hidden md:fixed md:block md:w-48 xl:w-64 md:bg-gradient-to-b md:from-[#800020] md:to-[#a8324a] md:text-white md:shadow-xl md:h-screen md:overflow-y-auto">
        {/* Usuario y rol actual */}
        <div className="p-6 border-b border-pink-400/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">{currentUser?.nombre || 'Usuario'}</h2>
              <p className="text-pink-100 text-sm font-medium">{currentUser?.rol?.toUpperCase() || 'USUARIO'}</p>
            </div>
          </div>
        </div>

        {/* Menú de navegación lateral */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                  isCurrentPage(item.path)
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-pink-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Botón cerrar sesión (escritorio) */}
        <div className="absolute bottom-0 w-64 p-4">
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-pink-100 hover:bg-white/10 hover:text-white rounded-lg transition-all duration-200">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* Barra inferior (solo móvil) */}
      <nav className="fixed bottom-0 left-0 w-full bg-gradient-to-b from-[#800020] to-[#a8324a] text-white shadow-2xl flex md:hidden z-50">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex-1 flex flex-col items-center justify-center py-2 ${
                isCurrentPage(item.path)
                  ? 'bg-white/20 text-white'
                  : 'text-pink-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
        {/* Botón cerrar sesión (móvil) */}
        <button
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center justify-center py-2 text-pink-100 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Salir</span>
        </button>
      </nav>

      {/* Contenido principal */}
      <div className="flex-1 md:ml-48 xl:ml-64 bg-gray-100 transition-colors pb-16 md:pb-0">
        {children}
      </div>
    </div>
  );
};

export default Layout;