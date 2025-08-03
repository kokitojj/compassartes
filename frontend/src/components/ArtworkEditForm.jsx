import React, { useState, useEffect } from 'react';

// El componente ahora acepta 'artworkId' como una prop.
export default function ArtworkEditForm({ artworkId }) {
  const id = artworkId;
  const apiUrl = window.PUBLIC_API_URL;

  const [artwork, setArtwork] = useState({ titulo: '', descripcion: '', imagen_url: '', seccion_id: '', destacado_portada: false });
  const [secciones, setSecciones] = useState([]);
  const [newImageFile, setNewImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArtworkAndSecciones = async () => {
      try {
        const [artworkRes, seccionesRes] = await Promise.all([
          fetch(`${apiUrl}/api/obras/${id}`),
          fetch(`${apiUrl}/api/public/all-secciones`)
        ]);

        if (!artworkRes.ok) {
          throw new Error('No se pudo encontrar la obra de arte.');
        }
        if (!seccionesRes.ok) {
          throw new Error('No se pudieron cargar las secciones.');
        }

        const artworkData = await artworkRes.json();
        const seccionesData = await seccionesRes.json();

        setArtwork({ ...artworkData, seccion_id: artworkData.seccion_id || '' });
        setSecciones(seccionesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchArtworkAndSecciones();
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setArtwork({ ...artwork, [name]: type === 'checkbox' ? checked : value });
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setNewImageFile(e.target.files[0]);
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'compassart_unsigned'); // Reemplaza con tu upload preset
    const cloudName = 'dgsiqywat'; // Reemplaza con tu cloud name
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const response = await fetch(url, { method: 'POST', body: formData });
    if (!response.ok) throw new Error('La subida de la imagen falló.');
    const data = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    const userInfo = JSON.parse(localStorage.getItem('compassart-user') || '{}');
    const token = userInfo.token;

    let finalImageUrl = artwork.imagen_url;

    try {
      if (newImageFile) {
        finalImageUrl = await uploadToCloudinary(newImageFile);
      }

      const updatedData = {
        titulo: artwork.titulo,
        descripcion: artwork.descripcion,
        imagen_url: finalImageUrl,
        seccion_id: artwork.seccion_id,
        destacado_portada: artwork.destacado_portada,
      };

      const response = await fetch(`${apiUrl}/api/obras/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'No se pudo actualizar la obra.');
      }

      alert('¡Obra actualizada con éxito!');
      const userInfo = JSON.parse(localStorage.getItem('compassart-user') || '{}');
      if (userInfo.user && userInfo.user.role === 'admin') {
        window.location.href = '/admin-panel';
      } else {
        window.location.href = '/panel-artista';
      } 

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <p className="text-center text-white p-8">Cargando obra...</p>;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-secondary rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-white mb-6">Editar Obra de Arte</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="titulo" className="block text-gray-300 mb-2">Título</label>
          <input type="text" name="titulo" value={artwork.titulo} onChange={handleInputChange} className="w-full bg-gray-700 text-white rounded-md p-2" />
        </div>
        <div className="mb-4">
          <label htmlFor="descripcion" className="block text-gray-300 mb-2">Descripción</label>
          <textarea name="descripcion" value={artwork.descripcion} onChange={handleInputChange} className="w-full bg-gray-700 text-white rounded-md p-2" rows="4"></textarea>
        </div>
        <div className="mb-4">
          <label htmlFor="seccion_id" className="block text-gray-300 mb-2">Sección</label>
          <select name="seccion_id" value={artwork.seccion_id} onChange={handleInputChange} className="w-full bg-gray-700 text-white rounded-md p-2">
            <option value="">Sin sección</option>
            {secciones.map(seccion => (
              <option key={seccion.id} value={seccion.id}>{seccion.nombre_grupo}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="flex items-center text-gray-300">
            <input type="checkbox" name="destacado_portada" checked={artwork.destacado_portada} onChange={handleInputChange} className="form-checkbox h-5 w-5 bg-gray-700 border-gray-600 text-primary focus:ring-primary" />
            <span className="ml-2">Destacar en portada</span>
          </label>
        </div>
        
        <div className="mb-6">
            <label className="block text-gray-300 mb-2">Imagen Actual</label>
            {artwork.imagen_url ? (
                <img src={artwork.imagen_url} alt="Imagen actual" className="w-48 h-48 object-cover rounded-md border-2 border-gray-600"/>
            ) : (
                <p className="text-gray-500">No hay imagen actual.</p>
            )}
        </div>

        <div className="mb-6">
            <label htmlFor="newImageFile" className="block text-gray-300 mb-2">Cambiar Imagen (Opcional)</label>
            <input type="file" name="newImageFile" onChange={handleImageChange} accept="image/*" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"/>
            {newImageFile && (
                <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">Vista previa de la nueva imagen:</p>
                    <img src={URL.createObjectURL(newImageFile)} alt="Vista previa" className="w-48 h-48 object-cover rounded-md border-2 border-gray-500"/>
                </div>
            )}
        </div>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        <button type="submit" disabled={isSaving} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:bg-green-400">
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
}
