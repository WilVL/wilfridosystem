// Modal para crear un nuevo alumno en el sistema.
import React, { useState } from 'react';
import { X, User, Users, Hash } from 'lucide-react';

interface CreateStudentModalProps {
  isOpen: boolean; // Controla si el modal está visible
  onClose: () => void; // Función para cerrar el modal
  onSubmit: (studentData: any) => void; // Función para enviar los datos del alumno
}

const CreateStudentModal: React.FC<CreateStudentModalProps> = ({ isOpen, onClose, onSubmit }) => {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    name: 'Maria Luisa Cardenas Núñez',
    group: '1-A',
    studentId: '001'
  });

  // Maneja el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
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
          <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Alumno</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Formulario de alumno */}
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
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Campo grupo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Grupo:
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="group"
                value={formData.group}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Campo ID alumno */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ID alumno:
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              Volver
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              Crear alumno
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStudentModal;