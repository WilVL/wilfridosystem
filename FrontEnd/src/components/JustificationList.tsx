import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Edit, Download, Trash2, X, ChevronDown } from 'lucide-react';
import { getJustificantes, createJustificante, updateJustificante, deleteJustificante, getAlumnos, getCurrentUser } from '../services/api';
import { jsPDF } from "jspdf";
import { applyPlugin } from 'jspdf-autotable';

interface Justification {
  id: number;
  tipo_justificante: string;
  departamento: string;
  alumno_id: number;
  alumno_nombre: string;
  grupo: string;
  tutor: string;
  motivo: string;
  fecha_inicio: string;
  fecha_regreso: string;
  tiempo_dias: number;
  total_justificantes: number;
  creado_por?: number; // <-- Agregado
}

interface JustificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any, setTraslapeError: React.Dispatch<React.SetStateAction<string>>, setFormData: React.Dispatch<React.SetStateAction<{
    tipo_justificante: string;
    departamento: string;
    alumno_id: string;
    grupo: string;
    tutor: string;
    motivo: string;
    fecha_inicio: string;
    fecha_regreso: string;
    tiempo_dias: string;
  }>>) => void;
  editData?: any;
  isEditMode?: boolean;
  alumnos: { id: number; nombre: string; grupo: string }[];
  justificantes?: Justification[];
}

const JustificationModal: React.FC<JustificationModalProps> = ({ isOpen, onClose, onSubmit, editData, isEditMode, alumnos, justificantes }) => {
  // Función para mapear rol a departamento
  const getDepartamentoFromRol = (rol: string) => {
    switch (rol?.toLowerCase()) {
      case 'prefecto':
        return 'Prefectura';
      case 'maestro':
        return 'Maestros';
      case 'enfermeria':
        return 'Enfermeria';
      case 'direccion':
        return 'Direccion';
      case 'trabajo social':
        return 'Trabajo Social';
      default:
        return '';
    }
  };

  const currentUser = getCurrentUser();
  const userDepartamento = getDepartamentoFromRol(currentUser?.rol);

  const [formData, setFormData] = useState({
    tipo_justificante: '',
    departamento: userDepartamento, // Se establece automáticamente
    alumno_id: '',
    grupo: '',
    tutor: '',
    motivo: '',
    fecha_inicio: '',
    fecha_regreso: '',
    tiempo_dias: ''
  });
  const [alumnoSearch, setAlumnoSearch] = useState('');
  const [showAlumnoList, setShowAlumnoList] = useState(false);
  const [errorFechaRegreso, setErrorFechaRegreso] = useState('');
  const [traslapeError, setTraslapeError] = useState('');

  useEffect(() => {
    if (isOpen && isEditMode && editData) {
      let fecha = editData.fecha_inicio;
      if (fecha) {
        const d = new Date(fecha);
        if (!isNaN(d.getTime())) {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          fecha = `${year}-${month}-${day}`;
        }
      }
      let fechaRegreso = editData.fecha_regreso;
      if (fechaRegreso) {
        const d = new Date(fechaRegreso);
        if (!isNaN(d.getTime())) {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          fechaRegreso = `${year}-${month}-${day}`;
        }
      }
      setFormData({
        tipo_justificante: editData.tipo_justificante,
        departamento: userDepartamento, // Siempre usa el departamento del usuario actual
        alumno_id: editData.alumno_id,
        grupo: editData.grupo,
        tutor: editData.tutor,
        motivo: editData.motivo,
        fecha_inicio: fecha,
        fecha_regreso: fechaRegreso,
        tiempo_dias: editData.tiempo_dias
      });
      const alumno = alumnos.find(a => a.id === editData.alumno_id);
      setAlumnoSearch(alumno ? alumno.nombre : '');
    } else if (isOpen && !isEditMode) {
      setFormData({ 
        tipo_justificante: '', 
        departamento: userDepartamento, // Siempre usa el departamento del usuario actual
        alumno_id: '', 
        grupo: '', 
        tutor: '', 
        motivo: '', 
        fecha_inicio: '', 
        fecha_regreso: '', 
        tiempo_dias: '' 
      });
      setAlumnoSearch('');
    }
  }, [isOpen, isEditMode, editData, alumnos, userDepartamento]);

  useEffect(() => {
    if (formData.alumno_id) {
      const alumno = alumnos.find(a => a.id === Number(formData.alumno_id));
      setFormData(f => ({ ...f, grupo: alumno ? alumno.grupo : '' }));
    }
  }, [formData.alumno_id, alumnos]);

  // Calcular días hábiles entre dos fechas (sin contar sábados ni domingos)
  function calcularDiasHabiles(fechaInicio: string, fechaRegreso: string) {
    if (!fechaInicio || !fechaRegreso) return '';
    // Normalizar fechas a medianoche
    const start = new Date(fechaInicio + 'T00:00:00');
    const end = new Date(fechaRegreso + 'T00:00:00');
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';
    if (end <= start) return '';
    let count = 0;
    let current = new Date(start);
    // Contar desde el día de inicio hasta el día anterior al de regreso
    while (current < end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  }

  // Validar que fecha_regreso no sea antes de fecha_inicio
  const fechaRegresoInvalida = formData.fecha_inicio && formData.fecha_regreso && (formData.fecha_regreso < formData.fecha_inicio);

  // Actualizar tiempo_dias automáticamente
  useEffect(() => {
    if (formData.fecha_inicio && formData.fecha_regreso && !fechaRegresoInvalida) {
      setFormData(f => ({ ...f, tiempo_dias: String(calcularDiasHabiles(formData.fecha_inicio, formData.fecha_regreso)) }));
    } else {
      setFormData(f => ({ ...f, tiempo_dias: '' }));
    }
    // eslint-disable-next-line
  }, [formData.fecha_inicio, formData.fecha_regreso]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fechaRegresoInvalida) return;
    // Validación extra: la fecha de regreso no puede ser igual a la de inicio
    if (formData.fecha_inicio && formData.fecha_regreso && formData.fecha_inicio === formData.fecha_regreso) {
      setErrorFechaRegreso('La fecha de regreso no puede ser igual a la de inicio.');
      return;
    } else {
      setErrorFechaRegreso('');
    }
    setTraslapeError(''); // Limpiar error de traslape antes de intentar
    onSubmit({ ...formData, alumno_id: Number(formData.alumno_id), tiempo_dias: Number(formData.tiempo_dias) }, setTraslapeError, setFormData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const filteredAlumnos = alumnos.filter(a => a.nombre.toLowerCase().includes(alumnoSearch.toLowerCase()));
  const handleAlumnoSelect = (alumno: { id: number; nombre: string; grupo: string }) => {
    setFormData(f => ({ ...f, alumno_id: String(alumno.id), grupo: alumno.grupo }));
    setAlumnoSearch(alumno.nombre);
    setShowAlumnoList(false);
  };
  const handleClearAlumno = () => {
    setFormData(f => ({ ...f, alumno_id: '', grupo: '' }));
    setAlumnoSearch('');
    setShowAlumnoList(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">{isEditMode ? 'Editar Justificante' : 'Crear Justificante'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            <span className="text-gray-500">✕</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3 sm:space-y-4">
          {traslapeError && (
            <div className="text-red-600 text-sm font-semibold mb-2">{traslapeError}</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Tipo de justificante:</label>
              <select name="tipo_justificante" value={formData.tipo_justificante} onChange={handleInputChange} required className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm">
                <option value="">Selecciona tipo</option>
                <option value="Enfermedad">Enfermedad</option>
                <option value="Familiar">Familiar</option>
                <option value="Escolar">Escolar</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Departamento:</label>
              <input 
                type="text" 
                name="departamento" 
                value={formData.departamento} 
                readOnly 
                className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-900 cursor-not-allowed text-sm" 
                placeholder="Se establece automáticamente según tu rol"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Alumno:</label>
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
                  className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 pr-10 text-sm"
                  required
                />
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
                {showAlumnoList && filteredAlumnos.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                    {filteredAlumnos.map(a => {
                      // Buscar el conteo de justificantes para este alumno
                      const justificantesCount = justificantes?.find((j: Justification) => j.alumno_id === a.id)?.total_justificantes || 0;
                      return (
                        <li
                          key={a.id}
                          className="px-4 py-2 cursor-pointer hover:bg-pink-100"
                          onClick={() => handleAlumnoSelect(a)}
                        >
                          <div className="flex justify-between items-center">
                            <span>{a.nombre} ({a.grupo})</span>
                            <span className="text-xs text-gray-500 font-medium">
                              {justificantesCount} justificante{justificantesCount !== 1 ? 's' : ''} este mes
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Grupo:</label>
              <input type="text" name="grupo" value={formData.grupo} readOnly className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-900 text-sm" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Tutor:</label>
              <input type="text" name="tutor" value={formData.tutor} onChange={handleInputChange} required className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Motivo:</label>
              <div className="relative">
                <textarea 
                  name="motivo" 
                  value={formData.motivo} 
                  onChange={handleInputChange} 
                  maxLength={120}
                  required 
                  className="w-full px-3 sm:px-4 py-2 pr-16 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm" 
                  rows={3} 
                />
                <div className="absolute bottom-2 right-2 text-xs font-medium">
                  <span className={`${
                    formData.motivo.length >= 120 
                      ? 'text-red-500' 
                      : formData.motivo.length >= 96 
                      ? 'text-orange-500' 
                      : 'text-gray-500'
                  }`}>
                    {formData.motivo.length}/120
                  </span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Fecha de inicio:</label>
              <input 
                type="date" 
                name="fecha_inicio" 
                value={formData.fecha_inicio} 
                onChange={handleInputChange} 
                required={!isEditMode}
                className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm" 
                max={formData.fecha_regreso || undefined}
              />
              {formData.fecha_inicio && (
                <div className="text-xs text-gray-500 mt-1">
                  No asiste a partir del {(() => {
                    const [year, month, day] = formData.fecha_inicio.split('-');
                    const d = new Date(Number(year), Number(month) - 1, Number(day));
                    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
                    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
                    const diaSemana = dias[d.getDay()];
                    return `${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)} ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
                  })()}
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Fecha de regreso:</label>
              <input 
                type="date" 
                name="fecha_regreso" 
                value={formData.fecha_regreso} 
                onChange={handleInputChange} 
                required
                className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm" 
                min={formData.fecha_inicio || undefined}
              />
              {formData.fecha_regreso && (
                <div className="text-xs text-gray-500 mt-1">
                  Debe Asistir el día {(() => {
                    const [year, month, day] = formData.fecha_regreso.split('-');
                    const d = new Date(Number(year), Number(month) - 1, Number(day));
                    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
                    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
                    const diaSemana = dias[d.getDay()];
                    return `${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)} ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
                  })()}
                </div>
              )}
              {fechaRegresoInvalida && (
                <p className="text-red-500 text-xs mt-1">La fecha de regreso no puede ser antes de la fecha de inicio.</p>
              )}
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-1.5">Duración (días hábiles):</label>
              <input type="number" name="tiempo_dias" value={formData.tiempo_dias} readOnly className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-900 text-sm" />
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3 pt-3">
            <button type="button" onClick={onClose} className="flex-1 px-3 sm:px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold text-sm sm:text-base">Cancelar</button>
            <button type="submit" className="flex-1 px-3 sm:px-5 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-200 font-semibold text-sm sm:text-base">{isEditMode ? 'Guardar Cambios' : 'Crear Justificante'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const getDepartamentoColor = (departamento: string) => {
  switch (departamento) {
    case 'Prefectura':
      return 'bg-blue-100 text-blue-800';
    case 'Maestros':
      return 'bg-orange-100 text-orange-800';
    case 'Enfermeria':
      return 'bg-pink-100 text-pink-800';
    case 'Direccion':
      return 'bg-green-100 text-green-800';
    case 'Trabajo Social':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getDepartamentoButtonColor = (departamento: string) => {
  switch (departamento) {
    case 'Prefectura':
      return 'bg-blue-200 text-blue-800 hover:bg-blue-300';
    case 'Maestros':
      return 'bg-orange-200 text-orange-800 hover:bg-orange-300';
    case 'Enfermeria':
      return 'bg-pink-200 text-pink-800 hover:bg-pink-300';
    case 'Direccion':
      return 'bg-green-200 text-green-800 hover:bg-green-300';
    case 'Trabajo Social':
      return 'bg-purple-200 text-purple-800 hover:bg-purple-300';
    default:
      return 'bg-gray-200 text-gray-700 hover:bg-gray-300';
  }
};

const handleDownloadJustification = async (data: any) => {
  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.setFont("arial", "bold");
  doc.text("SECRETARÍA DE EDUCACIÓN Y CULTURA SUBSECRETARÍA DE EDUCACIÓN BÁSICA",15,10);
  doc.text("DIRECCIÓN DE EDUCACIÓN SECUNDARIA ESTATAL",50,15);
  doc.text("ESC. SECUNDARIA NO.22 MIGUEL HIDALGO Y COSTILLA CLAVE 26EES00221, ZONA",15,25);
  doc.text("ESCOLAR 01",95,30);

  doc.setFont("arial", "normal");
  doc.text("S.L.R.C SON., a ",90,40);
  doc.text("JUSTIFICANTE",90,45);

  doc.setFontSize(10);
  doc.setFont("arial", "normal");
  doc.text(`Nombre del alumno(a): ${data.alumno_nombre}`,10,60);
  doc.text(`Tipo de justificante: ${data.tipo_justificante}`,10,70);
  doc.text(`Departamento: ${data.departamento}`,10,80);
  doc.text(`Tutor: ${data.tutor}`,10,90);
  doc.text(`Motivo: ${data.motivo}`,10,100);

  const dateFI = new Date(data.fecha_inicio);
  const day = String(dateFI.getDate()).padStart(2, '0');
  const month = String(dateFI.getMonth() + 1).padStart(2, '0');
  const year = dateFI.getFullYear();
  doc.text(`Fecha de inicio: ${day}-${month}-${year}`,10,110);

  const dateFR = new Date(data.fecha_regreso);
  const dayR = String(dateFR.getDate()).padStart(2, '0');
  const monthR = String(dateFR.getMonth() + 1).padStart(2, '0');
  const yearR = dateFR.getFullYear();
  doc.text(`Fecha de regreso: ${dayR}-${monthR}-${yearR}`,10,120);
  doc.text(`Dias de justificación: ${data.tiempo_dias}`,10,130);

  doc.text(`Nombre del maestro (a)`,10,150);
  doc.text(`Materia`,110,150);
  doc.text(`Firma`,170,150);

  doc.setLineWidth(0.5);

  for(let i=0; i<8; i++) {
    const y = 160 + i*10;
    doc.text(`Profr(a)`,10,y);
    doc.line(25, y+2, 80, y+2 );
    doc.line(90, y+2, 140, y+2 );
    doc.line(150, y+2, 200, y+2 );
  }

  doc.save(`Justificante_${data.id}.pdf`);
};

const JustificationList: React.FC = () => {
  const [justifications, setJustifications] = useState<Justification[]>([]);
  const [alumnos, setAlumnos] = useState<{ id: number; nombre: string; grupo: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editJustification, setEditJustification] = useState<Justification | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorFechaRegreso, setErrorFechaRegreso] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState(''); // '', 'Enfermedad', 'Familiar', 'Escolar', 'Otros'
  const [showTipoDropdown, setShowTipoDropdown] = useState(false);
  const tipoBtnRef = useRef<HTMLDivElement>(null);
  const tipoMenuRef = useRef<HTMLDivElement>(null);
  const [tipoDropdownPos, setTipoDropdownPos] = useState({ top: 0, left: 0 });
  const [departamentoFiltro, setDepartamentoFiltro] = useState(''); // '', 'Prefectura', 'Maestros', 'Enfermeria', 'Direccion', 'Trabajo Social'
  const [showDepartamentoDropdown, setShowDepartamentoDropdown] = useState(false);
  const departamentoBtnRef = useRef<HTMLDivElement>(null);
  const departamentoMenuRef = useRef<HTMLDivElement>(null);
  const [departamentoDropdownPos, setDepartamentoDropdownPos] = useState({ top: 0, left: 0 });
  const [gradoFiltro, setGradoFiltro] = useState(''); // '', '1', '2', '3'
  const [showGradoDropdown, setShowGradoDropdown] = useState(false);
  const gradoBtnRef = useRef<HTMLDivElement>(null);
  const gradoMenuRef = useRef<HTMLDivElement>(null);
  const [gradoDropdownPos, setGradoDropdownPos] = useState({ top: 0, left: 0 });
  const [grupoFiltro, setGrupoFiltro] = useState(''); // '', 'A', 'B', ...
  const [showGrupoDropdown, setShowGrupoDropdown] = useState(false);
  const grupoBtnRef = useRef<HTMLDivElement>(null);
  const grupoMenuRef = useRef<HTMLDivElement>(null);
  const [grupoDropdownPos, setGrupoDropdownPos] = useState({ top: 0, left: 0 });
  const [fechaFiltro, setFechaFiltro] = useState(''); // '', 'Hoy', 'Semana', 'Mes', 'Año'
  const [showFechaDropdown, setShowFechaDropdown] = useState(false);
  const fechaBtnRef = useRef<HTMLDivElement>(null);
  const fechaMenuRef = useRef<HTMLDivElement>(null);
  const [fechaDropdownPos, setFechaDropdownPos] = useState({ top: 0, left: 0 });
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [fechaFiltroGlow, setFechaFiltroGlow] = useState(false);
  const [creadoPorMi, setCreadoPorMi] = useState(false);
  const currentUser = getCurrentUser();
  const [turnoFiltro, setTurnoFiltro] = useState<'Apagado' | 'Matutino' | 'Vespertino'>('Apagado');

  // Posición del menú de tipo
  useEffect(() => {
    if (showTipoDropdown && tipoBtnRef.current) {
      const rect = tipoBtnRef.current.getBoundingClientRect();
      setTipoDropdownPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
    }
  }, [showTipoDropdown]);
  // Cerrar menú al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showTipoDropdown &&
        tipoBtnRef.current &&
        tipoMenuRef.current &&
        !tipoBtnRef.current.contains(event.target as Node) &&
        !tipoMenuRef.current.contains(event.target as Node)
      ) {
        setShowTipoDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTipoDropdown]);

  // Posición del menú de departamento
  useEffect(() => {
    if (showDepartamentoDropdown && departamentoBtnRef.current) {
      const rect = departamentoBtnRef.current.getBoundingClientRect();
      setDepartamentoDropdownPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
    }
  }, [showDepartamentoDropdown]);
  // Cerrar menú al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showDepartamentoDropdown &&
        departamentoBtnRef.current &&
        departamentoMenuRef.current &&
        !departamentoBtnRef.current.contains(event.target as Node) &&
        !departamentoMenuRef.current.contains(event.target as Node)
      ) {
        setShowDepartamentoDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTipoDropdown, showDepartamentoDropdown]);

  // Posición del menú de grado
  useEffect(() => {
    if (showGradoDropdown && gradoBtnRef.current) {
      const rect = gradoBtnRef.current.getBoundingClientRect();
      setGradoDropdownPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
    }
  }, [showGradoDropdown]);
  // Cerrar menú al hacer click fuera
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
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTipoDropdown, showDepartamentoDropdown, showGradoDropdown]);

  // Posición del menú de grupo
  useEffect(() => {
    if (showGrupoDropdown && grupoBtnRef.current) {
      const rect = grupoBtnRef.current.getBoundingClientRect();
      setGrupoDropdownPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
    }
  }, [showGrupoDropdown]);
  // Cerrar menú al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showGrupoDropdown &&
        grupoBtnRef.current &&
        grupoMenuRef.current &&
        !grupoBtnRef.current.contains(event.target as Node) &&
        !grupoMenuRef.current.contains(event.target as Node)
      ) {
        setShowGrupoDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTipoDropdown, showDepartamentoDropdown, showGradoDropdown, showGrupoDropdown]);

  // Posición del menú de fecha
  useEffect(() => {
    if (showFechaDropdown && fechaBtnRef.current) {
      const rect = fechaBtnRef.current.getBoundingClientRect();
      setFechaDropdownPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
    }
  }, [showFechaDropdown]);
  // Cerrar menú al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showFechaDropdown &&
        fechaBtnRef.current &&
        fechaMenuRef.current &&
        !fechaBtnRef.current.contains(event.target as Node) &&
        !fechaMenuRef.current.contains(event.target as Node)
      ) {
        setShowFechaDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTipoDropdown, showDepartamentoDropdown, showGradoDropdown, showGrupoDropdown, showFechaDropdown]);

  const fetchJustifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
              const data = await getJustificantes();
        setJustifications(data.map((j: any) => ({
          id: j.id,
          tipo_justificante: j.tipo_justificante,
          departamento: j.departamento,
          alumno_id: j.alumno_id,
          alumno_nombre: j.nombre_alumno || '',
          grupo: j.grupo_alumno || '',
          tutor: j.tutor,
          motivo: j.motivo,
          fecha_inicio: j.fecha_inicio,
          fecha_regreso: j.fecha_regreso,
          tiempo_dias: j.tiempo_dias,
          total_justificantes: j.total_justificantes || 0,
          creado_por: j.creado_por // <-- Asegura que se asigne
        })));
    } catch (err) {
      setError('Error al cargar los justificantes.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAlumnos = async () => {
    try {
      const data = await getAlumnos();
      setAlumnos(data.map((a: any) => ({ id: a.id, nombre: a.nombre, grupo: a.grupo })));
    } catch (err) {
      setAlumnos([]);
    }
  };

  useEffect(() => {
    fetchJustifications();
    fetchAlumnos();
  }, []);

  const handleCreateJustification = async (data: any, setTraslapeError?: (msg: string) => void, setFormData?: (f: any) => void) => {
    const currentUser = getCurrentUser();
    const isDireccion = currentUser?.rol?.toLowerCase() === 'direccion';
    if (isDireccion && Number(data.tiempo_dias) < 4) {
      if (setTraslapeError) setTraslapeError('Dirección solo puede justificar a partir de cuatro días (mínimo 4)');
      return;
    }
    // Validar traslape en el frontend
    const hayTraslape = justifications.some(j =>
      j.alumno_id === data.alumno_id &&
      new Date(j.fecha_inicio) <= new Date(data.fecha_regreso) &&
      new Date(j.fecha_regreso) >= new Date(data.fecha_inicio)
    );
    if (hayTraslape) {
      if (setTraslapeError && setFormData) {
        setTraslapeError('El alumno ya tiene un justificante que abarca parte o todo ese periodo.');
        setFormData((f: any) => ({ ...f, fecha_inicio: '', fecha_regreso: '', tiempo_dias: '' }));
      } else {
        setError('El alumno ya tiene un justificante que abarca parte o todo ese periodo.');
      }
      return;
    }
    try {
      await createJustificante(data);
      await fetchJustifications();
      setIsModalOpen(false);
    } catch (err: any) {
      if (err && err.message && err.message.includes('abarca parte o todo ese periodo')) {
        if (setTraslapeError && setFormData) {
          setTraslapeError('El alumno ya tiene un justificante que abarca parte o todo ese periodo.');
          setFormData((f: any) => ({ ...f, fecha_inicio: '', fecha_regreso: '', tiempo_dias: '' }));
        } else {
          setError('El alumno ya tiene un justificante que abarca parte o todo ese periodo.');
        }
      } else {
        setError('Error al crear el justificante.');
      }
    }
  };

  const handleEditJustification = async (data: any) => {
    if (!editJustification) return;
    try {
      await updateJustificante(editJustification.id, data);
      await fetchJustifications();
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditJustification(null);
    } catch (err) {
      setError('Error al actualizar el justificante.');
    }
  };

  const handleDeleteJustification = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este justificante?')) {
      try {
        await deleteJustificante(id);
        await fetchJustifications();
      } catch (err) {
        setError('Error al eliminar el justificante.');
      }
    }
  };

  const handleOpenEditModal = (justification: Justification) => {
    setEditJustification(justification);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setEditJustification(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditJustification(null);
  };

  // Ordenar por id descendente para mostrar los más recientes primero
  const sortedJustifications = [...justifications].sort((a, b) => b.id - a.id);

  // Función para normalizar texto y quitar tildes/acentos
  function normalizeText(str: string) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  // En el filtrado, aplicar el filtro de tipo de justificante
  let filteredJustifications = sortedJustifications.filter(justification => {
    const searchMatch = normalizeText(justification.alumno_nombre).includes(normalizeText(searchTerm));
    if (tipoFiltro && justification.tipo_justificante !== tipoFiltro) return false;
    if (departamentoFiltro && justification.departamento !== departamentoFiltro) return false;
    if (gradoFiltro && (!justification.grupo || justification.grupo[0] !== gradoFiltro)) return false;
    if (grupoFiltro && (!justification.grupo || justification.grupo.replace(/[^A-Z]/gi, '') !== grupoFiltro)) return false;
    if (fechaFiltro) {
      const fecha = justification.fecha_inicio?.split('T')[0] || justification.fecha_inicio;
      let entryDate;
      if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        const [year, month, day] = fecha.split('-');
        entryDate = new Date(Number(year), Number(month) - 1, Number(day));
      } else {
        entryDate = new Date(fecha);
      }
      const now = new Date();
      if (fechaFiltro === 'hoy') {
        if (!(entryDate.getDate() === now.getDate() && entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear())) return false;
      } else if (fechaFiltro === 'semana') {
        const firstDay = new Date(now);
        firstDay.setDate(now.getDate() - now.getDay());
        const lastDay = new Date(firstDay);
        lastDay.setDate(firstDay.getDate() + 6);
        if (!(entryDate >= firstDay && entryDate <= lastDay)) return false;
      } else if (fechaFiltro === 'mes') {
        if (!(entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear())) return false;
      } else if (fechaFiltro === 'año') {
        if (!(entryDate.getFullYear() === now.getFullYear())) return false;
      }
    }
    return searchMatch;
  });

  // Mover aquí la función para acceder a justifications
  const handlPrintTable = () => {
    // Verificar si hay algún filtro aplicado
    const hasFilters = searchTerm || tipoFiltro || departamentoFiltro || gradoFiltro || grupoFiltro || fechaFiltro || turnoFiltro !== 'Apagado' || creadoPorMi;
    
    if (!hasFilters) {
      setShowWarningModal(true);
      return;
    }
    
    applyPlugin(jsPDF);
    const doc = new jsPDF();
    // Agregar título
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Lista de Justificantes', 105, 15, { align: 'center' });

    // Agregar fecha y filtros debajo del título
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const now = new Date();
    const fechaStr = `${dias[now.getDay()].charAt(0).toUpperCase() + dias[now.getDay()].slice(1)} ${now.getDate()} de ${meses[now.getMonth()]} de ${now.getFullYear()}, ${String(now.getHours()).padStart(2, '0')}h`;
    let filtros = [];
    if (searchTerm) filtros.push(`Nombre: ${searchTerm}`);
    if (tipoFiltro) filtros.push(`Tipo: ${tipoFiltro}`);
    if (departamentoFiltro) filtros.push(`Departamento: ${departamentoFiltro}`);
    if (gradoFiltro) filtros.push(`Grado: ${gradoFiltro}`);
    if (grupoFiltro) filtros.push(`Grupo: ${grupoFiltro}`);
    if (fechaFiltro) filtros.push(`Fecha: ${fechaFiltro.charAt(0).toUpperCase() + fechaFiltro.slice(1)}`);
    if (turnoFiltro && turnoFiltro !== 'Apagado') filtros.push(`Turno: ${turnoFiltro}`);
    if (creadoPorMi) filtros.push('Creado por mí');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado el: ${fechaStr}`, 105, 22, { align: 'center' });
    doc.setFontSize(11);
    doc.text(`Filtros: ${filtros.length ? filtros.join(' | ') : 'Ninguno'}`, 105, 28, { align: 'center' });
    // Definir las columnas que queremos mostrar (sin 'Opciones')
    const columns = [
      { header: 'ID', dataKey: 'id' },
      { header: 'Tipo', dataKey: 'tipo_justificante' },
      { header: 'Departamento', dataKey: 'departamento' },
      { header: 'Nombre alumno', dataKey: 'alumno_nombre' },
      { header: 'Grupo', dataKey: 'grupo' },
      { header: 'Fecha inicio', dataKey: 'fecha_inicio' },
      { header: 'Fecha regreso', dataKey: 'fecha_regreso' },
      { header: 'Días', dataKey: 'tiempo_dias' }
    ];
    // En handlPrintTable, antes de mapear los rows para el PDF:
    const rows = [...filteredJustifications]
      .sort((a, b) => a.alumno_nombre.localeCompare(b.alumno_nombre, 'es', { sensitivity: 'base' }))
      .map(j => ({
        id: j.id,
        tipo_justificante: j.tipo_justificante,
        departamento: j.departamento,
        alumno_nombre: j.alumno_nombre,
        grupo: j.grupo,
        fecha_inicio: (() => {
          const date = new Date(j.fecha_inicio);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        })(),
        fecha_regreso: (() => {
          const date = new Date(j.fecha_regreso);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
        })(),
        tiempo_dias: j.tiempo_dias
      }));
    // Generar la tabla en el PDF
    (doc as any).autoTable({
      columns,
      body: rows,
      styles: { font: 'arial', fontSize: 10 },
      headStyles: { fillColor: [46, 204, 113] },
      margin: { top: 25 }
    });
    doc.save('lista_justificantes.pdf');
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
          onClick={fetchJustifications}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Justo antes del return principal del componente:
  const handleCloseWarningModal = () => {
    setShowWarningModal(false);
    setFechaFiltroGlow(true);
    setTimeout(() => setFechaFiltroGlow(false), 1000); // 1 segundo
  };

  if (creadoPorMi && currentUser) {
    filteredJustifications = filteredJustifications.filter(j => j.creado_por === currentUser.id);
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Justificantes</h1>
          <p className="text-gray-600">Gestiona y revisa los justificantes de los estudiantes</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border-2 border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Ingrese nombre"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900"
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
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={handlPrintTable}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                Descargar lista
              </button>
              <button
                onClick={handleOpenCreateModal}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-200 font-medium flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Crear justificante
              </button>
            </div>
          </div>
          <div className="flex gap-2 items-center flex-wrap pt-2 mb-4">
            {/* Filtro de tipo de justificante */}
            <div className="relative" ref={tipoBtnRef}>
              <button
                type="button"
                className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 text-sm font-medium"
                onClick={() => {
                  if (!showTipoDropdown && tipoBtnRef.current) {
                    const rect = tipoBtnRef.current.getBoundingClientRect();
                    setTipoDropdownPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
                  }
                  if (tipoFiltro) {
                    setTipoFiltro('');
                  } else {
                    setShowTipoDropdown(v => !v);
                  }
                }}
              >
                {tipoFiltro || 'Tipo'}
                {tipoFiltro ? <span className="font-bold">×</span> : <ChevronDown className="w-4 h-4 inline" />}
              </button>
              {showTipoDropdown && (
                <div
                  ref={tipoMenuRef}
                  className="z-50 bg-white border border-gray-300 rounded shadow-lg w-40 fixed"
                  style={{ top: tipoDropdownPos.top, left: tipoDropdownPos.left }}
                >
                  <button
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${tipoFiltro === '' ? 'font-bold' : ''}`}
                    onClick={() => { setTipoFiltro(''); setShowTipoDropdown(false); }}
                  >
                    Todos
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 hover:bg-green-100 ${tipoFiltro === 'Enfermedad' ? 'font-bold bg-green-100 text-green-800' : 'text-green-800'}`}
                    onClick={() => { setTipoFiltro('Enfermedad'); setShowTipoDropdown(false); }}
                  >
                    Enfermedad
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 hover:bg-blue-100 ${tipoFiltro === 'Familiar' ? 'font-bold bg-blue-100 text-blue-800' : 'text-blue-800'}`}
                    onClick={() => { setTipoFiltro('Familiar'); setShowTipoDropdown(false); }}
                  >
                    Familiar
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 hover:bg-orange-100 ${tipoFiltro === 'Escolar' ? 'font-bold bg-orange-100 text-orange-800' : 'text-orange-800'}`}
                    onClick={() => { setTipoFiltro('Escolar'); setShowTipoDropdown(false); }}
                  >
                    Escolar
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 hover:bg-purple-100 ${tipoFiltro === 'Otros' ? 'font-bold bg-purple-100 text-purple-800' : 'text-purple-800'}`}
                    onClick={() => { setTipoFiltro('Otros'); setShowTipoDropdown(false); }}
                  >
                    Otros
                  </button>
                </div>
              )}

            </div>
            {/* Filtro de departamento */}
            <div className="relative" ref={departamentoBtnRef}>
              <button
                type="button"
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                  departamentoFiltro 
                    ? getDepartamentoButtonColor(departamentoFiltro)
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => {
                  if (!showDepartamentoDropdown && departamentoBtnRef.current) {
                    const rect = departamentoBtnRef.current.getBoundingClientRect();
                    setDepartamentoDropdownPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
                  }
                  if (departamentoFiltro) {
                    setDepartamentoFiltro('');
                  } else {
                    setShowDepartamentoDropdown(v => !v);
                  }
                }}
              >
                {departamentoFiltro || 'Departamento'}
                {departamentoFiltro ? <span className="font-bold">×</span> : <ChevronDown className="w-4 h-4 inline" />}
              </button>
              {showDepartamentoDropdown && (
                <div
                  ref={departamentoMenuRef}
                  className="z-50 bg-white border border-gray-300 rounded shadow-lg w-48 fixed"
                  style={{ top: departamentoDropdownPos.top, left: departamentoDropdownPos.left }}
                >
                  <button
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${departamentoFiltro === '' ? 'font-bold' : ''}`}
                    onClick={() => { setDepartamentoFiltro(''); setShowDepartamentoDropdown(false); }}
                  >
                    Todos
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 hover:bg-blue-100 ${departamentoFiltro === 'Prefectura' ? 'font-bold bg-blue-100 text-blue-800' : 'text-blue-800'}`}
                    onClick={() => { setDepartamentoFiltro('Prefectura'); setShowDepartamentoDropdown(false); }}
                  >
                    Prefectura
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 hover:bg-orange-100 ${departamentoFiltro === 'Maestros' ? 'font-bold bg-orange-100 text-orange-800' : 'text-orange-800'}`}
                    onClick={() => { setDepartamentoFiltro('Maestros'); setShowDepartamentoDropdown(false); }}
                  >
                    Maestros
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 hover:bg-pink-100 ${departamentoFiltro === 'Enfermeria' ? 'font-bold bg-pink-100 text-pink-800' : 'text-pink-800'}`}
                    onClick={() => { setDepartamentoFiltro('Enfermeria'); setShowDepartamentoDropdown(false); }}
                  >
                    Enfermeria
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 hover:bg-green-100 ${departamentoFiltro === 'Direccion' ? 'font-bold bg-green-100 text-green-800' : 'text-green-800'}`}
                    onClick={() => { setDepartamentoFiltro('Direccion'); setShowDepartamentoDropdown(false); }}
                  >
                    Direccion
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 hover:bg-purple-100 ${departamentoFiltro === 'Trabajo Social' ? 'font-bold bg-purple-100 text-purple-800' : 'text-purple-800'}`}
                    onClick={() => { setDepartamentoFiltro('Trabajo Social'); setShowDepartamentoDropdown(false); }}
                  >
                    Trabajo Social
                  </button>
                </div>
              )}

            </div>
            {/* Filtro de grado */}
            <div className="relative" ref={gradoBtnRef}>
              <button
                type="button"
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                  gradoFiltro 
                    ? 'bg-blue-200 text-blue-800 hover:bg-blue-300'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
                {gradoFiltro ? <span className="font-bold">×</span> : <ChevronDown className="w-4 h-4 inline" />}
              </button>
              {showGradoDropdown && (
                <div
                  ref={gradoMenuRef}
                  className="z-50 bg-white border border-gray-300 rounded shadow-lg w-32 fixed"
                  style={{ top: gradoDropdownPos.top, left: gradoDropdownPos.left }}
                >
                  <button
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${gradoFiltro === '' ? 'font-bold' : ''}`}
                    onClick={() => { setGradoFiltro(''); setShowGradoDropdown(false); }}
                  >
                    Todos
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 hover:bg-blue-100 ${gradoFiltro === '1' ? 'font-bold bg-blue-100 text-blue-800' : 'text-blue-800'}`}
                    onClick={() => { setGradoFiltro('1'); setShowGradoDropdown(false); }}
                  >
                    1
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 hover:bg-blue-100 ${gradoFiltro === '2' ? 'font-bold bg-blue-100 text-blue-800' : 'text-blue-800'}`}
                    onClick={() => { setGradoFiltro('2'); setShowGradoDropdown(false); }}
                  >
                    2
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 hover:bg-blue-100 ${gradoFiltro === '3' ? 'font-bold bg-blue-100 text-blue-800' : 'text-blue-800'}`}
                    onClick={() => { setGradoFiltro('3'); setShowGradoDropdown(false); }}
                  >
                    3
                  </button>
                </div>
              )}

            </div>
            {/* Filtro de grupo */}
            <div className="relative" ref={grupoBtnRef}>
              <button
                type="button"
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                  grupoFiltro 
                    ? 'bg-blue-200 text-blue-800 hover:bg-blue-300'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
                {grupoFiltro ? <span className="font-bold">×</span> : <ChevronDown className="w-4 h-4 inline" />}
              </button>
              {showGrupoDropdown && (
                <div
                  ref={grupoMenuRef}
                  className="z-50 bg-white border border-gray-300 rounded shadow-lg w-32 fixed max-h-48 overflow-y-auto"
                  style={{ top: grupoDropdownPos.top, left: grupoDropdownPos.left }}
                >
                  <button
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${grupoFiltro === '' ? 'font-bold' : ''}`}
                    onClick={() => { setGrupoFiltro(''); setShowGrupoDropdown(false); }}
                  >
                    Todos
                  </button>
                  {['A','B','C','D','E','F','G','H','I','J','K','L'].map(letra => (
                    <button
                      key={letra}
                      className={`block w-full text-left px-4 py-2 hover:bg-blue-100 ${grupoFiltro === letra ? 'font-bold bg-blue-100 text-blue-800' : 'text-blue-800'}`}
                      onClick={() => { setGrupoFiltro(letra); setShowGrupoDropdown(false); }}
                    >
                      {letra}
                    </button>
                  ))}
                </div>
              )}

            </div>
            {/* Filtro de fecha */}
            <div className="relative" ref={fechaBtnRef}>
              <button
                type="button"
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                  fechaFiltroGlow
                    ? 'ring-2 ring-blue-400 bg-blue-100 text-blue-800'
                    : fechaFiltro
                      ? 'bg-blue-200 text-blue-800 hover:bg-blue-300'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => {
                  if (!showFechaDropdown && fechaBtnRef.current) {
                    const rect = fechaBtnRef.current.getBoundingClientRect();
                    setFechaDropdownPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
                  }
                  if (fechaFiltro) {
                    setFechaFiltro('');
                  } else {
                    setShowFechaDropdown(v => !v);
                  }
                }}
              >
                {(fechaFiltro ? fechaFiltro.charAt(0).toUpperCase() + fechaFiltro.slice(1) : 'Fecha')}
                {fechaFiltro ? <span className="font-bold">×</span> : <ChevronDown className="w-4 h-4 inline" />}
              </button>
              {showFechaDropdown && (
                <div
                  ref={fechaMenuRef}
                  className="z-50 bg-white border border-gray-300 rounded shadow-lg w-40 fixed"
                  style={{ top: fechaDropdownPos.top, left: fechaDropdownPos.left }}
                >
                  <button
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${fechaFiltro === '' ? 'font-bold' : ''}`}
                    onClick={() => { setFechaFiltro(''); setShowFechaDropdown(false); }}
                  >
                    Todos
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 hover:bg-blue-100 ${fechaFiltro === 'hoy' ? 'font-bold bg-blue-100 text-blue-800' : 'text-blue-800'}`}
                    onClick={() => { setFechaFiltro('hoy'); setShowFechaDropdown(false); }}
                  >
                    Hoy
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 hover:bg-blue-100 ${fechaFiltro === 'semana' ? 'font-bold bg-blue-100 text-blue-800' : 'text-blue-800'}`}
                    onClick={() => { setFechaFiltro('semana'); setShowFechaDropdown(false); }}
                  >
                    Esta semana
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 hover:bg-blue-100 ${fechaFiltro === 'mes' ? 'font-bold bg-blue-100 text-blue-800' : 'text-blue-800'}`}
                    onClick={() => { setFechaFiltro('mes'); setShowFechaDropdown(false); }}
                  >
                    Este mes
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 hover:bg-blue-100 ${fechaFiltro === 'año' ? 'font-bold bg-blue-100 text-blue-800' : 'text-blue-800'}`}
                    onClick={() => { setFechaFiltro('año'); setShowFechaDropdown(false); }}
                  >
                    Este año
                  </button>
                </div>
              )}

            </div>
            {/* Botón limpiar filtros */}
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setTipoFiltro('');
                setDepartamentoFiltro('');
                setGradoFiltro('');
                setGrupoFiltro('');
                setFechaFiltro('');
                setCreadoPorMi(false);
              }}
              className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-all duration-200 text-sm font-medium"
              title="Limpiar todos los filtros"
            >
              Limpiar <span className="font-bold">×</span>
            </button>
            {/* En el render de los filtros, antes o junto al filtro de turno: */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
              <input
                type="checkbox"
                id="creadoPorMi"
                checked={creadoPorMi}
                onChange={e => setCreadoPorMi(e.target.checked)}
                className="accent-blue-600 w-4 h-4"
              />
              <label htmlFor="creadoPorMi" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                Creado por mí
              </label>
            </div>
          </div>
        </div>

        {/* Tabla de justificantes - solo escritorio */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border-2 border-gray-200 hidden lg:block" id="tablePdf">
          <div className="overflow-x-auto">
            <table className="w-full">
                              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 lg:px-2 xl:px-4 py-4 lg:py-2 xl:py-3 text-left text-base lg:text-sm xl:text-base font-bold text-gray-900">ID</th>
                  <th className="px-6 lg:px-2 xl:px-4 py-4 lg:py-2 xl:py-3 text-left text-base lg:text-sm xl:text-base font-bold text-gray-900">Tipo</th>
                  <th className="px-6 lg:px-2 xl:px-4 py-4 lg:py-2 xl:py-3 text-left text-base lg:text-sm xl:text-base font-bold text-gray-900">Departamento</th>
                  <th className="px-6 lg:px-2 xl:px-4 py-4 lg:py-2 xl:py-3 text-left text-base lg:text-sm xl:text-base font-bold text-gray-900">Nombre del Alumno</th>
                  <th className="px-6 lg:px-2 xl:px-4 py-4 lg:py-2 xl:py-3 text-left text-base lg:text-sm xl:text-base font-bold text-gray-900">Grupo</th>

                  <th className="px-6 lg:px-2 xl:px-4 py-4 lg:py-2 xl:py-3 text-left text-base lg:text-sm xl:text-base font-bold text-gray-900">Fecha inicio</th>
                  <th className="px-6 lg:px-2 xl:px-4 py-4 lg:py-2 xl:py-3 text-left text-base lg:text-sm xl:text-base font-bold text-gray-900">Fecha regreso</th>
                  <th className="px-6 lg:px-2 xl:px-4 py-4 lg:py-2 xl:py-3 text-left text-base lg:text-sm xl:text-base font-bold text-gray-900">Días</th>
                  <th className="px-6 lg:px-2 xl:px-4 py-4 lg:py-2 xl:py-3 text-center text-base lg:text-sm xl:text-base font-bold text-gray-900">Opciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredJustifications.map((justification, idx) => (
                  <tr key={justification.id} className={`transition-colors duration-150 hover:bg-orange-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 lg:px-2 xl:px-4 py-4 lg:py-2 xl:py-3 border-r border-gray-200 text-base lg:text-sm xl:text-base">{justification.id}</td>
                    <td className="px-6 lg:px-2 xl:px-4 py-4 lg:py-2 xl:py-3 border-r border-gray-200">
                      <span className="inline-flex px-3 lg:px-2 xl:px-3 py-1 lg:py-0.5 xl:py-1 rounded-full text-sm lg:text-xs xl:text-sm font-medium bg-gray-100 text-gray-800">{justification.tipo_justificante}</span>
                    </td>
                    <td className="px-6 lg:px-2 xl:px-4 py-4 lg:py-2 xl:py-3 border-r border-gray-200">
                      <span className={`inline-flex px-3 lg:px-2 xl:px-3 py-1 lg:py-0.5 xl:py-1 rounded-full text-sm lg:text-xs xl:text-sm font-medium ${getDepartamentoColor(justification.departamento)}`}>{justification.departamento}</span>
                    </td>
                    <td className="px-6 lg:px-2 xl:px-4 py-4 lg:py-2 xl:py-3 text-gray-900 font-medium border-r border-gray-200 whitespace-normal text-base lg:text-sm xl:text-base">
                      {justification.alumno_nombre} ({justification.total_justificantes} este mes)
                    </td>
                    <td className="px-6 lg:px-2 xl:px-4 py-4 lg:py-2 xl:py-3 border-r border-gray-200">
                      <span className="inline-flex px-3 lg:px-2 xl:px-3 py-1 lg:py-0.5 xl:py-1 rounded-full text-sm lg:text-xs xl:text-sm font-medium bg-blue-100 text-blue-800">{justification.grupo}</span>
                    </td>

                    <td className="px-6 lg:px-2 xl:px-4 py-4 lg:py-2 xl:py-3 text-gray-700 border-r border-gray-200 text-base lg:text-sm xl:text-base font-bold">{(() => { const date = new Date(justification.fecha_inicio); const day = String(date.getDate()).padStart(2, '0'); const month = String(date.getMonth() + 1).padStart(2, '0'); const year = date.getFullYear(); return `${day}/${month}/${year}`; })()}</td>
                    <td className="px-6 lg:px-2 xl:px-4 py-4 lg:py-2 xl:py-3 text-gray-700 border-r border-gray-200 text-base lg:text-sm xl:text-base font-bold">{(() => { const date = new Date(justification.fecha_regreso); const day = String(date.getDate()).padStart(2, '0'); const month = String(date.getMonth() + 1).padStart(2, '0'); const year = date.getFullYear(); return `${day}/${month}/${year}`; })()}</td>
                    <td className="px-6 lg:px-2 xl:px-4 py-4 lg:py-2 xl:py-3 text-gray-700 border-r border-gray-200 text-base lg:text-sm xl:text-base font-bold">{justification.tiempo_dias}</td>
                    <td className="px-6 lg:px-2 xl:px-4 py-4 lg:py-2 xl:py-3">
                      <div className="flex justify-center gap-2">
                        <button className="p-2 lg:p-1 xl:p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200" onClick={() => handleOpenEditModal(justification)}><Edit className="w-5 h-5 lg:w-4 lg:h-4 xl:w-5 xl:h-5" /></button>
                        <button onClick={() => handleDownloadJustification(justification)} className="p-2 lg:p-1 xl:p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"><Download className="w-5 h-5 lg:w-4 lg:h-4 xl:w-5 xl:h-5" /></button>
                        <button onClick={() => handleDeleteJustification(justification.id)} className="p-2 lg:p-1 xl:p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"><Trash2 className="w-5 h-5 lg:w-4 lg:h-4 xl:w-5 xl:h-5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tarjetas de justificantes - solo móvil/intermedio */}
        <div className="space-y-2 lg:hidden">
          {filteredJustifications.map((justification) => (
            <div key={justification.id} className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-2 flex flex-col gap-1 relative">
              {/* Días en la esquina superior derecha */}
              <span className="absolute top-2 right-2 inline-flex px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold">{justification.tiempo_dias} días</span>
              <div className="flex items-center gap-2 text-xs">
                <span className="inline-flex px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-800">{justification.tipo_justificante}</span>
                <span className={`inline-flex px-2 py-0.5 rounded-full font-medium ${getDepartamentoColor(justification.departamento)}`}>{justification.departamento}</span>
                <span className="inline-flex px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">{justification.grupo}</span>

              </div>
              <div className="text-sm font-medium text-gray-900">{justification.alumno_nombre} ({justification.total_justificantes} este mes)</div>
              <div className="flex flex-col gap-0.5 text-xs items-start">
                <span className="font-bold text-gray-700">Fecha inicio: {(() => { const date = new Date(justification.fecha_inicio); const day = String(date.getDate()).padStart(2, '0'); const month = String(date.getMonth() + 1).padStart(2, '0'); const year = date.getFullYear(); return `${day}/${month}/${year}`; })()}</span>
                <span className="font-bold text-gray-700">Fecha regreso: {(() => { const date = new Date(justification.fecha_regreso); const day = String(date.getDate()).padStart(2, '0'); const month = String(date.getMonth() + 1).padStart(2, '0'); const year = date.getFullYear(); return `${day}/${month}/${year}`; })()}</span>
              </div>
              <div className="flex justify-end gap-1 pt-1">
                <button
                  className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  onClick={() => handleOpenEditModal(justification)}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDownloadJustification(justification)}
                  className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200">
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteJustification(justification.id)}
                  className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <JustificationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={isEditMode ? handleEditJustification : handleCreateJustification}
        editData={isEditMode && editJustification ? editJustification : undefined}
        isEditMode={isEditMode}
        alumnos={alumnos}
        justificantes={justifications}
      />
      
      {/* Modal de advertencia para filtros */}
      {showWarningModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleCloseWarningModal}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300"
            onClick={e => e.stopPropagation()}
          >
                      <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">⚠️ Advertencia</h2>
            <button
              onClick={handleCloseWarningModal}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <span className="text-gray-500">✕</span>
            </button>
          </div>
            <div className="p-6">
              <p className="text-gray-700 text-center mb-6">
                <strong>No has puesto ningún filtro.</strong><br />
                Pon al menos uno para poder descargar la lista.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCloseWarningModal}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JustificationList;