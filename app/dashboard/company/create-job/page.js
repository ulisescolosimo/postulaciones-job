'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/utils/supabaseClient';

export default function CreateJob() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Obtener el usuario actual
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setError('Error al obtener el usuario');
      return;
    }

    // Verificar que el usuario sea una empresa
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile.role !== 'empresa') {
      setError('No tienes permiso para crear ofertas de trabajo.');
      router.push('/auth/login'); // Redirige si no es empresa
      return;
    }

    // Crear la oferta de trabajo
    const { error: jobError } = await supabase.from('job_offers').insert([
      {
        company_id: user.id, // Asocia la oferta a la empresa autenticada
        title,
        description,
      },
    ]);

    if (jobError) {
      setError(jobError.message);
    } else {
      setSuccess(true);
      setTitle('');
      setDescription('');
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Crear Oferta de Trabajo</h2>
      {error && <p className="text-red-500">{error}</p>}
      {success && (
        <p className="text-green-500">¡Oferta de trabajo creada con éxito!</p>
      )}
      <form onSubmit={handleCreateJob}>
        <input
          type="text"
          placeholder="Título de la oferta"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <textarea
          placeholder="Descripción de la oferta"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        ></textarea>
        <button
          type="submit"
          className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Crear Oferta
        </button>
      </form>
    </div>
  );
}
