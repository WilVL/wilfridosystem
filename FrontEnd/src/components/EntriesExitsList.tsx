// Componente EntriesExitsList: muestra y gestiona la lista de registros de entradas y salidas (visitas).
// Incluye funciones para crear, editar y eliminar registros.
import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Edit, Trash2, ArrowRight, ArrowLeft, ChevronDown } from 'lucide-react';
import { getEntradasSalidas, createEntradaSalida, updateEntradaSalida, deleteEntradaSalida, getAlumnos } from '../services/api';
import CreateEntryModal from './CreateEntryModal';

const EntriesExitsList: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [alumnos, setAlumnos] = useState<{ id: number; nombre: string; grupo: string; ingreso: number }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editEntry, setEditEntry] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    dia: '',
    tipo: '', // 'Entrada' o 'Salida'
    hora: '', // número de 0 a 23
  });
  const [showTipoDropdown, setShowTipoDropdown] = useState(false);
  const [tipoDropdownPos, setTipoDropdownPos] = useState({ top: 0, left: 0 });
  const tipoBtnRef = useRef<HTMLDivElement>(null);
  const tipoMenuRef = useRef<HTMLDivElement>(null);
  const [showHoraDropdown, setShowHoraDropdown] = useState(false);
  const [horaDropdownPos, setHoraDropdownPos] = useState({ top: 0, left: 0 });
  const horaBtnRef = useRef<HTMLDivElement>(null);
  const horaMenuRef = useRef<HTMLDivElement>(null);
  const [showFechaDropdown, setShowFechaDropdown] = useState(false);
  const [fechaDropdownPos, setFechaDropdownPos] = useState({ top: 0, left: 0 });
  const fechaBtnRef = useRef<HTMLDivElement>(null);
  const fechaMenuRef = useRef<HTMLDivElement>(null);
  const [fechaPreset, setFechaPreset] = useState(''); // '', 'hoy', 'ayer', 'semana', 'mes'
  const [alumnosFiltro, setAlumnosFiltro] = useState(false);

  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getEntradasSalidas();
      setEntries(data);
    } catch (err) {
      setError('Error al cargar las entradas y salidas.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAlumnos = async () => {
    try {
      const data = await getAlumnos();
      setAlumnos(data.map((a: any) => ({ id: a.id, nombre: a.nombre, grupo: a.grupo, ingreso: a.ingreso })));
    } catch (err) {
      setAlumnos([]);
    }
  };

  useEffect(() => {
    fetchEntries();
    fetchAlumnos();
  }, []);

  // Manejar la posición del menú de Tipo
  useEffect(() => {
    if (showTipoDropdown && tipoBtnRef.current) {
      const rect = tipoBtnRef.current.getBoundingClientRect();
      setTipoDropdownPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
    }
  }, [showTipoDropdown]);
  // Manejar la posición del menú de Hora
  useEffect(() => {
    if (showHoraDropdown && horaBtnRef.current) {
      const rect = horaBtnRef.current.getBoundingClientRect();
      setHoraDropdownPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
    }
  }, [showHoraDropdown]);
  // Manejar la posición del menú de Fecha
  useEffect(() => {
    if (showFechaDropdown && fechaBtnRef.current) {
      const rect = fechaBtnRef.current.getBoundingClientRect();
      setFechaDropdownPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
    }
  }, [showFechaDropdown]);

  // Después de los useEffect de posición, agregar este useEffect para cerrar los menús al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Para Tipo
      if (
        showTipoDropdown &&
        tipoBtnRef.current &&
        tipoMenuRef.current &&
        !tipoBtnRef.current.contains(event.target as Node) &&
        !tipoMenuRef.current.contains(event.target as Node)
      ) {
        setShowTipoDropdown(false);
      }
      // Para Hora
      if (
        showHoraDropdown &&
        horaBtnRef.current &&
        horaMenuRef.current &&
        !horaBtnRef.current.contains(event.target as Node) &&
        !horaMenuRef.current.contains(event.target as Node)
      ) {
        setShowHoraDropdown(false);
      }
      // Para Fecha
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
  }, [showTipoDropdown, showHoraDropdown, showFechaDropdown]);

  const handleCreateEntry = async (data: any) => {
    try {
      await createEntradaSalida(data);
      await fetchEntries();
      setIsModalOpen(false);
    } catch (err) {
      setError('Error al crear la visita.');
    }
  };

  const handleEditEntry = async (data: any) => {
    if (!editEntry) return;
    try {
      await updateEntradaSalida(editEntry.id, data);
      await fetchEntries();
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditEntry(null);
    } catch (err) {
      setError('Error al actualizar la visita.');
    }
  };

  const handleDeleteEntry = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro?')) {
      try {
        await deleteEntradaSalida(id);
        await fetchEntries();
      } catch (err) {
        setError('Error al eliminar la visita.');
      }
    }
  };

  const handleOpenEditModal = (entry: any) => {
    setEditEntry(entry);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setEditEntry(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditEntry(null);
  };

  // Ordenar por id descendente para mostrar las más recientes primero
  const sortedEntries = [...entries].sort((a, b) => b.id - a.id);

  // Función para normalizar texto y quitar tildes/acentos
  function normalizeText(str: string) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  // Lógica de filtrado avanzada
  const filteredEntries = sortedEntries.filter(entry => {
    // Filtro de alumnos
    if (alumnosFiltro && (!entry.alumno_id || entry.alumno_id === 0)) return false;
    // Filtro de búsqueda
    const searchMatch = normalizeText(entry.nombre_visita || '').includes(normalizeText(searchTerm)) ||
      normalizeText(entry.nombre_alumno || '').includes(normalizeText(searchTerm));

    // Filtro de fecha preset
    if (fechaPreset) {
      const fecha = entry.fecha_registro?.split(' ')[0];
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      if (fechaPreset === 'hoy') {
        if (fecha !== todayStr) return false;
      } else if (fechaPreset === 'ayer') {
        const ayerDate = new Date(now);
        ayerDate.setDate(now.getDate() - 1);
        const ayerStr = `${ayerDate.getFullYear()}-${pad(ayerDate.getMonth() + 1)}-${pad(ayerDate.getDate())}`;
        if (fecha !== ayerStr) return false;
      } else if (fechaPreset === 'semana') {
        const entryDate = new Date(fecha);
        const firstDay = new Date(now);
        firstDay.setDate(now.getDate() - now.getDay());
        const lastDay = new Date(firstDay);
        lastDay.setDate(firstDay.getDate() + 6);
        if (!(entryDate >= firstDay && entryDate <= lastDay)) return false;
      } else if (fechaPreset === 'mes') {
        const entryDate = new Date(fecha);
        if (!(entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear())) return false;
      }
    }
    // Filtro de rango de fechas
    if (filtros.fechaInicio && filtros.fechaFin) {
      const fecha = entry.fecha_registro?.split(' ')[0];
      if (fecha < filtros.fechaInicio || fecha > filtros.fechaFin) return false;
    }
    // Filtro de día específico
    if (filtros.dia) {
      const fecha = entry.fecha_registro?.split(' ')[0];
      if (fecha !== filtros.dia) return false;
    }
    // Filtro de tipo
    if (filtros.tipo) {
      if (entry.tipo !== filtros.tipo) return false;
    }
    // Filtro de hora
    if (filtros.hora !== '') {
      const horaRegistro = entry.fecha_registro?.split(' ')[1]?.split(':')[0];
      if (parseInt(filtros.hora) !== parseInt(horaRegistro)) return false;
    }
    return searchMatch;
  });

  const getTypeColor = (type: string) => {
    return type === 'Entrada'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const getTypeButtonColor = (type: string) => {
    return type === 'Entrada' 
      ? 'bg-green-200 text-green-800 hover:bg-green-300'
      : type === 'Salida'
      ? 'bg-red-200 text-red-800 hover:bg-red-300'
      : 'bg-gray-200 text-gray-700 hover:bg-gray-300';
  };

  const getTypeIcon = (type: string) => {
    return type === 'Entrada'
      ? <ArrowRight className="w-4 h-4" />
      : <ArrowLeft className="w-4 h-4" />;
  };

  const formatTimeToAMPM = (time24: string) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${ampm}`;
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
          onClick={fetchEntries}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Entradas y Salidas</h1>
          <p className="text-gray-600">Registra y gestiona las entradas y salidas de visitantes</p>
        </div>

        {/* Search and Filters Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border-2 border-gray-200">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 max-w-md flex items-center gap-2">
                <div className="relative flex-1">
                                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Ingrese nombre o alumno"
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
              <div className="flex gap-3">
                <button
                  onClick={handleOpenCreateModal}
                  className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-200 font-medium flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  Crear visita
                </button>
              </div>
            </div>
            {/* Filtros debajo de la barra de búsqueda */}
            <div className="flex gap-2 items-center flex-wrap pt-2 mb-4">
              {/* Filtro de Tipo */}
              <div className="relative" ref={tipoBtnRef}>
                <button
                  type="button"
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    filtros.tipo 
                      ? getTypeButtonColor(filtros.tipo)
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => {
                    if (!showTipoDropdown && tipoBtnRef.current) {
                      const rect = tipoBtnRef.current.getBoundingClientRect();
                      setTipoDropdownPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
                    }
                    if (filtros.tipo) {
                      setFiltros(f => ({...f, tipo: ''}));
                    } else {
                      setShowTipoDropdown(v => !v);
                    }
                  }}
                >
                  {filtros.tipo === 'Entrada' ? 'Entradas' : filtros.tipo === 'Salida' ? 'Salidas' : 'Tipo'}
                  {filtros.tipo ? <span className="font-bold">×</span> : <ChevronDown className="w-4 h-4 inline" />}
                </button>
                {showTipoDropdown && (
                  <div
                    ref={tipoMenuRef}
                    className="z-50 bg-white border border-gray-300 rounded shadow-lg w-32 fixed"
                    style={{ top: tipoDropdownPos.top, left: tipoDropdownPos.left }}
                  >
                    <button
                      className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${filtros.tipo === '' ? 'font-bold' : ''}`}
                      onClick={() => { setFiltros(f => ({...f, tipo: ''})); setShowTipoDropdown(false); }}
                    >
                      Todas
                    </button>
                    <button
                      className={`block w-full text-left px-4 py-2 hover:bg-green-100 ${filtros.tipo === 'Entrada' ? 'font-bold bg-green-100 text-green-800' : 'text-green-800'}`}
                      onClick={() => { setFiltros(f => ({...f, tipo: 'Entrada'})); setShowTipoDropdown(false); }}
                    >
                      <span className="inline-flex items-center gap-2">
                        {getTypeIcon('Entrada')}
                        Entradas
                      </span>
                    </button>
                    <button
                      className={`block w-full text-left px-4 py-2 hover:bg-red-100 ${filtros.tipo === 'Salida' ? 'font-bold bg-red-100 text-red-800' : 'text-red-800'}`}
                      onClick={() => { setFiltros(f => ({...f, tipo: 'Salida'})); setShowTipoDropdown(false); }}
                    >
                      <span className="inline-flex items-center gap-2">
                        {getTypeIcon('Salida')}
                        Salidas
                      </span>
                    </button>
                  </div>
                )}

              </div>
              {/* Filtro de Fecha */}
              <div className="relative" ref={fechaBtnRef}>
                <button
                  type="button"
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    fechaPreset 
                      ? 'bg-purple-200 text-purple-800 hover:bg-purple-300'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => {
                    if (!showFechaDropdown && fechaBtnRef.current) {
                      const rect = fechaBtnRef.current.getBoundingClientRect();
                      setFechaDropdownPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
                    }
                    if (fechaPreset) {
                      setFechaPreset('');
                    } else {
                      setShowFechaDropdown(v => !v);
                    }
                  }}
                >
                  {fechaPreset === 'hoy' ? 'Hoy' : fechaPreset === 'ayer' ? 'Ayer' : fechaPreset === 'semana' ? 'Esta semana' : fechaPreset === 'mes' ? 'Este mes' : 'Fecha'}
                  {fechaPreset ? <span className="font-bold">×</span> : <ChevronDown className="w-4 h-4 inline" />}
                </button>
                {showFechaDropdown && (
                  <div
                    ref={fechaMenuRef}
                    className="z-50 bg-white border border-gray-300 rounded shadow-lg w-40 fixed"
                    style={{ top: fechaDropdownPos.top, left: fechaDropdownPos.left }}
                  >
                    <button
                      className={`block w-full text-left px-4 py-2 hover:bg-purple-100 ${fechaPreset === '' ? 'font-bold' : ''}`}
                      onClick={() => { setFechaPreset(''); setShowFechaDropdown(false); }}
                    >
                      Todas
                    </button>
                    <button
                      className={`block w-full text-left px-4 py-2 hover:bg-purple-100 ${fechaPreset === 'hoy' ? 'font-bold bg-purple-100 text-purple-800' : 'text-purple-800'}`}
                      onClick={() => { setFechaPreset('hoy'); setShowFechaDropdown(false); }}
                    >
                      Hoy
                    </button>
                    <button
                      className={`block w-full text-left px-4 py-2 hover:bg-purple-100 ${fechaPreset === 'ayer' ? 'font-bold bg-purple-100 text-purple-800' : 'text-purple-800'}`}
                      onClick={() => { setFechaPreset('ayer'); setShowFechaDropdown(false); }}
                    >
                      Ayer
                    </button>
                    <button
                      className={`block w-full text-left px-4 py-2 hover:bg-purple-100 ${fechaPreset === 'semana' ? 'font-bold bg-purple-100 text-purple-800' : 'text-purple-800'}`}
                      onClick={() => { setFechaPreset('semana'); setShowFechaDropdown(false); }}
                    >
                      Esta semana
                    </button>
                    <button
                      className={`block w-full text-left px-4 py-2 hover:bg-purple-100 ${fechaPreset === 'mes' ? 'font-bold bg-purple-100 text-purple-800' : 'text-purple-800'}`}
                      onClick={() => { setFechaPreset('mes'); setShowFechaDropdown(false); }}
                    >
                      Este mes
                    </button>
                  </div>
                )}

              </div>
              {/* Filtro de Hora */}
              <div className="relative" ref={horaBtnRef}>
                <button
                  type="button"
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    filtros.hora !== '' 
                      ? 'bg-blue-200 text-blue-800 hover:bg-blue-300'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => {
                    if (!showHoraDropdown && horaBtnRef.current) {
                      const rect = horaBtnRef.current.getBoundingClientRect();
                      setHoraDropdownPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
                    }
                    if (filtros.hora !== '') {
                      setFiltros(f => ({...f, hora: ''}));
                    } else {
                      setShowHoraDropdown(v => !v);
                    }
                  }}
                >
                  {filtros.hora !== '' ? (() => {
                    const i = parseInt(filtros.hora);
                    const hour = i % 12 === 0 ? 12 : i % 12;
                    const ampm = i < 12 ? 'AM' : 'PM';
                    return `${hour} ${ampm}`;
                  })() : 'Hora'}
                  {filtros.hora !== '' ? <span className="font-bold">×</span> : <ChevronDown className="w-4 h-4 inline" />}
                </button>
                {showHoraDropdown && (
                  <div
                    ref={horaMenuRef}
                    className="z-50 bg-white border border-gray-300 rounded shadow-lg w-32 max-h-64 overflow-y-auto fixed"
                    style={{ top: horaDropdownPos.top, left: horaDropdownPos.left }}
                  >
                    <button
                      className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${filtros.hora === '' ? 'font-bold' : ''}`}
                      onClick={() => { setFiltros(f => ({...f, hora: ''})); setShowHoraDropdown(false); }}
                    >
                      Todas
                    </button>
                    {Array.from({length: 24}).map((_, i) => {
                      const hour = i % 12 === 0 ? 12 : i % 12;
                      const ampm = i < 12 ? 'AM' : 'PM';
                      const label = `${hour} ${ampm}`;
                      return (
                        <button
                          key={i}
                          className={`block w-full text-left px-4 py-2 hover:bg-blue-100 ${filtros.hora === String(i) ? 'font-bold bg-blue-100 text-blue-800' : 'text-blue-800'}`}
                          onClick={() => { setFiltros(f => ({...f, hora: String(i)})); setShowHoraDropdown(false); }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}

              </div>
              {/* Filtro de Alumnos */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 w-fit">
                <input
                  type="checkbox"
                  id="alumnosFiltro"
                  checked={alumnosFiltro}
                  onChange={e => setAlumnosFiltro(e.target.checked)}
                  className="accent-blue-600 w-4 h-4"
                />
                <label htmlFor="alumnosFiltro" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                  Alumnos
                </label>
              </div>
              {/* Botón Limpiar Filtros (ahora justo al lado del filtro de Hora) */}
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setFiltros({ fechaInicio: '', fechaFin: '', dia: '', tipo: '', hora: '' });
                  setFechaPreset('');
                  setAlumnosFiltro(false); // Resetear el filtro de alumnos
                }}
                className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-all duration-200 text-sm font-medium"
                title="Limpiar todos los filtros"
              >
                Limpiar <span className="font-bold">×</span>
              </button>
            </div>
          </div>
        </div>

        {/* Entries Table - solo escritorio */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border-2 border-gray-200 hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 md:px-2 lg:px-4 xl:px-6 py-4 md:py-2 lg:py-3 xl:py-4 text-left text-base md:text-sm lg:text-base xl:text-[1.05rem] font-bold text-gray-900">Tipo</th>
                  <th className="px-6 md:px-2 lg:px-4 xl:px-6 py-4 md:py-2 lg:py-3 xl:py-4 text-left text-base md:text-sm lg:text-base xl:text-[1.05rem] font-bold text-gray-900">Fecha</th>
                  <th className="px-6 md:px-2 lg:px-4 xl:px-6 py-4 md:py-2 lg:py-3 xl:py-4 text-left text-base md:text-sm lg:text-base xl:text-[1.05rem] font-bold text-gray-900">Hora</th>
                  <th className="px-6 md:px-2 lg:px-4 xl:px-6 py-4 md:py-2 lg:py-3 xl:py-4 text-left text-base md:text-sm lg:text-base xl:text-[1.05rem] font-bold text-gray-900">Nombre visitante</th>
                  <th className="px-6 md:px-2 lg:px-4 xl:px-6 py-4 md:py-2 lg:py-3 xl:py-4 text-left text-base md:text-sm lg:text-base xl:text-[1.05rem] font-bold text-gray-900">Alumno</th>
                  <th className="px-6 md:px-2 lg:px-4 xl:px-6 py-4 md:py-2 lg:py-3 xl:py-4 text-left text-base md:text-sm lg:text-base xl:text-[1.05rem] font-bold text-gray-900">Motivo</th>
                  <th className="px-6 md:px-2 lg:px-4 xl:px-6 py-4 md:py-2 lg:py-3 xl:py-4 text-center text-base md:text-sm lg:text-base xl:text-[1.05rem] font-bold text-gray-900">Opciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEntries.map((entry, idx) => {
                  // Separar fecha y hora
                  let fecha = '', hora = '';
                  if (entry.fecha_registro) {
                    const [f, h] = entry.fecha_registro.split(' ');
                    if (f && h) {
                      const [year, month, day] = f.split('-');
                      fecha = `${day}/${month}/${year}`;
                      hora = formatTimeToAMPM(h);
                    }
                  }
                  return (
                    <tr key={entry.id} className={`transition-colors duration-150 hover:bg-orange-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                              <td className="px-6 md:px-2 lg:px-3 xl:px-4 py-4 md:py-2 lg:py-3 xl:py-4 border-r border-gray-200">
                        <span className={`inline-flex items-center gap-2 px-3 md:px-2 lg:px-3 xl:px-4 py-1 md:py-0.5 lg:py-1 xl:py-1.5 rounded-full text-sm md:text-xs lg:text-sm xl:text-base font-medium ${getTypeColor(entry.tipo)}`}> 
                          {getTypeIcon(entry.tipo)}
                          {entry.tipo}
                        </span>
                      </td>
                                              <td className="px-6 md:px-2 lg:px-4 xl:px-6 py-4 md:py-2 lg:py-3 xl:py-4 text-gray-900 font-medium border-r border-gray-200 text-base md:text-sm lg:text-base xl:text-[1.05rem]">{fecha}</td>
                        <td className="px-6 md:px-2 lg:px-4 xl:px-6 py-4 md:py-2 lg:py-3 xl:py-4 text-gray-900 font-medium border-r border-gray-200 text-base md:text-sm lg:text-base xl:text-[1.05rem]">{hora}</td>
                        <td className="px-6 md:px-2 lg:px-4 xl:px-6 py-4 md:py-2 lg:py-3 xl:py-4 text-gray-900 font-medium border-r border-gray-200 whitespace-normal text-base md:text-sm lg:text-base xl:text-[1.05rem]">{entry.nombre_visita}</td>
                        <td className="px-6 md:px-2 lg:px-4 xl:px-6 py-4 md:py-2 lg:py-3 xl:py-4 text-gray-900 font-medium border-r border-gray-200 whitespace-normal text-base md:text-sm lg:text-base xl:text-[1.05rem]">
                        {entry.nombre_alumno || '-'}
                        {entry.nombre_alumno && (
                          <span className="ml-2 inline-flex px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                            {alumnos.find(a => a.nombre === entry.nombre_alumno)?.grupo || ''}
                          </span>
                        )}
                      </td>
                                              <td className="px-6 md:px-2 lg:px-4 xl:px-6 py-4 md:py-2 lg:py-3 xl:py-4 text-gray-600 border-r border-gray-200 whitespace-normal text-base md:text-sm lg:text-base xl:text-[1.05rem]">{entry.motivo}</td>
                      <td className="px-6 md:px-2 lg:px-4 xl:px-6 py-4 md:py-2 lg:py-3 xl:py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            className="p-2 md:p-1 lg:p-2 xl:p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            onClick={() => handleOpenEditModal(entry)}
                          >
                            <Edit className="w-5 h-5 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-5 xl:h-5" />
                          </button>
                          <button
                            className="p-2 md:p-1 lg:p-2 xl:p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            onClick={() => handleDeleteEntry(entry.id)}
                          >
                            <Trash2 className="w-5 h-5 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-5 xl:h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tarjetas de entradas/salidas - solo móvil */}
        <div className="space-y-2 md:hidden">
          {filteredEntries.map((entry) => {
            let fecha = '', hora = '';
            if (entry.fecha_registro) {
              const [f, h] = entry.fecha_registro.split(' ');
              if (f && h) {
                const [year, month, day] = f.split('-');
                fecha = `${day}/${month}/${year}`;
                hora = formatTimeToAMPM(h);
              }
            }
            return (
              <div key={entry.id} className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-2 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${getTypeColor(entry.tipo)}`}>{getTypeIcon(entry.tipo)}{entry.tipo}</span>
                  <span className="text-gray-800 dark:text-gray-100 font-bold">{hora}</span>
                  <span className="text-gray-800 dark:text-gray-100 font-bold">{fecha}</span>
                </div>
                <div className="text-sm font-medium text-gray-900">{entry.nombre_visita}</div>
                                  <div className="flex flex-wrap gap-1 text-xs items-center">
                    <span className="inline-flex px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {entry.nombre_alumno || '-'}
                      {entry.nombre_alumno && (
                        <span className="ml-2 inline-flex px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                          {alumnos.find(a => a.nombre === entry.nombre_alumno)?.grupo || ''}
                        </span>
                      )}
                    </span>
                    <span className="inline-flex px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">{entry.motivo}</span>
                  </div>
                <div className="flex justify-end gap-1 pt-1">
                  <button
                    className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    onClick={() => handleOpenEditModal(entry)}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    onClick={() => handleDeleteEntry(entry.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal para crear/editar */}
        <CreateEntryModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={isEditMode ? handleEditEntry : handleCreateEntry}
          editData={editEntry}
          isEditMode={isEditMode}
          alumnos={alumnos}
        />
      </div>
    </div>
  );
};

export default EntriesExitsList;