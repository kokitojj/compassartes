import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../actions/userActions';

export default function LoginForm() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Pasa la URL de la API a la acción de login
      await dispatch(login(formData.username, formData.password, window.PUBLIC_API_URL));

      // La redirección ahora se maneja dentro de la acción o después de un éxito global
      // Aquí solo manejamos el éxito de la llamada a la API
      const userInfo = JSON.parse(localStorage.getItem('compassart-user') || '{}');
      if (userInfo.user && userInfo.user.role === 'admin') {
        window.location.href = '/admin-panel';
      } else if (userInfo.user && userInfo.user.role === 'coach') {
        window.location.href = '/panel-artista';
      } else if (userInfo.user && userInfo.user.role === 'player') {
        window.location.href = '/fisioload';
      } else {
        // No redirigir si no hay un rol definido
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-backblue p-8 rounded-xl shadow-lg border border-[#556c5e]">
      <h2 className="text-3xl font-bold text-white text-center mb-6">Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="username">
            Nombre de Usuario
          </label>
          <input
            className="w-full bg-[#495b51] text-white border border-[#556c5e] rounded py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
            Contraseña
          </label>
          <input
            className="w-full bg-[#3b5848] text-white border border-[#556c5e] rounded py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        {error && <p className="bg-red-900/50 text-red-300 p-3 rounded-md text-sm mb-4">{error}</p>}

        <div className="flex items-center justify-between">
          <button
            className="w-full bg-[#495b51] hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 disabled:bg-primary-400"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </div>
         
      </form>
    </div>
  );
}

