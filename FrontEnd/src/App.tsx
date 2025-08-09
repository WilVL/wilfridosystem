// App principal del frontend. Gestiona rutas, modales y navegación global.
import React, { useState } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import UserList from './components/UserList';
import StudentList from './components/StudentList';
import JustificationList from './components/JustificationList';
import EntriesExitsList from './components/EntriesExitsList';
import CreateProfileModal from './components/CreateProfileModal';
import CreateStudentModal from './components/CreateStudentModal';
import CreateJustificationModal from './components/CreateJustificationModal';
import CreateEntryModal from './components/CreateEntryModal';
import Login from './components/Login';
import { getToken, logout } from './services/api';

// Componente para proteger rutas privadas (requieren login)
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = getToken();
  const location = useLocation();
  if (!token) {
    // Si no hay token, redirige a login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

// Definición de tipos para los tutoriales
interface TutorialStep {
  img?: string;
  text: string;
}
interface TutorialContent {
  title: string;
  steps: TutorialStep[];
}

// Contenido de tutoriales para cada módulo
const TUTORIALS: Record<string, TutorialContent> = {
  personal: {
    title: 'Perfiles Personal',
    steps: [
      { img: '', text: 'En este módulo puedes crear, editar y eliminar perfiles del personal escolar. Haz clic en "Crear perfil" para agregar un nuevo usuario.' },
      { img: '', text: 'Puedes buscar usuarios por nombre y filtrar por rol. Usa los botones de editar o eliminar para gestionar cada usuario.' }
    ]
  },
  alumnos: {
    title: 'Perfiles Alumnos',
    steps: [
      { img: '', text: 'Aquí puedes registrar nuevos alumnos, editar su información o eliminarlos. Haz clic en "Crear alumno" para comenzar.' },
      { img: '', text: 'Utiliza la barra de búsqueda para encontrar alumnos rápidamente. Puedes editar o eliminar desde la lista.' }
    ]
  },
  justificantes: {
    title: 'Justificantes',
    steps: [
      { img: '', text: 'En este módulo puedes registrar justificantes de ausencia para los alumnos. Haz clic en "Crear justificante" para agregar uno nuevo.' },
      { img: '', text: 'Puedes ver el historial de justificantes, filtrarlos, descargarlos individualmente o por listas, además de editarlos si es necesario.' }
    ]
  },
  entradas: {
    title: 'Entradas y Salidas',
    steps: [
      { img: '', text: 'Registra visitas, entradas y salidas de personas externas. Haz clic en "Crear visita" para registrar un nuevo movimiento.' },
      { img: '', text: 'Consulta el historial de movimientos y filtra por fecha, tipo o persona.' }
    ]
  }
};

// Modal reutilizable para mostrar tutoriales
function TutorialModal({ open, onClose, tutorial }: { open: boolean; onClose: () => void; tutorial: TutorialContent | null }) {
  if (!open || !tutorial) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative" onClick={e => e.stopPropagation()}>
        <button className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 rounded-full" onClick={onClose}>✕</button>
        <h2 className="text-2xl font-bold mb-4 text-center">{tutorial.title}</h2>
        <ol className="space-y-4">
          {tutorial.steps.map((step: TutorialStep, idx: number) => (
            <li key={idx} className="flex items-center gap-4">
              {/* Aquí podrías mostrar una imagen o icono si lo deseas */}
              {step.img && <img src={step.img} alt="" className="w-16 h-16 object-contain" />}
              <span className="text-gray-700 text-lg">{step.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function App() {
  // Estados para controlar la visibilidad de los modales
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isJustificationModalOpen, setIsJustificationModalOpen] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const navigate = useNavigate();
  // Estado para mostrar el tutorial
  const [tutorial, setTutorial] = useState<TutorialContent | null>(null);

  // Funciones para abrir cada modal
  const handleCreateProfile = () => { setIsProfileModalOpen(true); };
  const handleCreateStudent = () => { setIsStudentModalOpen(true); };
  const handleCreateJustification = () => { setIsJustificationModalOpen(true); };
  const handleCreateEntry = () => { setIsEntryModalOpen(true); };

  // Funciones para cerrar cada modal
  const handleCloseProfileModal = () => { setIsProfileModalOpen(false); };
  const handleCloseStudentModal = () => { setIsStudentModalOpen(false); };
  const handleCloseJustificationModal = () => { setIsJustificationModalOpen(false); };
  const handleCloseEntryModal = () => { setIsEntryModalOpen(false); };

  // Funciones de ejemplo para manejar el submit de cada modal
  const handleSubmitProfile = (profileData: any) => { console.log('Nuevo perfil creado:', profileData); };
  const handleSubmitStudent = (studentData: any) => { console.log('Nuevo alumno creado:', studentData); };
  const handleSubmitJustification = (justificationData: any) => { console.log('Nuevo justificante creado:', justificationData); };
  const handleSubmitEntry = (entryData: any) => { console.log('Nueva visita creada:', entryData); };

  // Página de inicio (dashboard)
  const HomePage = () => (
    <div className="p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Bienvenido al Sistema</h1>
        <p className="text-xl text-gray-600 mb-8">Panel de administración escolar</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tarjetas de acceso rápido a cada módulo */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setTutorial(TUTORIALS.personal)}>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Perfiles Personal</h3>
            <p className="text-gray-600">Gestiona los perfiles del personal</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setTutorial(TUTORIALS.alumnos)}>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Perfiles Alumnos</h3>
            <p className="text-gray-600">Administra los perfiles estudiantiles</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setTutorial(TUTORIALS.justificantes)}>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Justificantes</h3>
            <p className="text-gray-600">Revisa y gestiona justificantes</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setTutorial(TUTORIALS.entradas)}>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Entradas y Salidas</h3>
            <p className="text-gray-600">Registra visitas y movimientos</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Cierra sesión y redirige a login
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Definición de rutas y renderizado de modales globales
  return (
    <>
      {/* Rutas principales de la app */}
      <Routes>
        {/* Ruta de login */}
        <Route path="/login" element={
          getToken() ? <Navigate to="/home" replace /> : <Login onLoginSuccess={() => navigate('/home', { replace: true })} />
        } />
        {/* Rutas protegidas (requieren autenticación) */}
        <Route path="/*" element={
          <RequireAuth>
            <Layout onLogout={handleLogout}>
              <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/usuarios" element={<UserList />} />
                <Route path="/alumnos" element={<StudentList />} />
                <Route path="/justificantes" element={<JustificationList />} />
                <Route path="/entradas-salidas" element={<EntriesExitsList />} />
                {/* Ruta por defecto */}
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </Layout>
          </RequireAuth>
        } />
      </Routes>

      {/* Modales globales para crear entidades */}
      <CreateProfileModal
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfileModal}
        onSubmit={handleSubmitProfile}
      />
      <CreateStudentModal
        isOpen={isStudentModalOpen}
        onClose={handleCloseStudentModal}
        onSubmit={handleSubmitStudent}
      />
      <CreateJustificationModal
        isOpen={isJustificationModalOpen}
        onClose={handleCloseJustificationModal}
        onSubmit={handleSubmitJustification}
      />
      <CreateEntryModal
        isOpen={isEntryModalOpen}
        onClose={handleCloseEntryModal}
        onSubmit={handleSubmitEntry}
        alumnos={[]}
      />
      <TutorialModal open={!!tutorial} onClose={() => setTutorial(null)} tutorial={tutorial} />
    </>
  );
}

export default App;