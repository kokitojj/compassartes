import React, { useState, useEffect, useCallback } from 'react';
import { Provider } from 'react-redux';
import store from '../store';

// Importa el panel de gestión de secciones que ya creamos.
import GroupManagementDashboard from './GroupManagementDashboard.jsx';
import ArtworkForm from './ArtworkForm.jsx'; // <-- AÑADIDO
import BlogPostForm from './BlogPostForm.jsx'; // <-- AÑADIDO
import WellnessStats from './WellnessStats.jsx'; // <-- AÑADIDO
import UserList from './UserList.jsx'; // <-- AÑADIDO

const apiUrl = import.meta.env.VITE_API_URL;

// --- Componente Principal del Dashboard Unificado ---
export default function UnifiedAdminDashboard() {
    // Estado para la vista activa
    const [activeView, setActiveView] = useState('stats');

    // Estados para todos los datos del panel
    const [stats, setStats] = useState({ total_users: 0, total_artworks: 0, total_posts: 0 });
    const [users, setUsers] = useState([]);
    const [artworks, setArtworks] = useState([]);
    const [blogPosts, setBlogPosts] = useState([]);
    const [groups, setGroups] = useState([]); // NUEVO: Estado para las secciones
    
    // Estados de UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentAdminId, setCurrentAdminId] = useState(null);

    // Función para obtener todos los datos necesarios para el admin
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        const userInfo = JSON.parse(localStorage.getItem('compassart-user') || '{}');
        const token = userInfo.token;
        if (!token) {
            setError("No se encontró el token de autenticación.");
            setLoading(false);
            return;
        }
        const headers = { 'Authorization': `Bearer ${token}` };

        try {
            // ACTUALIZADO: Se añade la petición de secciones
            const [statsRes, usersRes, contentRes, groupsRes] = await Promise.all([
                fetch(`${apiUrl}/api/admin/dashboard-stats`, { headers }),
                fetch(`${apiUrl}/api/admin/users`, { headers }),
                fetch(`${apiUrl}/api/admin/all-content`, { headers }),
                fetch(`${apiUrl}/api/public/secciones`, { headers }) // Se usa la ruta pública para obtener la lista
            ]);

            if (!statsRes.ok || !usersRes.ok || !contentRes.ok || !groupsRes.ok) {
                throw new Error('No se pudo cargar toda la información del panel.');
            }

            setStats(await statsRes.json());
            setUsers(await usersRes.json());
            const { obras, blogPosts } = await contentRes.json();
            setArtworks(obras);
            setBlogPosts(blogPosts);
            setGroups(await groupsRes.json()); // NUEVO: Se guardan las secciones en el estado

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const adminUser = JSON.parse(localStorage.getItem('compassart-user') || '{}');
        console.log('adminUser en UnifiedAdminDashboard:', adminUser);
        console.log('adminUser.user.role en UnifiedAdminDashboard:', adminUser.user.role);
        if (adminUser.user.role !== 'admin') {
            window.location.href = '/panel-artista'; // Redirigir a panel-artista si no es admin
            return;
        }
        setCurrentAdminId(adminUser.user.id);
        fetchData();
    }, [fetchData]);

    // --- Funciones de Gestión (sin cambios) ---
    const handleRoleChange = async (userId, newRole) => {
        const token = localStorage.getItem('compassart-token');
        try {
            const response = await fetch(`${apiUrl}/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ role: newRole }),
            });
            if (!response.ok) throw new Error('No se pudo actualizar el rol.');
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (err) { alert(`Error: ${err.message}`); }
    };

    const handleDelete = async (type, id) => {
        if (!confirm('¿Estás seguro? Esta acción es irreversible.')) return;
        const userInfo = JSON.parse(localStorage.getItem('compassart-user'));
        const token = userInfo ? userInfo.token : null;
        const url = `${apiUrl}/api/admin/${type}s/${id}`;
        try {
            const response = await fetch(url, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error(`No se pudo borrar el elemento.`);
            if (type === 'obra') setArtworks(artworks.filter(a => a.id !== id));
            if (type === 'post') setBlogPosts(blogPosts.filter(p => p.id !== id));
        } catch (err) { alert(`Error: ${err.message}`); }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('¿Borrar este usuario? Todas sus destacados y posts serán eliminados.')) return;
        const token = localStorage.getItem('compassart-token');
        try {
            const response = await fetch(`${apiUrl}/api/admin/users/${userId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('No se pudo borrar el usuario.');
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) { alert(`Error: ${err.message}`); }
    };

    // --- Componente para los botones de las pestañas ---
    const TabButton = ({ viewName, label }) => (
        <button 
            onClick={() => setActiveView(viewName)} 
            className={`${activeView === viewName ? 'border-primary-500 text-primary-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
        >
            {label}
        </button>
    );

    // --- Renderizado del Contenido ---
    const renderActiveView = () => {
        switch (activeView) {
            case 'stats':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-secondary p-6 rounded-lg text-center"><h3 className="text-5xl font-bold text-primary-400">{stats.total_users}</h3><p className="text-gray-400 mt-2">Usuarios</p></div>
                        <div className="bg-secondary p-6 rounded-lg text-center"><h3 className="text-5xl font-bold text-primary-400">{stats.total_artworks}</h3><p className="text-gray-400 mt-2">Destacados</p></div>
                        <div className="bg-secondary p-6 rounded-lg text-center"><h3 className="text-5xl font-bold text-primary-400">{stats.total_posts}</h3><p className="text-gray-400 mt-2">Posts</p></div>
                    </div>
                );
            case 'users':
                return <UserList />;
            case 'artworks':
                return (
                    <div>
                        <div className="mb-8">
                            <h3 className="text-2xl font-semibold text-white mb-4">Crear Nuevo Destacado</h3>
                            <ArtworkForm onArtworkCreated={fetchData} />
                        </div>
                        <h3 className="text-2xl font-semibold text-white mb-4">Destacados Existentes</h3>
                        <div className="space-y-4">{artworks.map(obra => (<div key={obra.id} className="bg-secondary p-4 rounded-lg flex justify-between items-center">
                            <div><p className="font-bold text-white">{obra.titulo}</p><p className="text-sm text-gray-400">por {obra.full_name}</p></div>
                            <div className="space-x-2"><a href={`/admin-panel/obras/editar/${obra.id}`} className="text-sm bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md">Editar</a><button onClick={() => handleDelete('obra', obra.id)} className="text-sm bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md">Borrar</button></div>
                        </div>))}</div>
                    </div>
                );
            case 'posts':
                return (
                    <div>
                        <div className="mb-8">
                            <h3 className="text-2xl font-semibold text-white mb-4">Crear Nuevo Post</h3>
                            <BlogPostForm onPostCreated={fetchData} />
                        </div>
                        <h3 className="text-2xl font-semibold text-white mb-4">Posts Existentes</h3>
                        <div className="space-y-4">{blogPosts.map(post => (<div key={post.id} className="bg-secondary p-4 rounded-lg flex justify-between items-center">
                            <div><p className="font-bold text-white">{post.titulo}</p><p className="text-sm text-gray-400">por {post.full_name}</p></div>
                            <div className="space-x-2"><a href={`/admin-panel/blog/editar/${post.id}`} className="text-sm bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md">Editar</a><button onClick={() => handleDelete('post', post.id)} className="text-sm bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md">Borrar</button></div>
                        </div>))}</div>
                    </div>
                );
            // ACTUALIZADO: Pasamos las secciones y la función de recarga como props
            case 'groups':
                return <GroupManagementDashboard initialGroups={groups} onDataChange={fetchData} />;
            case 'wellness':
                return <Provider store={store}><WellnessStats /></Provider>;
            default:
                return null;
        }
    };

    if (loading) return <div className="text-center py-20 text-white">Cargando datos del panel...</div>;

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-backblue min-h-screen text-white">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-10">Panel de Administración</h1>
            {error && <p className="bg-red-900/50 text-red-300 p-3 rounded-md mb-6">{error}</p>}
            
            <div className="mb-8 border-b border-gray-700">
                <nav className="-mb-px flex space-x-4 md:space-x-8" aria-label="Tabs">
                    {/* <TabButton viewName="stats" label="Estadísticas" /> */}
                    <TabButton viewName="wellness" label="Estadísticas" />
                    <TabButton viewName="users" label="Usuarios" />
                    <TabButton viewName="artworks" label="Destacados" />
                    <TabButton viewName="posts" label="Posts" />
                    <TabButton viewName="groups" label="Secciones" />
                    {/* <TabButton viewName="wellness" label="Wellness" /> */}
                </nav>
            </div>

            <div>
                {renderActiveView()}
            </div>
        </div>
    );
}
