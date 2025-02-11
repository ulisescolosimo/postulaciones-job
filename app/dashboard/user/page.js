'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/utils/supabaseClient';
import { useRouter } from 'next/navigation';

export default function UserDashboard() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchJobs = async () => {
      // Obtener el usuario actual
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        setError(userError.message);
        setLoading(false);
        return;
      }

      // Verificar el rol del usuario
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || profile.role !== 'usuario') {
        router.push('/auth/login'); // Redirige si no es usuario
        return;
      }

      // Obtener ofertas de trabajo
      const { data: jobsData, error: jobsError } = await supabase
        .from('job_offers')
        .select('*');

      if (jobsError) {
        setError(jobsError.message);
      } else {
        setJobs(jobsData);
      }

      setLoading(false);
    };

    fetchJobs();
  }, [router]);

  const handleApply = async (jobId) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from('applications').insert([
      {
        job_id: jobId,
        user_id: user.id,
      },
    ]);

    if (error) {
      alert(`Error al postularse: ${error.message}`);
    } else {
      alert('¡Te has postulado con éxito!');
    }
  };

  if (loading) {
    return <div className="text-white text-center">Cargando...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Ofertas de Trabajo</h1>
      {jobs.length === 0 ? (
        <p className="text-white">No hay ofertas disponibles en este momento.</p>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-4 bg-gray-800 rounded shadow-md text-white"
            >
              <h2 className="text-lg font-bold">{job.title}</h2>
              <p className="text-sm">{job.description}</p>
              <button
                onClick={() => handleApply(job.id)}
                className="mt-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                Postularse
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
