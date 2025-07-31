import React, { useState } from 'react';

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    if (!formData.username || !formData.full_name || !formData.password) {
      setError('Todos los campos son obligatorios.');
      setLoading(false);
      return;
    }

    try {
      // Usamos la URL completa porque el frontend y backend corren en puertos diferentes
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          full_name: formData.full_name,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Algo salió mal.');
      }

      // Guardar el token y los datos del usuario en localStorage
      localStorage.setItem('angelbfisio-user', JSON.stringify(data));

      // Redirigir según el rol del usuario
      if (data.user.role === 'admin') {
        window.location.href = '/admin-panel';
      } else if (data.user.role === 'player') {
        window.location.href = '/fisioload'; // Redirigir a la página de fisioload para players
      } else {
        window.location.href = '/panel-artista'; // Redirigir a panel-artista para otros roles (coach, etc.)
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
     <div className="max-w-md mx-auto bg-backblue p-8 rounded-xl shadow-lg border border-[#556c5e]">
      <h2 className="text-3xl font-bold text-white text-center mb-6">Crear Cuenta de Artista</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="username">
            Nombre de Usuario
          </label>
          <input
            className="w-full bg-[#495b51] text-white border border-[#556c5e] rounded py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
            id="username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Tu nombre de usuario"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="full_name">
            Nombre Completo
          </label>
          <input
            className="w-full bg-[#495b51] text-white border border-[#556c5e] rounded py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
            id="full_name"
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Tu nombre completo"
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
            placeholder="******************"
          />
        </div>
        
        {error && <p className="bg-red-900/50 text-red-300 p-3 rounded-md text-sm mb-4">{error}</p>}
        {success && <p className="bg-green-900/50 text-green-300 p-3 rounded-md text-sm mb-4">¡Registro exitoso! Ahora puedes iniciar sesión.</p>}

        <div className="flex items-center justify-between">
          <button
            className="w-full bg-[#495b51] hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 disabled:bg-primary-400"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </div>
      </form>
    </div>
  );
}
