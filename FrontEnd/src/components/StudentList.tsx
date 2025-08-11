import React, { useState, useEffect, useRef } from 'react';
import Pagination from './Pagination';
import { Search, Plus, Edit, Trash2, User as UserIcon, Users as UsersIcon } from 'lucide-react';
import { getAlumnos, createAlumno, updateAlumno, deleteAlumno, API_URL, getAuthHeaders } from '../services/api';

interface Student {
  id: number;
  name: string;
  group: string;
  turno: 'Matutino' | 'Vespertino';
  ingreso: number;
}

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (studentData: any) => void;
  editData?: { name: string; group: string; turno: string; ingreso: number };
  isEditMode?: boolean;
}

const StudentModal: React.FC<StudentModalProps> = ({ isOpen, onClose, onSubmit, editData, isEditMode }) => {
  const [formData, setFormData] = useState({ name: '', group: '', turno: '', ingreso: '' });

  useEffect(() => {
    if (isOpen && isEditMode && editData) {
      setFormData({
        name: editData.name || '',
        group: editData.group || '',
        turno: editData.turno || '',
        ingreso: editData.ingreso ? String(editData.ingreso) : ''
      });
    } else if (isOpen && !isEditMode) {
      setFormData({ name: '', group: '', turno: '', ingreso: '' });
    }
  }, [isOpen, isEditMode, editData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      ingreso: Number(formData.ingreso)
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 text-gray-900">{isEditMode ? 'Editar Alumno' : 'Crear Nuevo Alumno'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          >
            <span className="text-gray-500 text-gray-700">✕</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 text-gray-800 mb-2">Nombre:</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-gray-500 w-5 h-5" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white bg-white text-gray-900 text-gray-900"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 text-gray-800 mb-2">Turno:</label>
            <select
              name="turno"
              value={formData.turno}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white bg-white text-gray-900 text-gray-900"
              required
            >
              <option value="">Selecciona turno</option>
              <option value="Matutino">Matutino</option>
              <option value="Vespertino">Vespertino</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 text-gray-800 mb-2">Grupo:</label>
            <div className="flex gap-2">
              <select
                name="groupNumber"
                value={formData.group ? formData.group.replace(/[^0-9]/g, '') : ''}
                onChange={e => {
                  const letter = formData.group ? formData.group.replace(/[^A-Z]/gi, '') : '';
                  setFormData({ ...formData, group: e.target.value + letter });
                }}
                className="w-1/2 px-4 py-3 border-2 border-gray-200 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white bg-white text-gray-900 text-gray-900"
                required
              >
                <option value="">N°</option>
                {[1, 2, 3].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <select
                name="groupLetter"
                value={formData.group ? formData.group.replace(/[^A-Z]/gi, '') : ''}
                onChange={e => {
                  const number = formData.group ? formData.group.replace(/[^0-9]/g, '') : '';
                  setFormData({ ...formData, group: number + e.target.value.toUpperCase() });
                }}
                className="w-1/2 px-4 py-3 border-2 border-gray-200 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white bg-white text-gray-900 text-gray-900"
                required
                disabled={!formData.turno}
              >
                <option value="">Letra</option>
                {(formData.turno === 'Matutino'
                  ? ['A','B','C','D','E','F']
                  : formData.turno === 'Vespertino'
                    ? Array.from({length: 6}, (_, i) => String.fromCharCode(71 + i)) // G-L
                    : []
                ).map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 text-gray-800 mb-2">Año de ingreso:</label>
            <select
              name="ingreso"
              value={formData.ingreso}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-200 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white bg-white text-gray-900 text-gray-900"
              required
            >
              <option value="">Selecciona año</option>
              {Array.from({length: 4}, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 bg-gray-100 text-gray-700 text-gray-800 rounded-lg hover:bg-gray-200 hover:bg-gray-300 transition-all duration-200 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-200 font-semibold"
            >
              {isEditMode ? 'Guardar Cambios' : 'Crear Alumno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal para alta masiva de alumnos
type BulkStudentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onBulkSubmit: (data: { alumnos: { nombre: string; grupo: string; turno: string; ingreso: number }[] }) => Promise<void>;
  disableBackdropClose?: boolean;
};
const BulkStudentModal: React.FC<BulkStudentModalProps> = ({ isOpen, onClose, onBulkSubmit, disableBackdropClose }) => {
  const [turno, setTurno] = useState('');
  const [grado, setGrado] = useState('');
  const [grupo, setGrupo] = useState('');
  const [ingreso, setIngreso] = useState('');
  const [nombres, setNombres] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTurno(''); setGrado(''); setGrupo(''); setIngreso(''); setNombres(''); setError(''); setSuccess('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!turno || !grado || !grupo || !ingreso || !nombres.trim()) {
      setError('Completa todos los campos.');
      return;
    }
    const nombresArr = nombres.split('\n').map(n => n.trim()).filter(Boolean);
    if (nombresArr.length === 0) {
      setError('Agrega al menos un nombre.');
      return;
    }
    setLoading(true);
    try {
      await onBulkSubmit({
        alumnos: nombresArr.map(nombre => ({
          nombre,
          grupo: grado + grupo,
          turno,
          ingreso: Number(ingreso)
        }))
      });
      onClose();
    } catch (err) {
      setError('Error al agregar alumnos.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  const year = new Date().getFullYear();
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={disableBackdropClose ? undefined : onClose}>
      <div className="bg-white bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 text-gray-900">Agregar Grupo de Alumnos</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200">
            <span className="text-gray-500 text-gray-700">✕</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Turno:</label>
            <select value={turno} onChange={e => setTurno(e.target.value)} className="w-full px-4 py-2 border-2 rounded-lg" required>
              <option value="">Selecciona turno</option>
              <option value="Matutino">Matutino</option>
              <option value="Vespertino">Vespertino</option>
            </select>
          </div>
          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="block text-sm font-semibold mb-1">Grado:</label>
              <select value={grado} onChange={e => setGrado(e.target.value)} className="w-full px-4 py-2 border-2 rounded-lg" required>
                <option value="">N°</option>
                {[1,2,3].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-semibold mb-1">Grupo:</label>
              <select
                value={grupo}
                onChange={e => setGrupo(e.target.value)}
                className="w-full px-4 py-2 border-2 rounded-lg"
                required
                disabled={!turno}
              >
                <option value="">Letra</option>
                {(turno === 'Matutino'
                  ? ['A','B','C','D','E','F']
                  : turno === 'Vespertino'
                    ? ['G','H','I','J','K','L']
                    : []
                ).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Año de ingreso:</label>
            <select value={ingreso} onChange={e => setIngreso(e.target.value)} className="w-full px-4 py-2 border-2 rounded-lg" required>
              <option value="">Selecciona año</option>
              {Array.from({length: 4}, (_, i) => year - i).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Nombres de alumnos (uno por línea):</label>
            <textarea value={nombres} onChange={e => setNombres(e.target.value)} rows={6} className="w-full px-4 py-2 border-2 rounded-lg" placeholder={"Ejemplo:\nJuan Pérez\nMaría López\nPedro Sánchez"} required />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <div className="flex gap-4 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-gray-100 bg-gray-100 text-gray-700 text-gray-800 rounded-lg hover:bg-gray-200 hover:bg-gray-300 transition-all duration-200 font-semibold">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-200 font-semibold">{loading ? 'Agregando...' : 'Agregar alumnos'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal para edición masiva de grupo y año de ingreso
const BulkEditGroupModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { nuevoGrupo?: string; nuevoIngreso?: number }) => void;
  loading: boolean;
}> = ({ isOpen, onClose, onSubmit, loading }) => {
  const [grado, setGrado] = useState('');
  const [grupo, setGrupo] = useState('');
  const [ingreso, setIngreso] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    if (isOpen) {
      setGrado(''); setGrupo(''); setIngreso(''); setError('');
    }
  }, [isOpen]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grado && !grupo && !ingreso) {
      setError('Debes seleccionar al menos un campo a actualizar.');
      return;
    }
    setError('');
    onSubmit({
      nuevoGrupo: grado && grupo ? grado + grupo : undefined,
      nuevoIngreso: ingreso ? Number(ingreso) : undefined
    });
  };
  const year = new Date().getFullYear();
  return isOpen ? (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 text-gray-900">Editar Grupo de Alumnos</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200">
            <span className="text-gray-500 text-gray-700">✕</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="block text-sm font-semibold mb-1">Nuevo grado:</label>
              <select value={grado} onChange={e => setGrado(e.target.value)} className="w-full px-4 py-2 border-2 rounded-lg">
                <option value="">N°</option>
                {[1,2,3].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-semibold mb-1">Nueva letra:</label>
              <select value={grupo} onChange={e => setGrupo(e.target.value)} className="w-full px-4 py-2 border-2 rounded-lg">
                <option value="">Letra</option>
                {[...'ABCDEFGHIJKL'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Nuevo año de ingreso:</label>
            <select value={ingreso} onChange={e => setIngreso(e.target.value)} className="w-full px-4 py-2 border-2 rounded-lg">
              <option value="">Selecciona año</option>
              {Array.from({length: 4}, (_, i) => year - i).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex gap-4 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-gray-100 bg-gray-100 text-gray-700 text-gray-800 rounded-lg hover:bg-gray-200 hover:bg-gray-300 transition-all duration-200 font-semibold">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 font-semibold">{loading ? 'Actualizando...' : 'Actualizar grupo'}</button>
          </div>
        </form>
      </div>
    </div>
  ) : null;
};

// Modal de confirmación para edición masiva de grupo y año de ingreso
const BulkEditConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  total: number;
  seleccionados: number;
  grupoOrigen: string;
  grupoDestino?: string;
  loading: boolean;
}> = ({ isOpen, onClose, onConfirm, total, seleccionados, grupoOrigen, grupoDestino, loading }) => {
  const noActualizados = total - seleccionados;
  return isOpen ? (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 text-gray-900">Confirmar actualización</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
          >
            <span className="text-gray-500 text-gray-700">✕</span>
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-700 text-gray-700 text-center mb-6">
            <strong>¿Actualizar <span className='text-blue-600'>{seleccionados}</span> alumnos del grupo <span className='text-blue-600'>{grupoOrigen}</span></strong><br />
            {grupoDestino && grupoDestino !== grupoOrigen && (
              <span>
                El grupo cambiará a <span className='text-green-600 font-bold'>{grupoDestino}</span>.<br />
              </span>
            )}
            Se conservarán <span className='font-bold text-green-600'>{noActualizados}</span> alumnos sin actualizar.
          </p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={onConfirm}
              disabled={loading || seleccionados === 0}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 font-semibold disabled:opacity-60"
            >
              {loading ? 'Actualizando...' : 'Aceptar'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 bg-gray-100 text-gray-700 text-gray-800 rounded-lg hover:bg-gray-200 hover:bg-gray-300 transition-all duration-200 font-semibold"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

// Componente StudentList: muestra y gestiona la lista de alumnos.
// Incluye funciones para crear, editar y eliminar alumnos, así como acciones grupales.
const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Filtros grado, grupo y turno
  const [gradoFiltro, setGradoFiltro] = useState('');
  const [showGradoDropdown, setShowGradoDropdown] = useState(false);
  const gradoBtnRef = useRef<HTMLDivElement>(null);
  const gradoMenuRef = useRef<HTMLDivElement>(null);
  const [gradoDropdownPos, setGradoDropdownPos] = useState({ top: 0, left: 0 });
  const [grupoFiltro, setGrupoFiltro] = useState('');
  const [showGrupoDropdown, setShowGrupoDropdown] = useState(false);
  const grupoBtnRef = useRef<HTMLDivElement>(null);
  const grupoMenuRef = useRef<HTMLDivElement>(null);
  const [grupoDropdownPos, setGrupoDropdownPos] = useState({ top: 0, left: 0 });
  const [turnoFiltro, setTurnoFiltro] = useState('');
  const [showTurnoDropdown, setShowTurnoDropdown] = useState(false);
  const turnoBtnRef = useRef<HTMLDivElement>(null);
  const turnoMenuRef = useRef<HTMLDivElement>(null);
  const [turnoDropdownPos, setTurnoDropdownPos] = useState({ top: 0, left: 0 });
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isDeleteGroupMode, setIsDeleteGroupMode] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<number[]>([]);
  const [groupActionMode, setGroupActionMode] = useState<'edit' | 'delete' | null>(null);
  const [showFilterWarning, setShowFilterWarning] = useState(false);
  const [modalGrado, setModalGrado] = useState('');
  const [modalGrupo, setModalGrupo] = useState('');
  const [pendingGroupAction, setPendingGroupAction] = useState<'edit' | 'delete' | null>(null);
  // Estado para mostrar el modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // Estado para mostrar mensaje de éxito
  const [successMessage, setSuccessMessage] = useState('');
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [isBulkEditLoading, setIsBulkEditLoading] = useState(false);
  const [isBulkEditConfirmOpen, setIsBulkEditConfirmOpen] = useState(false);
  const [bulkEditConfirmData, setBulkEditConfirmData] = useState<{ nuevoGrupo?: string } | null>(null);

  // Ordenar y filtrar alumnos antes de cualquier uso
  const sortedStudents = [...students].sort((a, b) => b.id - a.id);

  // Función para normalizar texto y quitar tildes/acentos
  function normalizeText(str: string) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  const filteredStudents = sortedStudents.filter(student => {
    const searchMatch = normalizeText(student.name).includes(normalizeText(searchTerm));
    if (gradoFiltro && (!student.group || student.group.replace(/[^0-9]/g, '') !== gradoFiltro)) return false;
    if (grupoFiltro && (!student.group || student.group.replace(/[^A-Z]/gi, '') !== grupoFiltro)) return false;
    if (turnoFiltro && student.turno !== turnoFiltro) return false;
    return searchMatch;
  });

  // --- PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));
  // Resetear página al cambiar filtros o búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, gradoFiltro, grupoFiltro, turnoFiltro, itemsPerPage]);
  // Alumnos paginados
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Cuando se activa el modo eliminar grupo, selecciona todos los IDs filtrados
  useEffect(() => {
    if (isDeleteGroupMode) {
      setSelectedToDelete(filteredStudents.map(s => s.id));
    } else {
      setSelectedToDelete([]);
    }
  }, [isDeleteGroupMode]); // <-- Solo depende de isDeleteGroupMode

  const handleToggleDelete = (id: number) => {
    setSelectedToDelete(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // Posición menú grado
  useEffect(() => {
    if (showGradoDropdown && gradoBtnRef.current) {
      const rect = gradoBtnRef.current.getBoundingClientRect();
      setGradoDropdownPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
    }
  }, [showGradoDropdown]);
  // Posición menú grupo
  useEffect(() => {
    if (showGrupoDropdown && grupoBtnRef.current) {
      const rect = grupoBtnRef.current.getBoundingClientRect();
      setGrupoDropdownPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
    }
  }, [showGrupoDropdown]);
  // Posición menú turno
  useEffect(() => {
    if (showTurnoDropdown && turnoBtnRef.current) {
      const rect = turnoBtnRef.current.getBoundingClientRect();
      setTurnoDropdownPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
    }
  }, [showTurnoDropdown]);
  // Cerrar menús al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showGradoDropdown &&
        gradoBtnRef.current &&
        gradoMenuRef.current &&
        !gradoBtnRef.current.contains(event.target as Node) &&
        !gradoMenuRef.current.contains(event.target as Node)
      ) {
        setShowGradoDropdown(false);
      }
      if (
        showGrupoDropdown &&
        grupoBtnRef.current &&
        grupoMenuRef.current &&
        !grupoBtnRef.current.contains(event.target as Node) &&
        !grupoMenuRef.current.contains(event.target as Node)
      ) {
        setShowGrupoDropdown(false);
      }
      if (
        showTurnoDropdown &&
        turnoBtnRef.current &&
        turnoMenuRef.current &&
        !turnoBtnRef.current.contains(event.target as Node) &&
        !turnoMenuRef.current.contains(event.target as Node)
      ) {
        setShowTurnoDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showGradoDropdown, showGrupoDropdown, showTurnoDropdown]);

  useEffect(() => {
    if ((!gradoFiltro || !grupoFiltro) && groupActionMode !== null) {
      setGroupActionMode(null);
      setIsDeleteGroupMode(false);
    }
  }, [gradoFiltro, grupoFiltro]);

  useEffect(() => {
    if (groupActionMode !== null && selectedToDelete.length === 0) {
      setGroupActionMode(null);
      setIsDeleteGroupMode(false);
    }
  }, [selectedToDelete]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAlumnos();
      setStudents(data.map((a: any) => ({
        id: a.id,
        name: a.nombre,
        group: a.grupo,
        turno: a.turno,
        ingreso: a.ingreso
      })));
    } catch (err) {
      setError('Error al cargar los alumnos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleCreateStudent = async (studentData: any) => {
    try {
      await createAlumno(studentData);
      await fetchStudents();
      setIsModalOpen(false);
      setSuccessMessage('Alumno creado con éxito');
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err) {
      setError('Error al crear el alumno.');
    }
  };

  const handleEditStudent = async (studentData: any) => {
    if (!editStudent) return;
    try {
      await updateAlumno(editStudent.id, studentData);
      await fetchStudents();
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditStudent(null);
    } catch (err) {
      setError('Error al actualizar el alumno.');
    }
  };

  const handleDeleteStudent = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este alumno?')) {
      try {
        await deleteAlumno(id);
        await fetchStudents();
      } catch (err) {
        setError('Error al eliminar el alumno.');
      }
    }
  };

  const handleOpenEditModal = (student: Student) => {
    setEditStudent(student);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setEditStudent(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditStudent(null);
  };

  // Lógica para alta masiva
  const handleBulkSubmit = async (data: { alumnos: { nombre: string; grupo: string; turno: string; ingreso: number }[] }) => {
    const res = await fetch(`${API_URL}/alumnos/bulk`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error en alta masiva');
    await fetchStudents();
    setSuccessMessage('Grupo de alumnos agregado con éxito');
    setTimeout(() => setSuccessMessage(''), 3500);
  };

  // Lógica para enviar la edición masiva
  const handleBulkEditGroup = async ({ nuevoGrupo }: { nuevoGrupo?: string }) => {
    setIsBulkEditModalOpen(false); // 1. Cierra el modal de edición
    setSearchTerm(''); // 3. Limpia el filtro de búsqueda
    setBulkEditConfirmData({ nuevoGrupo });
    setIsBulkEditConfirmOpen(true);
  };

  const handleConfirmBulkEdit = async () => {
    if (!bulkEditConfirmData) return;
    setIsBulkEditLoading(true);
    try {
      const grupo = gradoFiltro + grupoFiltro;
      const excluirIds = filteredStudents.filter(s => !selectedToDelete.includes(s.id)).map(s => s.id);
      const body: any = { grupo };
      if (bulkEditConfirmData.nuevoGrupo) body.nuevoGrupo = bulkEditConfirmData.nuevoGrupo;
      if (excluirIds.length > 0) body.excluirIds = excluirIds;
      const res = await fetch(`${API_URL}/alumnos/grupo`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Error al editar el grupo');
      await fetchStudents();
      setSuccessMessage('Grupo de alumnos editado con éxito');
      setTimeout(() => setSuccessMessage(''), 3500);
      setIsBulkEditConfirmOpen(false);
      setBulkEditConfirmData(null);
      setIsBulkEditModalOpen(false);
      setGroupActionMode(null);
      setIsDeleteGroupMode(false);
      setGradoFiltro('');
      setGrupoFiltro('');
      setTurnoFiltro('');
    } catch (err) {
      setError('Error al editar el grupo.');
    } finally {
      setIsBulkEditLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <div className="text-red-600 mb-2">{error}</div>
        <button 
          onClick={fetchStudents}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-gray-900 mb-1 md:mb-2">Perfiles de Alumnos</h1>
          <p className="text-sm md:text-base text-gray-600 text-gray-700">Administra los perfiles de los estudiantes</p>
        </div>

        {/* Search and Create Section */}
        <div className="bg-white bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4 md:mb-8 border-2 border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative mb-3 xl:mb-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Ingrese nombre"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white bg-white text-gray-900 text-gray-900"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none px-2"
                    tabIndex={-1}
                    aria-label="Limpiar búsqueda"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
              <button
                onClick={handleOpenCreateModal}
                className={`w-auto px-3 md:px-6 py-2 md:py-3 text-xs md:text-base rounded-lg transition-all duration-200 font-medium flex items-center gap-1 md:gap-2 shadow-lg hover:shadow-xl 
                  ${groupActionMode ? 'bg-blue-300 text-white cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                disabled={!!groupActionMode}
              >
                <UserIcon className="w-4 h-4 md:w-5 md:h-5" />
                <span className="inline md:hidden">Alumno</span>
                <span className="inline md:hidden font-bold text-lg leading-none">+</span>
                <span className="hidden md:inline">Crear Alumno</span>
              </button>
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className={`w-auto px-3 md:px-6 py-2 md:py-3 text-xs md:text-base rounded-lg transition-all duration-200 font-medium flex items-center gap-1 md:gap-2 shadow-lg hover:shadow-xl 
                  ${groupActionMode ? 'bg-emerald-300 text-white cursor-not-allowed' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                disabled={!!groupActionMode}
              >
                <UsersIcon className="w-4 h-4 md:w-5 md:h-5" />
                <span className="inline md:hidden">Grupo</span>
                <span className="inline md:hidden font-bold text-lg leading-none">+</span>
                <span className="hidden md:inline">Agregar Grupo</span>
              </button>
              {/* Botones para modo edición/eliminación de grupo */}
              {groupActionMode === 'edit' && isDeleteGroupMode ? (
                <>
                                      <button
                      onClick={() => setIsBulkEditModalOpen(true)}
                      className="w-auto px-3 md:px-6 py-2 md:py-3 text-xs md:text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium flex items-center gap-1 md:gap-2 shadow-lg hover:shadow-xl"
                    >
                      <Edit className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="inline md:hidden">Editar</span>
                      <span className="hidden md:inline">Editar</span>
                    </button>
                    <button
                      onClick={() => { setGroupActionMode(null); setIsDeleteGroupMode(false); setGradoFiltro(''); setGrupoFiltro(''); setTurnoFiltro(''); }}
                      className="w-auto px-3 md:px-6 py-2 md:py-3 text-xs md:text-base bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all duration-200 font-medium flex items-center gap-1 md:gap-2 shadow-lg hover:shadow-xl"
                    >
                      <span className="inline md:hidden">Cancelar</span>
                      <span className="hidden md:inline">Cancelar</span>
                    </button>
                </>
              ) : groupActionMode === 'delete' && isDeleteGroupMode ? (
                <>
                  <button
                    onClick={() => { setSearchTerm(''); setShowDeleteModal(true); }}
                    className="w-auto px-3 md:px-6 py-2 md:py-3 text-xs md:text-base bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-medium flex items-center gap-1 md:gap-2 shadow-lg hover:shadow-xl"
                  >
                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="inline md:hidden">Eliminar</span>
                    <span className="hidden md:inline">Eliminar Selección</span>
                  </button>
                  <button
                    onClick={() => { setGroupActionMode(null); setIsDeleteGroupMode(false); setGradoFiltro(''); setGrupoFiltro(''); setTurnoFiltro(''); }}
                    className="w-auto px-3 md:px-6 py-2 md:py-3 text-xs md:text-base bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all duration-200 font-medium flex items-center gap-1 md:gap-2 shadow-lg hover:shadow-xl"
                  >
                    <span className="inline md:hidden">Cancelar</span>
                    <span className="hidden md:inline">Cancelar</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Botones originales de Editar y Eliminar Grupo */}
                  {groupActionMode === 'edit' ? (
                    <button
                      onClick={() => { setGroupActionMode(null); setIsDeleteGroupMode(false); setGradoFiltro(''); setGrupoFiltro(''); setTurnoFiltro(''); }}
                      className="w-full sm:w-auto px-2 xl:px-6 py-2 xl:py-3 text-xs xl:text-base bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all duration-200 font-medium flex items-center gap-1 xl:gap-2 shadow-lg hover:shadow-xl"
                    >
                      <span className="inline xl:hidden">Cancelar</span>
                      <span className="hidden xl:inline">Cancelar</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (!gradoFiltro || !grupoFiltro) {
                          setPendingGroupAction('edit');
                          setShowFilterWarning(true);
                          return;
                        }
                        setGroupActionMode('edit');
                        setIsDeleteGroupMode(true);
                      }}
                      className={`w-auto px-3 md:px-6 py-2 md:py-3 text-xs md:text-base rounded-lg transition-all duration-200 font-medium flex items-center gap-1 md:gap-2 shadow-lg hover:shadow-xl 
                        ${groupActionMode ? 'bg-blue-300 text-white cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                      disabled={!!groupActionMode}
                    >
                      <Edit className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="inline md:hidden">Editar</span>
                      <span className="hidden md:inline">Editar Grupo</span>
                    </button>
                  )}
                  {groupActionMode === 'delete' ? (
                    <button
                      onClick={() => { setGroupActionMode(null); setIsDeleteGroupMode(false); setGradoFiltro(''); setGrupoFiltro(''); setTurnoFiltro(''); }}
                      className="w-full sm:w-auto px-2 xl:px-6 py-2 xl:py-3 text-xs xl:text-base bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all duration-200 font-medium flex items-center gap-1 xl:gap-2 shadow-lg hover:shadow-xl"
                    >
                      <span className="inline xl:hidden">Cancelar</span>
                      <span className="hidden xl:inline">Cancelar</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (!gradoFiltro || !grupoFiltro) {
                          setPendingGroupAction('delete');
                          setShowFilterWarning(true);
                          return;
                        }
                        setGroupActionMode('delete');
                        setIsDeleteGroupMode(true);
                      }}
                      className={`w-auto px-3 md:px-6 py-2 md:py-3 text-xs md:text-base rounded-lg transition-all duration-200 font-medium flex items-center gap-1 md:gap-2 shadow-lg hover:shadow-xl 
                        ${groupActionMode ? 'bg-red-300 text-white cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'}`}
                      disabled={!!groupActionMode}
                    >
                      <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="inline md:hidden">Eliminar</span>
                      <span className="hidden md:inline">Eliminar Grupo</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          {/* Filtros grado y grupo debajo de la búsqueda */}
          <div className="flex items-center flex-wrap pt-2 mb-2 md:mb-4 gap-1 md:gap-2">
            {/* Filtro de grado */}
            <div className="relative" ref={gradoBtnRef}>
              <button
                type="button"
                className={`flex items-center gap-1 px-2 md:px-3 py-1.5 md:py-2 rounded-lg transition-all duration-200 text-xs md:text-sm font-medium ${
                  gradoFiltro 
                    ? 'bg-blue-200 bg-blue-200 text-blue-800 text-blue-800 hover:bg-blue-300 hover:bg-blue-300'
                    : 'bg-gray-200 bg-gray-100 text-gray-700 text-gray-800 hover:bg-gray-300 hover:bg-gray-300'
                }`}
                onClick={() => {
                  if (!showGradoDropdown && gradoBtnRef.current) {
                    const rect = gradoBtnRef.current.getBoundingClientRect();
                    setGradoDropdownPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
                  }
                  if (gradoFiltro) {
                    setGradoFiltro('');
                  } else {
                    setShowGradoDropdown(v => !v);
                  }
                }}
              >
                {gradoFiltro || 'Grado'}
                {gradoFiltro ? <span className="font-bold">×</span> : <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>}
              </button>
              {showGradoDropdown && (
                <div
                  ref={gradoMenuRef}
                  className="z-50 bg-white bg-white border border-gray-300 border-gray-200 rounded shadow-lg w-32 fixed"
                  style={{ top: gradoDropdownPos.top, left: gradoDropdownPos.left }}
                >
                  <button
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-100 hover:bg-gray-200 ${gradoFiltro === '' ? 'font-bold' : ''}`}
                    onClick={() => { setGradoFiltro(''); setShowGradoDropdown(false); }}
                  >
                    Todos
                  </button>
                  {[1,2,3].map(n => (
                    <button
                      key={n}
                      className={`block w-full text-left px-4 py-2 hover:bg-blue-100 hover:bg-blue-100 ${gradoFiltro === String(n) ? 'font-bold bg-blue-100 bg-blue-100 text-blue-800 text-blue-800' : 'text-blue-800 text-blue-800'}`}
                      onClick={() => { setGradoFiltro(String(n)); setShowGradoDropdown(false); }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Filtro de grupo */}
            <div className="relative" ref={grupoBtnRef}>
              <button
                type="button"
                className={`flex items-center gap-1 px-2 md:px-3 py-1.5 md:py-2 rounded-lg transition-all duration-200 text-xs md:text-sm font-medium ${
                  grupoFiltro 
                    ? 'bg-blue-200 bg-blue-200 text-blue-800 text-blue-800 hover:bg-blue-300 hover:bg-blue-300'
                    : 'bg-gray-200 bg-gray-100 text-gray-700 text-gray-800 hover:bg-gray-300 hover:bg-gray-300'
                }`}
                onClick={() => {
                  if (!showGrupoDropdown && grupoBtnRef.current) {
                    const rect = grupoBtnRef.current.getBoundingClientRect();
                    setGrupoDropdownPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
                  }
                  if (grupoFiltro) {
                    setGrupoFiltro('');
                  } else {
                    setShowGrupoDropdown(v => !v);
                  }
                }}
              >
                {grupoFiltro || 'Grupo'}
                {grupoFiltro ? <span className="font-bold">×</span> : <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>}
              </button>
              {showGrupoDropdown && (
                <div
                  ref={grupoMenuRef}
                  className="z-50 bg-white bg-white border border-gray-300 border-gray-200 rounded shadow-lg w-32 fixed max-h-48 overflow-y-auto"
                  style={{ top: grupoDropdownPos.top, left: grupoDropdownPos.left }}
                >
                  <button
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-100 hover:bg-gray-200 ${grupoFiltro === '' ? 'font-bold' : ''}`}
                    onClick={() => { setGrupoFiltro(''); setShowGrupoDropdown(false); }}
                  >
                    Todos
                  </button>
                  {['A','B','C','D','E','F','G','H','I','J','K','L'].map(letra => (
                    <button
                      key={letra}
                      className={`block w-full text-left px-4 py-2 hover:bg-blue-100 hover:bg-blue-100 ${grupoFiltro === letra ? 'font-bold bg-blue-100 bg-blue-100 text-blue-800 text-blue-800' : 'text-blue-800 text-blue-800'}`}
                      onClick={() => { setGrupoFiltro(letra); setShowGrupoDropdown(false); }}
                    >
                      {letra}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Filtro de turno */}
            <div className="relative" ref={turnoBtnRef}>
              <button
                type="button"
                className={`flex items-center gap-1 px-2 md:px-3 py-1.5 md:py-2 rounded-lg transition-all duration-200 text-xs md:text-sm font-medium ${
                  turnoFiltro 
                    ? turnoFiltro === 'Matutino'
                      ? 'bg-blue-200 bg-blue-200 text-blue-800 text-blue-800 hover:bg-blue-300 hover:bg-blue-300'
                      : 'bg-orange-200 bg-orange-200 text-orange-800 text-orange-800 hover:bg-orange-300 hover:bg-orange-300'
                    : 'bg-gray-200 bg-gray-100 text-gray-700 text-gray-800 hover:bg-gray-300 hover:bg-gray-300'
                }`}
                onClick={() => {
                  if (!showTurnoDropdown && turnoBtnRef.current) {
                    const rect = turnoBtnRef.current.getBoundingClientRect();
                    setTurnoDropdownPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
                  }
                  if (turnoFiltro) {
                    setTurnoFiltro('');
                  } else {
                    setShowTurnoDropdown(v => !v);
                  }
                }}
              >
                {turnoFiltro || 'Turno'}
                {turnoFiltro ? <span className="font-bold">×</span> : <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>}
              </button>
              {showTurnoDropdown && (
                <div
                  ref={turnoMenuRef}
                  className="z-50 bg-white bg-white border border-gray-300 border-gray-200 rounded shadow-lg w-40 fixed"
                  style={{ top: turnoDropdownPos.top, left: turnoDropdownPos.left }}
                >
                  <button
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-100 hover:bg-gray-200 ${turnoFiltro === '' ? 'font-bold' : ''}`}
                    onClick={() => { setTurnoFiltro(''); setShowTurnoDropdown(false); }}
                  >
                    Todos
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 hover:bg-blue-100 hover:bg-blue-100 ${turnoFiltro === 'Matutino' ? 'font-bold bg-blue-100 bg-blue-100 text-blue-800 text-blue-800' : 'text-blue-800 text-blue-800'}`}
                    onClick={() => { setTurnoFiltro('Matutino'); setShowTurnoDropdown(false); }}
                  >
                    Matutino
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 hover:bg-orange-100 hover:bg-orange-100 ${turnoFiltro === 'Vespertino' ? 'font-bold bg-orange-100 bg-orange-100 text-orange-800 text-orange-800' : 'text-orange-800 text-orange-800'}`}
                    onClick={() => { setTurnoFiltro('Vespertino'); setShowTurnoDropdown(false); }}
                  >
                    Vespertino
                  </button>
                </div>
              )}
            </div>
            {/* Botón Limpiar Filtros */}
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setGradoFiltro('');
                setGrupoFiltro('');
                setTurnoFiltro('');
              }}
              className="flex items-center gap-1 px-2 md:px-3 py-1.5 md:py-2 bg-red-100 text-red-800 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 hover:bg-red-200 transition-all duration-200 text-xs md:text-sm font-medium"
              title="Limpiar todos los filtros"
            >
              Limpiar <span className="font-bold">×</span>
            </button>
          </div>

          {/* Botones de acción de grupo debajo de los filtros */}
          {/* This section is now redundant as buttons are moved */}
        </div>

        {/* Students Table - solo escritorio */}
        <div className="bg-white bg-white rounded-xl shadow-sm overflow-hidden border-2 border-gray-200 hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 bg-white border-b border-gray-200 border-gray-200">
                <tr>
                  {isDeleteGroupMode && <th></th>}
                  <th className="px-6 md:px-2 lg:px-4 xl:px-6 py-4 md:py-2 lg:py-3 xl:py-4 text-left text-base md:text-sm lg:text-base xl:text-[1.05rem] font-bold text-gray-900 text-gray-900">ID alumno</th>
                  <th className="px-6 md:px-2 lg:px-4 xl:px-6 py-4 md:py-2 lg:py-3 xl:py-4 text-left text-base md:text-sm lg:text-base xl:text-[1.05rem] font-bold text-gray-900 text-gray-900">Nombre</th>
                  <th className="px-6 md:px-2 lg:px-4 xl:px-6 py-4 md:py-2 lg:py-3 xl:py-4 text-left text-base md:text-sm lg:text-base xl:text-[1.05rem] font-bold text-gray-900 text-gray-900">Grupo</th>
                  <th className="px-6 md:px-2 lg:px-4 xl:px-6 py-4 md:py-2 lg:py-3 xl:py-4 text-left text-base md:text-sm lg:text-base xl:text-[1.05rem] font-bold text-gray-900 text-gray-900">Turno</th>
                  <th className="px-6 md:px-2 lg:px-4 xl:px-6 py-4 md:py-2 lg:py-3 xl:py-4 text-left text-base md:text-sm lg:text-base xl:text-[1.05rem] font-bold text-gray-900 text-gray-900">Ingreso</th>
                  <th className="px-6 md:px-2 lg:px-4 xl:px-6 py-4 md:py-2 lg:py-3 xl:py-4 text-center text-base md:text-sm lg:text-base xl:text-[1.05rem] font-bold text-gray-900 text-gray-900">Opciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 divide-gray-200">
                {paginatedStudents.map((student, idx) => (
                  <tr
                    key={student.id}
                    className={`transition-colors duration-150 hover:bg-orange-50
                      ${isDeleteGroupMode && selectedToDelete.includes(student.id)
                        ? 'bg-blue-200'
                        : idx % 2 === 0
                          ? 'bg-white'
                          : 'bg-gray-50'}`}
                    onClick={isDeleteGroupMode ? (e) => {
                      if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') return;
                      handleToggleDelete(student.id);
                    } : undefined}
                    style={isDeleteGroupMode ? { cursor: 'pointer' } : {}}
                  >
                    {isDeleteGroupMode && (
                      <td className="px-2 text-center">
                        <input
                          type="checkbox"
                          checked={selectedToDelete.includes(student.id)}
                          onChange={() => handleToggleDelete(student.id)}
                          className="w-4 h-4 accent-blue-600"
                        />
                      </td>
                    )}
                    <td className="px-6 md:px-2 lg:px-4 xl:px-6 py-4 md:py-2 lg:py-3 xl:py-4 text-gray-900 text-gray-900 font-medium border-r border-gray-200 border-gray-200 text-base md:text-sm lg:text-base xl:text-[1.05rem]">{student.id}</td>
                    <td className="px-6 md:px-2 lg:px-4 xl:px-6 py-4 md:py-2 lg:py-3 xl:py-4 text-gray-900 text-gray-900 font-medium border-r border-gray-200 border-gray-200 whitespace-normal text-base md:text-sm lg:text-base xl:text-[1.05rem]">{student.name}</td>
                    <td className="px-6 md:px-2 lg:px-4 xl:px-6 py-4 md:py-2 lg:py-3 xl:py-4 border-r border-gray-200 border-gray-200">
                      <span className="inline-flex px-3 md:px-2 lg:px-3 xl:px-4 py-1 md:py-0.5 lg:py-1 xl:py-1.5 rounded-full text-sm md:text-xs lg:text-sm xl:text-base font-medium bg-blue-100 bg-blue-100 text-blue-800 text-blue-800">
                        {student.group}
                      </span>
                    </td>
                    <td className="px-6 md:px-2 lg:px-3 xl:px-4 py-4 md:py-2 lg:py-3 xl:py-4 border-r border-gray-200 border-gray-200">
                      <span className={`inline-flex px-3 md:px-2 lg:px-3 xl:px-4 py-1 md:py-0.5 lg:py-1 xl:py-1.5 rounded-full text-sm md:text-xs lg:text-sm xl:text-base font-semibold
                        ${student.turno === 'Matutino'
                          ? 'bg-blue-100 text-blue-900 bg-blue-100 text-blue-800'
                          : 'bg-orange-100 text-orange-900 bg-orange-100 text-orange-800'
                        }
                      `}>
                        {student.turno}
                      </span>
                    </td>
                    <td className="px-6 md:px-2 lg:px-4 xl:px-6 py-4 md:py-2 lg:py-3 xl:py-4 text-gray-900 text-gray-900 font-medium border-r border-gray-200 border-gray-200 text-base md:text-sm lg:text-base xl:text-[1.05rem]">{student.ingreso}</td>
                    <td className="px-6 md:px-2 lg:px-4 xl:px-6 py-4 md:py-2 lg:py-3 xl:py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          className="p-2 md:p-1 lg:p-2 xl:p-2 text-gray-600 text-blue-700 hover:text-blue-600 hover:text-blue-600 hover:bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200"
                          onClick={() => handleOpenEditModal(student)}
                        >
                          <Edit className="w-5 h-5 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-5 xl:h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="p-2 md:p-1 lg:p-2 xl:p-2 text-gray-600 text-red-700 hover:text-red-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        >
                          <Trash2 className="w-5 h-5 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-5 xl:h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tarjetas de alumnos - solo móvil */}
        <div className="space-y-1 md:hidden">
          {paginatedStudents.map((student) => {
            const isSelected = isDeleteGroupMode && selectedToDelete.includes(student.id);
            return (
              <div
                key={student.id}
                className={`relative bg-white rounded-lg shadow-sm border-2 border-gray-200 p-1.5 flex flex-col gap-0.5 transition-colors duration-150
                  ${isDeleteGroupMode && isSelected ? 'bg-blue-200 border-blue-400' : ''}
                  ${isDeleteGroupMode ? 'cursor-pointer' : ''}
                `}
                onClick={isDeleteGroupMode ? (e) => {
                  // Evitar que el click en el checkbox dispare el toggle doble
                  if ((e.target as HTMLElement).tagName.toLowerCase() === 'input') return;
                  handleToggleDelete(student.id);
                } : undefined}
              >
                {isDeleteGroupMode && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleDelete(student.id)}
                    className="absolute left-1 top-1 w-5 h-5 accent-blue-600 z-10 bg-white rounded border border-gray-300"
                    onClick={e => e.stopPropagation()}
                  />
                )}
                <div className="flex justify-between items-center pl-6">
                  <span className="text-xs font-bold text-gray-400 text-gray-500">ID</span>
                  <span className="text-xs font-semibold text-gray-900 text-gray-900">{student.id}</span>
                </div>
                <div className="text-sm font-medium text-gray-900 text-gray-900 pl-6">{student.name}</div>
                <div className="flex flex-wrap gap-1 text-xs items-center pl-6">
                  <span className="inline-flex px-1.5 py-0.5 rounded-full bg-blue-100 bg-blue-100 text-blue-800 text-blue-800 text-xs">{student.group}</span>
                  <span className={`inline-flex px-1.5 py-0.5 rounded-full font-semibold text-xs
                    ${student.turno === 'Matutino'
                      ? 'bg-blue-100 text-blue-900 bg-blue-100 text-blue-800'
                      : 'bg-orange-100 text-orange-900 bg-orange-100 text-orange-800'
                    }
                  `}>{student.turno}</span>
                </div>
                <div className="flex flex-wrap gap-1 text-xs items-center pl-6">
                  <span className="inline-flex px-1.5 py-0.5 rounded-full bg-gray-100 bg-gray-100 text-gray-800 text-gray-800 text-xs">{student.ingreso}</span>
                </div>
                <div className="flex flex-wrap justify-end gap-1 pt-0.5 pl-6">
                  <button
                    className="p-1 text-gray-600 text-blue-700 hover:text-blue-600 hover:text-blue-600 hover:bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200"
                    onClick={e => { e.stopPropagation(); handleOpenEditModal(student); }}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleDeleteStudent(student.id); }}
                    className="p-1 text-gray-600 text-red-700 hover:text-red-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 mb-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredStudents.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      )}

      <StudentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={isEditMode ? handleEditStudent : handleCreateStudent}
        editData={isEditMode && editStudent ? { name: editStudent.name, group: editStudent.group, turno: editStudent.turno, ingreso: editStudent.ingreso } : undefined}
        isEditMode={isEditMode}
      />
      <BulkStudentModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onBulkSubmit={handleBulkSubmit}
        disableBackdropClose={true}
      />
      <BulkEditGroupModal
        isOpen={isBulkEditModalOpen}
        onClose={() => setIsBulkEditModalOpen(false)}
        onSubmit={handleBulkEditGroup}
        loading={isBulkEditLoading}
      />
      <BulkEditConfirmModal
        isOpen={isBulkEditConfirmOpen}
        onClose={() => { setIsBulkEditConfirmOpen(false); setBulkEditConfirmData(null); }}
        onConfirm={handleConfirmBulkEdit}
        total={filteredStudents.length}
        seleccionados={selectedToDelete.length}
        grupoOrigen={gradoFiltro + grupoFiltro}
        grupoDestino={bulkEditConfirmData?.nuevoGrupo}
        loading={isBulkEditLoading}
      />
      {/* Modal de advertencia para filtros obligatorios */}
      {showFilterWarning && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowFilterWarning(false)}
        >
          <div 
            className="bg-white bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 text-gray-900">Atención</h2>
              <button
                onClick={() => setShowFilterWarning(false)}
                className="p-2 hover:bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                <span className="text-gray-500 text-gray-700">✕</span>
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 text-gray-700 text-center mb-6">
                <strong>Debes seleccionar un <span className='text-blue-600'>Grado</span> y un <span className='text-blue-600'>Grupo</span> en los filtros.</strong><br />
                Es necesario para poder editar o eliminar un grupo de alumnos.
              </p>
              <div className="flex gap-2 mb-6 justify-center">
                <select
                  value={modalGrado}
                  onChange={e => setModalGrado(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white bg-white text-gray-900 text-gray-900"
                >
                  <option value="">Grado</option>
                  {[1,2,3].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <select
                  value={modalGrupo}
                  onChange={e => setModalGrupo(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white bg-white text-gray-900 text-gray-900"
                >
                  <option value="">Grupo</option>
                  {['A','B','C','D','E','F','G','H','I','J','K','L'].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                {modalGrado && modalGrupo ? (
                  <button
                    onClick={() => {
                      setGradoFiltro(modalGrado);
                      setGrupoFiltro(modalGrupo);
                      setShowFilterWarning(false);
                      if (groupActionMode === null) {
                        // Si el usuario abrió el modal desde Editar o Eliminar, activa el modo correspondiente
                        if (pendingGroupAction === 'edit') {
                          setGroupActionMode('edit');
                          setIsDeleteGroupMode(true);
                        } else if (pendingGroupAction === 'delete') {
                          setGroupActionMode('delete');
                          setIsDeleteGroupMode(true);
                        }
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 font-semibold"
                  >
                    Seleccionar
                  </button>
                ) : (
                  <button
                    onClick={() => setShowFilterWarning(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 bg-gray-100 text-gray-700 text-gray-800 rounded-lg hover:bg-gray-200 hover:bg-gray-300 transition-all duration-200 font-semibold"
                  >
                    Entendido
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200 border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 text-gray-900">Confirmar eliminación</h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-2 hover:bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                <span className="text-gray-500 text-gray-700">✕</span>
              </button>
            </div>
            <div className="p-6">
              {(() => {
                const grupo = gradoFiltro + grupoFiltro;
                const total = filteredStudents.length;
                const seleccionados = selectedToDelete.length;
                const noEliminados = total - seleccionados;
                if (seleccionados === total) {
                  return (
                    <p className="text-gray-700 text-gray-700 text-center mb-6">
                      <strong>¿Eliminar <span className='text-red-600'>{total}</span> alumnos del grupo <span className='text-blue-600'>{grupo}</span>?</strong><br />
                      Esta acción eliminará <span className='font-bold text-red-600'>todos los alumnos</span> de este grupo.
                    </p>
                  );
                } else {
                  return (
                    <p className="text-gray-700 text-gray-700 text-center mb-6">
                      <strong>¿Eliminar <span className='text-red-600'>{seleccionados}</span> alumnos del grupo <span className='text-blue-600'>{grupo}</span>?</strong><br />
                      Se conservarán <span className='font-bold text-green-600'>{noEliminados}</span> alumnos de este grupo.
                    </p>
                  );
                }
              })()}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={async () => {
                    try {
                      const grupo = gradoFiltro + grupoFiltro;
                      const excluirIds = filteredStudents.filter(s => !selectedToDelete.includes(s.id)).map(s => s.id);
                      const res = await fetch(`${API_URL}/alumnos/grupo`, {
                        method: 'DELETE',
                        headers: getAuthHeaders(),
                        body: JSON.stringify({ grupo, excluirIds })
                      });
                      if (!res.ok) throw new Error('Error al eliminar el grupo');
                      await fetchStudents();
                      setGroupActionMode(null);
                      setIsDeleteGroupMode(false);
                      setShowDeleteModal(false);
                      setGradoFiltro('');
                      setGrupoFiltro('');
                      setTurnoFiltro('');
                      setSuccessMessage('Alumnos eliminados con éxito');
                      setTimeout(() => setSuccessMessage(''), 3500);
                    } catch (err) {
                      setError('Error al eliminar el grupo.');
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-semibold"
                >
                  Aceptar
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 bg-gray-100 text-gray-700 text-gray-800 rounded-lg hover:bg-gray-200 hover:bg-gray-300 transition-all duration-200 font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Mensaje de éxito */}
      {successMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg text-base font-semibold animate-fade-in-out">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default StudentList;
