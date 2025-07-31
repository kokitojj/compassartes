import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserEditForm = ({ userId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    password: '',
    role: 'player',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('angelbfisio-user') || '{}');
    const token = userInfo.token;

    if (userId) {
      const fetchUser = async () => {
        try {
          const { data } = await axios.get(`/api/admin/users/${userId}`, { 
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setFormData({
            full_name: data.full_name,
            username: data.username,
            role: data.role,
            password: '', // La contraseña no se debe pre-rellenar
          });
        } catch (error) {
          console.error('Error fetching user:', error);
          setError('No se pudo cargar la información del usuario.');
        }
      };
      fetchUser();
    } else {
      // Resetear el formulario si es para crear un nuevo usuario
      setFormData({
        full_name: '',
        username: '',
        password: '',
        role: 'player',
      });
    }
  }, [userId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const userInfo = JSON.parse(localStorage.getItem('angelbfisio-user') || '{}');
    const token = userInfo.token;
    const headers = { 'Authorization': `Bearer ${token}` };

    // No enviar la contraseña si está vacía en el modo de edición
    const dataToSend = { ...formData };
    if (userId && !dataToSend.password) {
      delete dataToSend.password;
    }

    try {
      if (userId) {
        await axios.put(`/api/admin/users/${userId}`, dataToSend, { headers });
      } else {
        await axios.post('/api/admin/users', dataToSend, { headers });
      }
      onSave();
    } catch (error) {
      console.error('Error saving user:', error);
      setError(error.response?.data?.error || 'No se pudo guardar el usuario.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-white">
      {error && <p className="text-red-500 bg-red-900/50 p-3 rounded-md">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-300">Nombre Completo</label>
          <input
            type="text"
            name="full_name"
            id="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300">Nombre de Usuario</label>
          <input
            type="text"
            name="username"
            id="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">Contraseña</label>
          <input
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={userId ? 'Dejar en blanco para no cambiar' : ''}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-300">Rol</label>
          <select
            name="role"
            id="role"
            value={formData.role}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="player">Player</option>
            <option value="coach">Coach</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end space-x-3">
        <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200">
          Cancelar
        </button>
        <button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200">
          {userId ? 'Actualizar Usuario' : 'Crear Usuario'}
        </button>
      </div>
    </form>
  );
};

export default UserEditForm;
