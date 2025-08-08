// Modal para crear o editar un perfil de usuario del personal.
import React, { useState, useEffect } from 'react';
import { X, User, Lock, UserCheck, Eye, EyeOff } from 'lucide-react';

interface CreateProfileModalProps {
  isOpen: boolean; // Controla si el modal está visible
  onClose: () => void; // Función para cerrar el modal
  onSubmit: (profileData: any) => void; // Función para enviar los datos del perfil
  editData?: { name: string; password: string; role: string }; // Datos para edición
  isEditMode?: boolean; // Indica si es edición o creación
}

const CreateProfileModal: React.FC<CreateProfileModalProps> = ({ isOpen, onClose, onSubmit, editData, isEditMode }) => {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    role: 'Maestro'
  });
  const [showPassword, setShowPassword] = useState(false); // Mostrar/ocultar contraseña

  // Efecto para cargar datos en modo edición o limpiar en modo creación
  useEffect(() => {
    if (isOpen && isEditMode && editData) {
      setFormData({
        name: editData.name,
        password: '', // Nunca mostramos la contraseña actual
        role: editData.role
      });
    } else if (isOpen && !isEditMode) {
      setFormData({ name: '', password: '', role: 'Maestro' });
    }
  }, [isOpen, isEditMode, editData]);

  // Maneja el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Maneja cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null; // No renderiza si el modal está cerrado

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header del modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Formulario de perfil */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Campo nombre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre:
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900"
                required
              />
            </div>
          </div>

          {/* Campo contraseña */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contraseña:
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900"
                required={!isEditMode}
              />
              {/* Botón para mostrar/ocultar contraseña */}
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Campo rol */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Rol:
            </label>
            <div className="relative">
              <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 appearance-none bg-white text-gray-900"
                required
              >
                <option value="Maestro">Maestro</option>
                <option value="Prefecto">Prefecto</option>
                <option value="Direccion">Dirección</option>
                <option value="Trabajo Social">Trabajo Social</option>
                <option value="Enfermeria">Enfermería</option>
              </select>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              {isEditMode ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProfileModal;