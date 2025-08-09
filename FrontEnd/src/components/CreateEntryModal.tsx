// Modal para crear o editar una visita (entrada/salida) en el sistema.
import React, { useState, useEffect } from 'react';
import { X, User, FileText, ArrowRightLeft } from 'lucide-react';

interface CreateEntryModalProps {
  isOpen: boolean; // Controla si el modal está visible
  onClose: () => void; // Función para cerrar el modal
  onSubmit: (entryData: any) => void; // Función para enviar los datos de la visita
  editData?: any; // Datos para edición
  isEditMode?: boolean; // Indica si es edición o creación
  alumnos: { id: number; nombre: string; grupo: string; ingreso: number }[]; // Lista de alumnos para asociar
}

const CreateEntryModal: React.FC<CreateEntryModalProps> = ({ isOpen, onClose, onSubmit, editData, isEditMode, alumnos = [] }) => {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    nombre_visita: '',
    motivo: '',
    tipo: 'Entrada',
    alumno_id: '',
  });
  const [alumnoSearch, setAlumnoSearch] = useState(''); // Búsqueda de alumno
  const [showAlumnoList, setShowAlumnoList] = useState(false); // Mostrar lista de alumnos

  // Efecto para cargar datos en modo edición o limpiar en modo creación
  useEffect(() => {
    if (isOpen && isEditMode && editData) {
      setFormData({
        nombre_visita: editData.nombre_visita || '',
        motivo: editData.motivo || '',
        tipo: editData.tipo || 'Entrada',
        alumno_id: editData.alumno_id ? String(editData.alumno_id) : '',
      });
      const alumno = alumnos.find(a => a.id === editData.alumno_id);
      setAlumnoSearch(alumno ? alumno.nombre : '');
    } else if (isOpen && !isEditMode) {
      setFormData({ nombre_visita: '', motivo: '', tipo: 'Entrada', alumno_id: '' });
      setAlumnoSearch('');
    }
  }, [isOpen, isEditMode, editData, alumnos]);

  // Maneja el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, alumno_id: formData.alumno_id ? Number(formData.alumno_id) : null });
  };

  // Maneja cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Filtra alumnos según búsqueda
  const filteredAlumnos = alumnos.filter(a => a.nombre.toLowerCase().includes(alumnoSearch.toLowerCase()));
  // Selecciona un alumno de la lista
  const handleAlumnoSelect = (alumno: { id: number; nombre: string; grupo: string }) => {
    setFormData(f => ({ ...f, alumno_id: String(alumno.id) }));
    setAlumnoSearch(alumno.nombre);
    setShowAlumnoList(false);
  };
  // Limpia la selección de alumno
  const handleClearAlumno = () => {
    setFormData(f => ({ ...f, alumno_id: '' }));
    setAlumnoSearch('');
    setShowAlumnoList(false);
  };

  if (!isOpen) return null; // No renderiza si el modal está cerrado

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header del modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Editar Visita' : 'Crear Visita'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Formulario de visita */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Campo nombre visitante */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre visitante:</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="nombre_visita"
                value={formData.nombre_visita}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900"
                required
              />
            </div>
          </div>

          {/* Campo motivo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Motivo:</label>
            <div className="relative">
              <textarea
                name="motivo"
                value={formData.motivo}
                onChange={handleInputChange}
                rows={3}
                maxLength={35}
                className="w-full px-4 py-3 pr-16 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 resize-none bg-white text-gray-900"
                required
              />
              <div className="absolute bottom-2 right-2 text-xs font-medium">
                {/* Contador de caracteres del motivo */}
                <span className={`${
                  formData.motivo.length >= 35 
                    ? 'text-red-500' 
                    : formData.motivo.length >= 28 
                    ? 'text-orange-500' 
                    : 'text-gray-500'
                }`}>
                  {formData.motivo.length}/35
                </span>
              </div>
            </div>
          </div>

          {/* Campo tipo (entrada/salida) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo:</label>
            <div className="relative">
              <ArrowRightLeft className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 appearance-none bg-white text-gray-900"
                required
              >
                <option value="Entrada">Entrada</option>
                <option value="Salida">Salida</option>
              </select>
            </div>
          </div>

          {/* Campo alumno (opcional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Alumno (opcional):</label>
            <div className="relative">
              <input
                type="text"
                value={alumnoSearch}
                onChange={e => {
                  setAlumnoSearch(e.target.value);
                  setShowAlumnoList(true);
                }}
                onFocus={() => setShowAlumnoList(true)}
                onBlur={() => setTimeout(() => setShowAlumnoList(false), 150)}
                placeholder="Buscar alumno por nombre"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 pr-10"
              />
              {/* Botón para limpiar selección de alumno */}
              {alumnoSearch && (
                <button
                  type="button"
                  onClick={handleClearAlumno}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-500"
                  tabIndex={-1}
                  aria-label="Limpiar selección de alumno"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              {/* Lista de alumnos filtrados */}
              {showAlumnoList && filteredAlumnos.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                  {filteredAlumnos.map(a => (
                    <li
                      key={a.id}
                      className="px-4 py-2 cursor-pointer hover:bg-pink-100"
                      onClick={() => handleAlumnoSelect(a)}
                    >
                      {a.nombre} ({a.grupo})
                    </li>
                  ))}
                </ul>
              )}
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
              {isEditMode ? 'Guardar Cambios' : 'Crear Visita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEntryModal;