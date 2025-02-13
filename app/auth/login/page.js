'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/utils/supabaseClient';
import { toast } from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const user = data.session?.user;

    if (!user || !user.id) {
      setError('No se pudo obtener la sesión del usuario.');
      setLoading(false);
      return;
    }

    // Obtener el perfil del usuario desde Supabase
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id) // IMPORTANTE: Validar que el id es correcto
      .single();

    if (profileError || !profile) {
      setError(profileError?.message || 'No se encontró el perfil del usuario.');
      setLoading(false);
      return;
    }

    toast.success('Inicio de sesión exitoso.');

    // Redirección basada en el rol
    if (profile.role === 'empresa') {
      router.push('/dashboard/company');
    } else {
      router.push('/dashboard/user');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="p-8 bg-gray-800 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">Iniciar Sesión</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-6 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-400">
          ¿No tienes una cuenta?{' '}
          <a href="/auth/register" className="text-blue-500 hover:underline">
            Regístrate
          </a>
        </p>
      </div>
    </div>
  );
}
