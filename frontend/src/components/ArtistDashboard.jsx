import React, { useState, useEffect, useCallback } from 'react';
import Fisioload from './Fisioload'; // Importa el componente Fisioload
import WellnessStats from './WellnessStats'; // Importa el componente de estadísticas

// --- Sub-componente para una fila de Obra de Arte ---
const ArtworkRow = ({ artwork, onDelete, isDeleting }) => (
    <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg border border-gray-700 mb-3">
        <div className="flex items-center min-w-0">
            <img src={artwork.imagen_url} alt={artwork.titulo} className="w-16 h-16 object-cover rounded-md mr-4 flex-shrink-0" />
            <div className="min-w-0">
                <h4 className="font-bold text-white truncate">{artwork.titulo}</h4>
                <p className="text-sm text-gray-400">Subido: {new Date(artwork.fecha_subida).toLocaleDateString()}</p>
            </div>
        </div>
        <div className="flex-shrink-0 ml-4 space-x-2">
            <a href={`/panel-artista/mis-obras/editar/${artwork.id}`} className={`text-sm py-1 px-3 rounded-md transition-colors ${isDeleting ? 'bg-gray-500 text-gray-300 cursor-not-allowed pointer-events-none' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                Editar
            </a>
            <button onClick={() => onDelete(artwork.id)} disabled={isDeleting} className="text-sm bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                {isDeleting ? 'Borrando...' : 'Borrar'}
            </button>
        </div>
    </div>
);

// --- Sub-componente para una fila de Post de Blog ---
const BlogPostRow = ({ post, onDelete, isDeleting }) => (
     <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-3">
        <div className="flex items-start justify-between">
            <div className="min-w-0 pr-4">
                <h4 className="font-bold text-white text-lg">{post.titulo}</h4>
                <p className="text-sm text-gray-500 mb-2">Publicado: {new Date(post.fecha_publicacion).toLocaleDateString()}</p>
                <p className="text-gray-300 text-sm line-clamp-2">{post.contenido}</p>
            </div>
            <div className="flex-shrink-0 ml-4 space-x-2">
                <a href={`/panel-artista/mi-blog/editar/${post.id}`} className={`text-sm py-1 px-3 rounded-md transition-colors ${isDeleting ? 'bg-gray-500 text-gray-300 cursor-not-allowed pointer-events-none' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                  Editar
                </a>
                <button onClick={() => onDelete(post.id)} disabled={isDeleting} className="text-sm bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                    {isDeleting ? 'Borrando...' : 'Borrar'}
                </button>
            </div>
        </div>
    </div>
);

// --- Componente Principal del Dashboard del Artista ---
export default function ArtistDashboard() {
    const [user, setUser] = useState(null);
    const [artworks, setArtworks] = useState([]);
    const [blogPosts, setBlogPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('compassart-token');
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const [artworksRes, blogPostsRes] = await Promise.all([
                fetch('/api/artistas/mis-obras', { headers }),
                fetch('/api/artistas/mis-posts', { headers })
            ]);
            if (!artworksRes.ok || !blogPostsRes.ok) throw new Error('No se pudo cargar tu información.');
            const artworksData = await artworksRes.json();
            const blogPostsData = await blogPostsRes.json();
            setArtworks(artworksData);
            setBlogPosts(blogPostsData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('compassart-token');
        const userData = JSON.parse(localStorage.getItem('compassart-user') || 'null');
        if (!token || !userData) {
            window.location.href = '/login';
            return;
        }
        setUser(userData);
        // Redirigir a admin-panel si el rol es admin
        if (userData.role === 'admin') {
            window.location.href = '/admin-panel';
            return;
        }
        // Solo cargar datos si no es admin
        fetchData();
    }, [fetchData]);

    const handleDelete = async (type, id) => {
        if (!window.confirm(`¿Estás seguro de que quieres borrar est${type === 'obra' ? 'a obra' : 'e post'}?`)) {
            return;
        }
        setDeletingId(id);
        setError('');
        const token = localStorage.getItem('compassart-token');
        const url = type === 'obra' ? `http://localhost:/api/obras/${id}` : `http://localhost:3017/api/blog/${id}`;
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.status !== 204) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || 'No se pudo borrar el elemento.');
            }
            if (type === 'obra') {
                setArtworks(current => current.filter(item => item.id !== id));
            } else {
                setBlogPosts(current => current.filter(item => item.id !== id));
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setDeletingId(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('compassart-token');
        localStorage.removeItem('compassart-user');
        window.location.href = '/';
    };

    if (!user) {
        return <div>Cargando perfil...</div>; // O un spinner/componente de carga
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-4xl font-bold text-white">Panel de {user.role === 'player' ? 'Jugador' : user.role === 'coach' ? 'Coach' : 'Artista'}</h1>
                <div className="flex items-center gap-4">
                    <button onClick={fetchData} disabled={loading} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
                        {loading ? 'Cargando...' : 'Actualizar'}
                    </button>
                    <button onClick={handleLogout} className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        Cerrar Sesión
                    </button>
                </div>
            </div>
            
            <p className="text-xl text-gray-300 mb-12">Bienvenido de nuevo, <span className="font-bold text-primary">{userInfo?.user.full_name}</span>.</p>
            
            {error && <p className="bg-red-900/50 text-red-300 p-3 rounded-md text-sm mb-6">{error}</p>}
            
            {user.role === 'player' && (
                <Fisioload />
            )}

            {user.role === 'coach' && (
                <WellnessStats />
            )}

            {(user.role !== 'player' && user.role !== 'coach') && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-semibold text-white">Mis Obras</h2>
                                                        <a href="/panel-artista/mis-obras" className="bg-primary hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">Añadir Obra</a>
                        </div>
                        <div>
                            {loading ? <p>Cargando obras...</p> : artworks.length > 0 
                                ? artworks.map(art => <ArtworkRow key={art.id} artwork={art} onDelete={() => handleDelete('obra', art.id)} isDeleting={deletingId === art.id} />) 
                                : <p className="text-gray-400 bg-gray-800 p-4 rounded-lg border border-gray-700">Aún no has subido ninguna obra.</p>}
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-semibold text-white">Mi Blog</h2>
                            <a href="/panel-artista/mi-blog" className="bg-primary hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">Nuevo Post</a>
                        </div>
                        <div>
                            {loading ? <p>Cargando posts...</p> : blogPosts.length > 0 
                                ? blogPosts.map(post => <BlogPostRow key={post.id} post={post} onDelete={() => handleDelete('blog', post.id)} isDeleting={deletingId === post.id} />)
                                : <p className="text-gray-400 bg-gray-800 p-4 rounded-lg border border-gray-700">Aún no has escrito ninguna entrada.</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
