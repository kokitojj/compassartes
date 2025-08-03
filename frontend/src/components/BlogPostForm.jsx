import React, { useState, useEffect } from 'react';

export default function BlogPostForm({ onPostCreated }) {
    const apiUrl = window.PUBLIC_API_URL;
    const [titulo, setTitulo] = useState('');
    const [contenido, setContenido] = useState('');
    const [seccionId, setSeccionId] = useState('');
    const [secciones, setSecciones] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSecciones = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/public/all-secciones`);
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'No se pudieron cargar las secciones.');
                setSecciones(data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchSecciones();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!titulo || !contenido) {
            setError('El título y el contenido son obligatorios.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        const userInfo = JSON.parse(localStorage.getItem('compassart-user'));
        const token = userInfo ? userInfo.token : null;

        if (!token) {
            setError('No estás autenticado. Por favor, inicia sesión de nuevo.');
            setLoading(false);
            return;
        }

        const body = { titulo, contenido };
        if (seccionId) {
            body.seccion_id = seccionId;
        }

        try {
            const response = await fetch(`${apiUrl}/api/blog`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error al crear el post.');

            setSuccess('¡Post publicado con éxito!');
            setTitulo('');
            setContenido('');
            setSeccionId('');
            if (onPostCreated) {
                onPostCreated(); // Llama a la función para refrescar la lista
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-3xl font-bold text-white mb-2">Crear Nueva Entrada de Blog</h2>
            <p className="text-gray-400 mb-6">Comparte tus pensamientos, procesos o reflexiones.</p>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="titulo">Título del Post</label>
                    <input type="text" id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="seccion">Sección</label>
                    <select id="seccion" value={seccionId} onChange={(e) => setSeccionId(e.target.value)} className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="">Sin sección</option>
                        {secciones.map(seccion => (
                            <option key={seccion.id} value={seccion.id}>{seccion.nombre_grupo}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-6">
                    <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="contenido">Contenido</label>
                    <textarea id="contenido" value={contenido} onChange={(e) => setContenido(e.target.value)} rows="10" className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
                </div>
                
                {error && <p className="bg-red-900/50 text-red-300 p-3 rounded-md text-sm mb-4">{error}</p>}
                {success && <p className="bg-green-900/50 text-green-300 p-3 rounded-md text-sm mb-4">{success}</p>}

                <div className="flex items-center gap-4">
                    <button type="submit" disabled={loading} className="bg-primary hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 disabled:bg-primary-400">
                        {loading ? 'Publicando...' : 'Publicar Post'}
                    </button>
                    <a href="/panel-artista" className="text-gray-400 hover:text-white text-sm">Volver al Panel</a>
                </div>
            </form>
        </div>
    );
}
