import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserEditForm from './UserEditForm'; // Asumimos que este también será estilizado con Tailwind

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null); // ID del usuario a editar
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    const userInfo = JSON.parse(localStorage.getItem('angelbfisio-user') || '{}');
    const token = userInfo.token;
    if (!token) {
        setError("No se encontró el token de autenticación.");
        return;
    }
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const { data } = await axios.get('/api/admin/users', { headers });
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('No se pudieron cargar los usuarios.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUserHandler = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres borrar este usuario?')) {
      const userInfo = JSON.parse(localStorage.getItem('angelbfisio-user') || '{}');
      const token = userInfo.token;
      try {
        await axios.delete(`/api/admin/users/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        setUsers(users.filter((user) => user.id !== id));
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('No se pudo borrar el usuario.');
      }
    }
  };

  const handleSave = () => {
    setEditingUser(null);
    setIsCreating(false);
    fetchUsers(); // Recargar la lista de usuarios después de guardar
  };

  const handleCancel = () => {
    setEditingUser(null);
    setIsCreating(false);
  };

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setIsCreating(false); // No se puede estar creando y editando a la vez
  }

  const handleCreate = () => {
    setIsCreating(true);
    setEditingUser(null); // No se puede estar creando y editando a la vez
  }

  return (
    <div className="bg-secondary p-4 sm:p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Gestión de Usuarios</h2>
        <button 
          onClick={handleCreate} 
          className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        >
          Crear Usuario
        </button>
      </div>

      {(isCreating || editingUser) && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <UserEditForm userId={editingUser} onSave={handleSave} onCancel={handleCancel} />
        </div>
      )}

      {error && <p className="text-red-500 bg-red-900/50 p-3 rounded-md mb-4">{error}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-secondary divide-y divide-gray-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{user.full_name}</div>
                    <div className="text-sm text-gray-400">@{user.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-green-800 text-green-200' : 'bg-gray-600 text-gray-200'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button onClick={() => handleEdit(user)} className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200">Editar</button>
                  <button onClick={() => deleteUserHandler(user.id)} className="text-red-500 hover:text-red-400 transition-colors duration-200">Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
