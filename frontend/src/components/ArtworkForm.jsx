import React, { useState, useEffect } from 'react';

export default function ArtworkForm() {
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [file, setFile] = useState(null);
    const [seccionId, setSeccionId] = useState('');
    const [destacado, setDestacado] = useState(false);
    const [secciones, setSecciones] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSecciones = async () => {
            try {
                const response = await fetch('/api/public/secciones');
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'No se pudieron cargar las secciones.');
                setSecciones(data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchSecciones();
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!titulo || !file) {
            setError('El título y la imagen son obligatorios.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        const userInfo = JSON.parse(localStorage.getItem('angelbfisio-user'));
        const token = userInfo ? userInfo.token : null;

        if (!token) {
            setError('No estás autenticado. Por favor, inicia sesión de nuevo.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('descripcion', descripcion);
        formData.append('artworkImage', file);
        formData.append('destacado_portada', destacado);
        if (seccionId) {
            formData.append('seccion_id', seccionId);
        }

        try {
            const response = await fetch('/api/obras', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error al subir la obra.');

            setSuccess('¡Obra subida con éxito! Redirigiendo al panel...');

            setTimeout(() => {
                window.location.href = '/panel-artista';
            }, 1500);

        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-3xl font-bold text-white mb-2">Añadir Nueva Obra</h2>
            <p className="text-gray-400 mb-6">Sube una imagen de tu obra y añade los detalles.</p>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="titulo">Título de la Obra</label>
                    <input type="text" id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="descripcion">Descripción</label>
                    <textarea id="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows="4" className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
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
                <div className="mb-4">
                    <label className="flex items-center text-gray-300">
                        <input type="checkbox" checked={destacado} onChange={(e) => setDestacado(e.target.checked)} className="form-checkbox h-5 w-5 bg-gray-700 border-gray-600 text-primary focus:ring-primary" />
                        <span className="ml-2">Destacar en portada</span>
                    </label>
                </div>
                <div className="mb-6">
                    <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="artworkImage">Archivo de Imagen</label>
                    <input type="file" id="artworkImage" onChange={handleFileChange} accept="image/png, image/jpeg, image/jpg" className="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-orange-600" />
                </div>
                
                {error && <p className="bg-red-900/50 text-red-300 p-3 rounded-md text-sm mb-4">{error}</p>}
                {success && <p className="bg-green-900/50 text-green-300 p-3 rounded-md text-sm mb-4">{success}</p>}

                <div className="flex items-center gap-4">
                    <button type="submit" disabled={loading} className="bg-primary hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 disabled:bg-primary-400">
                        {loading ? 'Subiendo...' : 'Guardar Obra'}
                    </button>
                    <a href="/panel-artista" className="text-gray-400 hover:text-white text-sm">Volver al Panel</a>
                </div>
            </form>
        </div>
    );
}
