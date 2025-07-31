import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getWellnessStats } from '../actions/wellnessStatsActions';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WellnessStats = () => {
  const dispatch = useDispatch();

  const wellnessStats = useSelector((state) => state.wellnessStats);
  const { loading, error, stats } = wellnessStats;

  const [selectedPlayer, setSelectedPlayer] = useState('all');
  const [timeRange, setTimeRange] = useState('total'); // 'week', 'month', 'total'

  useEffect(() => {
    dispatch(getWellnessStats());
  }, [dispatch]);

  const players = useMemo(() => {
    if (!stats) return [];
    const playerSet = new Set(stats.map(s => s.user_name).filter(Boolean));
    return ['all', ...Array.from(playerSet)];
  }, [stats]);

  const filteredStats = useMemo(() => {
    if (!stats) return [];

    const now = new Date();
    const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    return stats.filter(stat => {
      const statDate = new Date(stat.created_at);
      const playerFilter = selectedPlayer === 'all' || stat.user_name === selectedPlayer;
      
      if (!playerFilter) return false;

      switch (timeRange) {
        case 'week':
          return statDate >= oneWeekAgo;
        case 'month':
          return statDate >= oneMonthAgo;
        case 'total':
        default:
          return true;
      }
    });
  }, [stats, selectedPlayer, timeRange]);

  return (
    <div className="p-6 bg-gray-900 text-white rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-primary-400">Estadísticas de Bienestar</h2>

      {loading && <p className="text-center">Cargando estadísticas...</p>}
      {error && <p className="text-red-500 text-center">Error: {error}</p>}

      {!loading && !error && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="player-filter" className="block text-sm font-medium text-gray-400 mb-2">Filtrar por Jugadora</label>
              <select 
                id="player-filter"
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {players.map(player => <option key={player} value={player}>{player === 'all' ? 'Todas las jugadoras' : player}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-400 mb-2">Rango de Tiempo</label>
              <div className="flex gap-2">
                <button onClick={() => setTimeRange('week')} className={`px-4 py-2 rounded-lg ${timeRange === 'week' ? 'bg-primary-500' : 'bg-gray-700'}`}>Semana</button>
                <button onClick={() => setTimeRange('month')} className={`px-4 py-2 rounded-lg ${timeRange === 'month' ? 'bg-primary-500' : 'bg-gray-700'}`}>Mes</button>
                <button onClick={() => setTimeRange('total')} className={`px-4 py-2 rounded-lg ${timeRange === 'total' ? 'bg-primary-500' : 'bg-gray-700'}`}>Total</button>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">RPE y Duración de Sesión</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="created_at" tickFormatter={date => new Date(date).toLocaleDateString()} />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                  <Legend />
                  <Bar dataKey="rpe" fill="#8884d8" name="RPE" />
                  <Bar dataKey="duration_minutes" fill="#82ca9d" name="Duración (min)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Calidad del Sueño</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="created_at" tickFormatter={date => new Date(date).toLocaleDateString()} />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                  <Legend />
                  <Bar dataKey="sleep_quality" fill="#ffc658" name="Calidad del Sueño" />
                  <Bar dataKey="sleep_hours" fill="#d0ed57" name="Horas de Sueño" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg">
              <thead>
                <tr className="bg-gray-700">
                  <th className="py-3 px-4 text-left">Jugadora</th>
                  <th className="py-3 px-4 text-left">Fecha</th>
                  <th className="py-3 px-4 text-center">RPE</th>
                  <th className="py-3 px-4 text-center">Duración</th>
                  <th className="py-3 px-4 text-center">Cal. Sueño</th>
                  <th className="py-3 px-4 text-center">H. Sueño</th>
                  <th className="py-3 px-4 text-center">Estrés</th>
                  <th className="py-3 px-4 text-center">Ánimo</th>
                </tr>
              </thead>
              <tbody>
                {filteredStats.map((stat) => (
                  <tr key={stat.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="py-3 px-4">{stat.user_name}</td>
                    <td className="py-3 px-4">{new Date(stat.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-center">{stat.rpe}</td>
                    <td className="py-3 px-4 text-center">{stat.duration_minutes}</td>
                    <td className="py-3 px-4 text-center">{stat.sleep_quality}</td>
                    <td className="py-3 px-4 text-center">{stat.sleep_hours}</td>
                    <td className="py-3 px-4 text-center">{stat.stress_level}</td>
                    <td className="py-3 px-4 text-center">{stat.mood}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default WellnessStats;
