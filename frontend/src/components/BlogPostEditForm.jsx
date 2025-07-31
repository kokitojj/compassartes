import React, { useState, useEffect } from 'react';

export default function BlogPostEditForm({ postId }) {
    const [formData, setFormData] = useState({ titulo: '', contenido: '', seccion_id: '' });
    const [secciones, setSecciones] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPostAndSecciones = async () => {
            setLoading(true);
            try {
                const [postRes, seccionesRes] = await Promise.all([
                    fetch(`/api/blog/${postId}`),
                    fetch('/api/public/secciones')
                ]);

                if (!postRes.ok) {
                    const errorData = await postRes.json().catch(() => ({ error: 'No se pudo encontrar el post para editar.' }));
                    throw new Error(errorData.error);
                }
                if (!seccionesRes.ok) {
                    throw new Error('No se pudieron cargar las secciones.');
                }

                const postData = await postRes.json();
                const seccionesData = await seccionesRes.json();

                setFormData({ 
                    titulo: postData.titulo, 
                    contenido: postData.contenido || '', 
                    seccion_id: postData.seccion_id || '' 
                });
                setSecciones(seccionesData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPostAndSecciones();
    }, [postId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const token = localStorage.getItem('angelbfisio-token');
        const user = JSON.parse(localStorage.getItem('angelbfisio-user') || '{}');
        if (!token) {
            setError('Sesión expirada. Por favor, inicia sesión de nuevo.');
            setLoading(false);
            return;
        }

        const isAdmin = user.user && user.user.role === 'admin';
        const url = isAdmin
            ? `/api/admin/posts/${postId}`
            : `/api/blog/${postId}`;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error al actualizar el post.');
            setSuccess('¡Post actualizado con éxito!');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-20">
                <div className="loader" style={{margin: '0 auto'}}></div>
                <p className="mt-4 text-gray-400">Cargando datos del post...</p>
            </div>
        );
    }
    
    if (error && !formData.titulo) {
        return (
             <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 text-center">
                <h2 className="text-2xl font-bold text-red-400 mb-4">Error al Cargar</h2>
                <p className="bg-red-900/50 text-red-300 p-3 rounded-md text-sm mb-4">{error}</p>
                <a href={JSON.parse(localStorage.getItem('angelbfisio-user') || '{}').rol === 'ADMIN' ? '/admin-panel' : '/panel-artista'} className="text-primary hover:text-white text-sm mt-4">Volver al Panel</a>
             </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-3xl font-bold text-white mb-6">Editar Entrada de Blog</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="titulo">Título</label>
                    <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="seccion_id">Sección</label>
                    <select name="seccion_id" value={formData.seccion_id} onChange={handleChange} className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="">Sin sección</option>
                        {secciones.map(seccion => (
                            <option key={seccion.id} value={seccion.id}>{seccion.nombre_grupo}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-6">
                    <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="contenido">Contenido</label>
                    <textarea name="contenido" value={formData.contenido} onChange={handleChange} rows="10" className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
                </div>
                
                {error && <p className="bg-red-900/50 text-red-300 p-3 rounded-md text-sm mb-4">{error}</p>}
                {success && <p className="bg-green-900/50 text-green-300 p-3 rounded-md text-sm mb-4">{success}</p>}

                <div className="flex items-center gap-4">
                    <button type="submit" disabled={loading} className="bg-primary hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:bg-primary-400 disabled:cursor-not-allowed">
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                    <a href={JSON.parse(localStorage.getItem('angelbfisio-user') || '{}').rol === 'ADMIN' ? '/admin-panel' : '/panel-artista'} className="text-gray-400 hover:text-white text-sm">Volver al Panel</a>
                </div>
            </form>
        </div>
    );
}
