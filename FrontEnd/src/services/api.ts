export const API_URL = 'http://localhost:3000/api';

// Funciones para Usuarios
export const getUsers = async () => {
    const response = await fetch(`${API_URL}/users`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        throw new Error('Error al obtener usuarios');
    }
    const data = await response.json();
    // Transformar los datos para que coincidan con la interfaz del frontend
    return data.map((user: any) => ({
        id: user.id,
        nombre: user.nombre,
        rol: user.rol.toLowerCase()
    }));
};

export const createUser = async (userData: any) => {
    const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            nombre: userData.nombre,
            contraseña: userData.password,
            rol: userData.rol
        }),
    });
    if (!response.ok) {
        throw new Error('Error al crear usuario');
    }
    return response.json();
};

export const updateUser = async (id: number, userData: any) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            nombre: userData.nombre,
            contraseña: userData.password,
            rol: userData.rol
        }),
    });
    if (!response.ok) {
        throw new Error('Error al actualizar usuario');
    }
    return response.json();
};

export const deleteUser = async (id: number) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        throw new Error('Error al eliminar usuario');
    }
    return response.json();
};

// Funciones para Alumnos
export const getAlumnos = async () => {
    const response = await fetch(`${API_URL}/alumnos`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        throw new Error('Error al obtener alumnos');
    }
    return response.json();
};

export const createAlumno = async (alumnoData: any) => {
    const response = await fetch(`${API_URL}/alumnos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            nombre: alumnoData.name,
            grupo: alumnoData.group,
            turno: alumnoData.turno,
            ingreso: alumnoData.ingreso
        }),
    });
    if (!response.ok) {
        throw new Error('Error al crear alumno');
    }
    return response.json();
};

export const updateAlumno = async (id: number, alumnoData: any) => {
    const response = await fetch(`${API_URL}/alumnos/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            nombre: alumnoData.name,
            grupo: alumnoData.group,
            turno: alumnoData.turno,
            ingreso: alumnoData.ingreso
        }),
    });
    if (!response.ok) {
        throw new Error('Error al actualizar alumno');
    }
    return response.json();
};

export const deleteAlumno = async (id: number) => {
    const response = await fetch(`${API_URL}/alumnos/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        throw new Error('Error al eliminar alumno');
    }
    return response.json();
};

export const deleteGrupoAlumnos = async (grado: string, grupo: string, excluirIds: number[]) => {
    const response = await fetch(`${API_URL}/alumnos/grupo`, {
        method: 'DELETE',
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grado, grupo, excluirIds }),
    });
    if (!response.ok) {
        throw new Error('Error al eliminar el grupo de alumnos');
    }
    return response.json();
};

// Funciones para Justificantes
export const getJustificantes = async () => {
    const response = await fetch(`${API_URL}/justificantes`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        throw new Error('Error al obtener justificantes');
    }
    return response.json();
};

export const createJustificante = async (justificanteData: any) => {
    const response = await fetch(`${API_URL}/justificantes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(justificanteData),
    });
    if (!response.ok) {
        throw new Error('Error al crear justificante');
    }
    return response.json();
};

export const deleteJustificante = async (id: number) => {
    const response = await fetch(`${API_URL}/justificantes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        throw new Error('Error al eliminar justificante');
    }
    return response.json();
};

export const updateJustificante = async (id: number, justificanteData: any) => {
    const response = await fetch(`${API_URL}/justificantes/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(justificanteData),
    });
    if (!response.ok) {
        throw new Error('Error al actualizar justificante');
    }
    return response.json();
};

// Funciones para Entradas/Salidas
export const getEntradasSalidas = async () => {
    const response = await fetch(`${API_URL}/entradas-salidas`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        throw new Error('Error al obtener entradas/salidas');
    }
    return response.json();
};

export const createEntradaSalida = async (entradaSalidaData: any) => {
    const response = await fetch(`${API_URL}/entradas-salidas`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(entradaSalidaData),
    });
    if (!response.ok) {
        throw new Error('Error al crear entrada/salida');
    }
    return response.json();
};

export const deleteEntradaSalida = async (id: number) => {
    const response = await fetch(`${API_URL}/entradas-salidas/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        throw new Error('Error al eliminar entrada/salida');
    }
    return response.json();
};

export const updateEntradaSalida = async (id: number, entradaSalidaData: any) => {
    const response = await fetch(`${API_URL}/entradas-salidas/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(entradaSalidaData),
    });
    if (!response.ok) {
        throw new Error('Error al actualizar entrada/salida');
    }
    return response.json();
};

// Función de login
export const login = async (credentials: { nombre: string; contraseña: string }) => {
    const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el login');
    }
    
    const data = await response.json();
    
    // Guardar token en localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
};

// Función para obtener el token
export const getToken = () => {
    return localStorage.getItem('token');
};

// Función para obtener el usuario actual
export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

// Función para cerrar sesión
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// Función helper para agregar headers de autorización
export const getAuthHeaders = () => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
}; 