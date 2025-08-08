// Componente UserList: muestra y gestiona la lista de usuarios del personal.
// Incluye funciones para crear, editar y eliminar usuarios.
import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { ChevronDown, X as XIcon } from 'lucide-react';
import { getUsers, deleteUser, createUser, updateUser } from '../services/api';
import CreateProfileModal from './CreateProfileModal';

interface User {
  id: number;
  nombre: string;
  rol: 'maestro' | 'prefecto' | 'direccion' | 'trabajo social' | 'enfermeria';
}

const ROLES = [
  { value: '', label: 'Todos' },
  { value: 'maestro', label: 'Maestro' },
  { value: 'prefecto', label: 'Prefecto' },
  { value: 'direccion', label: 'Dirección' },
  { value: 'trabajo social', label: 'Trabajo Social' },
  { value: 'enfermeria', label: 'Enfermería' },
];

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const roleBtnRef = useRef<HTMLDivElement>(null);
  const roleMenuRef = useRef<HTMLDivElement>(null);
  const [roleDropdownPos, setRoleDropdownPos] = useState({ top: 0, left: 0 });

  // Cierra el menú de rol al hacer clic fuera
  useEffect(() => {
    if (!showRoleDropdown) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        roleBtnRef.current &&
        !roleBtnRef.current.contains(event.target as Node) &&
        roleMenuRef.current &&
        !roleMenuRef.current.contains(event.target as Node)
      ) {
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRoleDropdown]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError('Error al cargar los usuarios. Por favor, verifica que el servidor esté funcionando.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (userData: any) => {
    try {
      const newUser = {
        nombre: userData.name,
        password: userData.password,
        rol: userData.role.charAt(0).toUpperCase() + userData.role.slice(1).toLowerCase()
      };
      await createUser(newUser);
      await fetchUsers();
      setIsModalOpen(false);
    } catch (err) {
      setError('Error al crear el usuario. Por favor, intenta nuevamente.');
    }
  };

  const handleEditUser = async (userData: any) => {
    if (!editUser) return;
    try {
      const updatedUser: any = {
        nombre: userData.name,
        rol: userData.role.charAt(0).toUpperCase() + userData.role.slice(1).toLowerCase()
      };
      if (userData.password && userData.password.trim() !== '') {
        updatedUser.password = userData.password;
      }
      await updateUser(editUser.id, updatedUser);
      await fetchUsers();
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditUser(null);
    } catch (err) {
      setError('Error al actualizar el usuario. Por favor, intenta nuevamente.');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await deleteUser(id);
        await fetchUsers();
      } catch (err) {
        setError('Error al eliminar el usuario. Por favor, intenta nuevamente.');
      }
    }
  };

  const handleOpenEditModal = (user: User) => {
    setEditUser(user);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setEditUser(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditUser(null);
  };

  // Ordenar por id descendente para mostrar los más recientes primero
  const sortedUsers = [...users].sort((a, b) => b.id - a.id);

  // Función para normalizar texto y quitar tildes/acentos
  function normalizeText(str: string) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  // Filtrado por término de búsqueda y rol
  const filteredUsers = sortedUsers.filter(user => 
    normalizeText(user.nombre).includes(normalizeText(searchTerm)) &&
    (roleFilter === '' || user.rol === roleFilter)
  );

  // Utilidad para obtener el color de cada rol (usada en la lista y en el filtro)
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'maestro':
        return 'bg-orange-100 text-orange-800';
      case 'prefecto':
        return 'bg-blue-100 text-blue-800';
      case 'direccion':
        return 'bg-green-100 text-green-800';
      case 'trabajo social':
        return 'bg-purple-100 text-purple-800';
      case 'enfermeria':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  const getRoleButtonColor = (role: string) => {
    switch (role) {
      case 'maestro':
        return 'bg-orange-100 text-orange-800';
      case 'prefecto':
        return 'bg-blue-100 text-blue-800';
      case 'direccion':
        return 'bg-green-100 text-green-800';
      case 'trabajo social':
        return 'bg-purple-100 text-purple-800';
      case 'enfermeria':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-200 text-gray-700 hover:bg-gray-300';
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
          onClick={fetchUsers}
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Perfiles</h1>
          <p className="text-gray-600">Administra los perfiles de los usuarios del sistema</p>
        </div>

        {/* Search and Create Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border-2 border-gray-200">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre"
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
                <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium">
                  Buscar
                </button>
                <button
                  onClick={handleOpenCreateModal}
                  className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-200 font-medium flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  Crear nuevo perfil
                </button>
              </div>
            </div>
            {/* Filtro de rol debajo de la barra de búsqueda */}
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <div className="relative" ref={roleBtnRef}>
                <button
                  type="button"
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${getRoleButtonColor(roleFilter)}`}
                  onClick={() => {
                    if (roleFilter) {
                      setRoleFilter('');
                      setShowRoleDropdown(false);
                    } else {
                      if (!showRoleDropdown && roleBtnRef.current) {
                        const rect = roleBtnRef.current.getBoundingClientRect();
                        setRoleDropdownPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
                      }
                      setShowRoleDropdown(v => !v);
                    }
                  }}
                >
                  Rol {roleFilter ? <XIcon className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                </button>
                {showRoleDropdown && (
                  <div
                    ref={roleMenuRef}
                    className="z-50 bg-white border border-gray-300 rounded shadow-lg w-48 fixed"
                    style={{ top: roleDropdownPos.top, left: roleDropdownPos.left }}
                  >
                    {ROLES.map(r => (
                      <button
                        key={r.value}
                        className={`block w-full text-left px-4 py-2 bg-white ${getRoleButtonColor(r.value)} ${roleFilter === r.value ? 'font-bold' : ''} hover:${getRoleColor(r.value).split(' ').join(' hover:')}`}
                        onClick={() => { setRoleFilter(r.value); setShowRoleDropdown(false); }}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Users Table - solo escritorio */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border-2 border-gray-200 hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 md:px-2 lg:px-4 xl:px-6 py-4 md:py-2 lg:py-3 xl:py-4 text-left text-base md:text-sm lg:text-base xl:text-[1.05rem] font-bold text-gray-900">Nombre</th>
                  <th className="px-6 md:px-2 lg:px-4 xl:px-6 py-4 md:py-2 lg:py-3 xl:py-4 text-left text-base md:text-sm lg:text-base xl:text-[1.05rem] font-bold text-gray-900">Rol</th>
                  <th className="px-6 md:px-2 lg:px-4 xl:px-6 py-4 md:py-2 lg:py-3 xl:py-4 text-center text-base md:text-sm lg:text-base xl:text-[1.05rem] font-bold text-gray-900">Opciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user, idx) => (
                  <tr key={user.id} 
                    className={
                      `transition-colors duration-150 ` +
                      `hover:bg-orange-50 ` +
                      `${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`
                    }
                  >
                    <td className="px-6 md:px-2 lg:px-4 xl:px-6 py-4 md:py-2 lg:py-3 xl:py-4 text-gray-900 font-medium border-r border-gray-200 whitespace-normal text-base md:text-sm lg:text-base xl:text-[1.05rem]">{user.nombre}</td>
                    <td className="px-6 md:px-2 lg:px-4 xl:px-6 py-4 md:py-2 lg:py-3 xl:py-4 border-r border-gray-200">
                      <span className={`inline-flex px-3 md:px-2 lg:px-3 xl:px-4 py-1 md:py-0.5 lg:py-1 xl:py-1.5 rounded-full text-sm md:text-xs lg:text-sm xl:text-base font-medium ${getRoleColor(user.rol)}`}>{user.rol.charAt(0).toUpperCase() + user.rol.slice(1)}</span>
                    </td>
                    <td className="px-6 md:px-2 lg:px-4 xl:px-6 py-4 md:py-2 lg:py-3 xl:py-4 text-center flex gap-2 justify-center">
                      <button
                        className="p-2 md:p-1 lg:p-2 xl:p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        onClick={() => handleOpenEditModal(user)}
                      >
                        <Edit className="w-5 h-5 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-5 xl:h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 md:p-1 lg:p-2 xl:p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-5 h-5 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-5 xl:h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tarjetas de usuarios - solo móvil */}
        <div className="space-y-2 md:hidden">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-2 flex flex-col gap-1">
              <div className="text-sm font-medium text-gray-900">{user.nombre}</div>
              <div className="flex flex-wrap gap-1 text-xs items-center">
                <span className={`inline-flex px-2 py-0.5 rounded-full font-medium ${getRoleColor(user.rol)}`}>{user.rol.charAt(0).toUpperCase() + user.rol.slice(1)}</span>
              </div>
              <div className="flex justify-end gap-1 pt-1">
                <button
                  className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  onClick={() => handleOpenEditModal(user)}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateProfileModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={isEditMode ? handleEditUser : handleCreateUser}
        editData={isEditMode && editUser ? {
          name: editUser.nombre,
          password: '', // No mostramos la contraseña actual
          role: editUser.rol.charAt(0).toUpperCase() + editUser.rol.slice(1).toLowerCase()
        } : undefined}
        isEditMode={isEditMode}
      />
    </div>
  );
};

export default UserList; 