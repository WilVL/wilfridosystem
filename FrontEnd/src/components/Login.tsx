// Componente Login: formulario de inicio de sesión para acceder al sistema.
import React, { useState } from 'react';
import { User } from 'lucide-react';
import logo from '../assets/Logo 22.jpg';
import { login } from '../services/api';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [nombre, setNombre] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (!nombre || !contrasena) {
      setError('Por favor, completa todos los campos.');
      setIsLoading(false);
      return;
    }
    
    try {
      await login({ nombre, contraseña: contrasena });
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#800020] to-[#a8324a] p-2 sm:p-0">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-2xl px-4 py-6 sm:px-8 sm:py-8 md:px-12 md:py-10 flex flex-col items-center w-full max-w-xs sm:max-w-md md:max-w-lg border border-gray-200"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-orange-500 rounded-full p-2 sm:p-3 mb-3 shadow-md">
            <img src={logo} alt="Logo" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-cover rounded-full border-4 border-white shadow" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-1 tracking-tight text-center">Iniciar sesión</h1>
          <p className="text-gray-600 text-sm sm:text-base text-center">Accede al panel administrativo</p>
        </div>
        <div className="flex flex-col gap-6 w-full">
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="nombre" className="text-gray-900 text-base font-semibold">Usuario</label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              className="px-3 py-2 sm:px-4 sm:py-3 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white w-full rounded-md font-sans text-gray-900 transition-all duration-150 shadow-sm placeholder-gray-400"
              autoComplete="username"
              placeholder="Escribe tu usuario"
            />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="contrasena" className="text-gray-900 text-base font-semibold">Contraseña</label>
            <input
              id="contrasena"
              type="password"
              value={contrasena}
              onChange={e => setContrasena(e.target.value)}
              className="px-3 py-2 sm:px-4 sm:py-3 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white w-full rounded-md font-sans text-gray-900 transition-all duration-150 shadow-sm placeholder-gray-400"
              autoComplete="current-password"
              placeholder="Introduce tu contraseña"
            />
          </div>
        </div>
        {error && <div className="text-red-400 mt-6 text-center font-semibold w-full">{error}</div>}
        <button
          type="submit"
          disabled={isLoading}
          className={`mt-8 bg-orange-500 hover:bg-orange-600 text-white font-bold text-base sm:text-lg rounded-md px-8 sm:px-20 py-3 transition-all duration-200 shadow-lg w-full ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Iniciando...' : 'Iniciar'}
        </button>
      </form>
    </div>
  );
};

export default Login; 