import React, { useState, useEffect } from 'react';

// ACTUALIZADO: El componente ahora recibe props
export default function GroupManagementDashboard({ initialGroups, onDataChange }) {
  const apiUrl = window.PUBLIC_API_URL;
  console.log('GroupManagementDashboard apiUrl:', apiUrl); // Añadido para depuración
  // El estado interno se inicializa y actualiza desde las props
  const [groups, setGroups] = useState(initialGroups || []);
  const [error, setError] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentGroup, setCurrentGroup] = useState({ id: null, nombre_seccion: '', descripcion: '', imagen_url: '' });
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);

  // EFECTO ACTUALIZADO: Sincroniza el estado interno si las props cambian
  useEffect(() => {
    setGroups(initialGroups || []);
  }, [initialGroups]);

  // ELIMINADO: La función fetchGroups y su useEffect ya no son necesarios aquí.

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'compassart_unsigned'); 
    const cloudName = 'dgsiqywat'; 
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('La subida de la imagen a Cloudinary falló.');
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsUploading(true);
    const userInfo = JSON.parse(localStorage.getItem('compassart-user'));
    const token = userInfo ? userInfo.token : null;
    
    let groupData = { ...currentGroup };

    try {
      if (imageFile) {
        const imageUrl = await uploadToCloudinary(imageFile);
        groupData.imagen_url = imageUrl;
      }

      const url = isEditing 
        ? `${apiUrl}/api/admin/secciones/${groupData.id}` 
        : `${apiUrl}/api/admin/secciones`;
        
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre_grupo: groupData.nombre_grupo,
          descripcion: groupData.descripcion,
          imagen_url: groupData.imagen_url,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Ocurrió un error.');
      }
      
      resetForm();
      // ACTUALIZADO: Llama a la función del padre para recargar todos los datos
      if (onDataChange) {
        onDataChange();
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!groupToDelete) return;
    setError('');
    const userInfo = JSON.parse(localStorage.getItem('compassart-user'));
    const token = userInfo ? userInfo.token : null;
    try {
      const response = await fetch(`${apiUrl}/api/admin/secciones/${groupToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'No se pudo borrar el grupo.');
      }
      setShowConfirmModal(false);
      setGroupToDelete(null);
      // ACTUALIZADO: Llama a la función del padre para recargar todos los datos
      if (onDataChange) {
        onDataChange();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // --- Funciones Auxiliares del Formulario (sin cambios) ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentGroup({ ...currentGroup, [name]: value });
  };
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };
  const handleEditClick = (group) => {
    setIsEditing(true);
    setCurrentGroup(group);
    setImageFile(null);
    window.scrollTo(0, 0);
  };
  const resetForm = () => {
    setIsEditing(false);
    setCurrentGroup({ id: null, nombre_seccion: '', descripcion: '', imagen_url: '' });
    setImageFile(null);
  };
  const openConfirmModal = (group) => {
    setGroupToDelete(group);
    setShowConfirmModal(true);
  };

  // ELIMINADO: El renderizado de "isLoading" ahora lo maneja el padre.
  
  return (
    <div className="p-4 md:p-8">
      {/* ... (El resto del JSX es idéntico al anterior) ... */}
      <h2 className="text-3xl font-bold text-white mb-8">Gestión de Secciones</h2>
      <div className="bg-backblue p-6 rounded-xl shadow-lg mb-10 border border-gray-700">
        <h3 className="text-2xl font-semibold mb-4">{isEditing ? 'Editar Sección' : 'Crear Nueva Sección'}</h3>
        <form onSubmit={handleFormSubmit}>
          <div className="mb-4">
            <label htmlFor="nombre_grupo" className="block text-sm font-medium text-gray-300 mb-1">Nombre de la Sección</label>
            <input type="text" name="nombre_grupo" id="nombre_grupo" value={currentGroup.nombre_grupo} onChange={handleInputChange} className="w-full bg-secondary text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary" required />
          </div>
          <div className="mb-4">
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
            <textarea name="descripcion" id="descripcion" value={currentGroup.descripcion} onChange={handleInputChange} rows="3" className="w-full bg-secondary text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="imageFile" className="block text-sm font-medium text-gray-300 mb-1">
              {isEditing ? 'Cambiar Imagen (Opcional)' : 'Subir Imagen de la Sección'}
            </label>
            <input
              type="file"
              name="imageFile"
              id="imageFile"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleImageChange}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-orange-600"
            />
            {(currentGroup.imagen_url || imageFile) && (
              <div className="mt-4">
                <p className="text-xs text-green-500 mb-2">Vista previa:</p>
                <img 
                  src={imageFile ? URL.createObjectURL(imageFile) : currentGroup.imagen_url} 
                  alt="Vista previa" 
                  className="w-32 h-32 object-cover rounded-md border-2 border-gray-600"
                />
              </div>
            )}
          </div>
          {error && <p className="text-red-400 mb-4">{error}</p>}
          <div className="flex items-center gap-4">
            <button type="submit" disabled={isUploading} className="bg-primary hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-primary-400 disabled:cursor-not-allowed">
              {isUploading ? 'Guardando...' : (isEditing ? 'Actualizar Sección' : 'Guardar Sección')}
            </button>
            {isEditing && (
              <button type="button" onClick={resetForm} className="bg-green-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition duration-300">
                Cancelar Edición
              </button>
            )}
          </div>
        </form>
      </div>
      <div className="bg-secondary p-6 rounded-xl shadow-lg border border-gray-700">
        <h3 className="text-2xl font-semibold mb-4">Secciones Existentes</h3>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-green-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Imagen</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nombre</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Descripción</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="bg-backblue divide-y divide-gray-700">
                    {groups.map((group) => (
                        <tr key={group.id}>
                            <td className="px-6 py-4">
                                <img src={group.imagen_url || 'https://placehold.co/40x40/374151/9CA3AF?text=N/A'} alt={group.nombre_grupo} className="w-10 h-10 rounded-full object-cover"/>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{group.nombre_grupo}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 truncate max-w-xs">{group.descripcion}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => handleEditClick(group)} className="text-primary-400 hover:text-primary-300 mr-4">Editar</button>
                                <button onClick={() => openConfirmModal(group)} className="text-red-500 hover:text-red-400">Borrar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {groups.length === 0 && <p className="text-center py-4 text-gray-500">No hay secciones creadas todavía.</p>}
        </div>
      </div>
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700 max-w-sm mx-auto">
            <h3 className="text-lg font-bold text-white">Confirmar Borrado</h3>
            <p className="mt-2 text-sm text-gray-400">
              ¿Estás seguro de que quieres borrar la sección "<strong>{groupToDelete?.nombre_grupo}</strong>"? Esta acción no se puede deshacer.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 hover:bg-gray-500 rounded-md">
                Cancelar
              </button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md">
                Borrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

