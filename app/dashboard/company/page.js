'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/utils/supabaseClient';
import { useRouter } from 'next/navigation';

export default function CompanyDashboard() {
  const [jobOffers, setJobOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchJobOffers = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        setError(userError.message);
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || profile.role !== 'empresa') {
        router.push('/auth/login');
        return;
      }

      const { data: jobData, error: jobError } = await supabase
        .from('job_offers')
        .select('id, title, description, created_at')
        .eq('company_id', user.id);

      if (jobError) {
        setError(jobError.message);
      } else {
        setJobOffers(jobData);
      }

      setLoading(false);
    };

    fetchJobOffers();
  }, [router]);

  // Nueva función para obtener datos del usuario
  const fetchUserData = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role')
      .single();

    if (error) {
      return null;
    }

    return data;
  };

  // Modificar para incluir detalles del usuario en las postulaciones
  const fetchApplications = async (jobId) => {
    const { data, error } = await supabase
      .from('applications')
      .select('user_id, created_at')
      .eq('job_id', jobId);

    if (error) {
      alert(`Error al obtener postulaciones: ${error.message}`);
      return [];
    }

    // Mapear los datos de las aplicaciones con la información del usuario
    const detailedApplications = await Promise.all(
      data.map(async (app) => {
        const userData = await fetchUserData(app.user_id);
        return {
          ...app,
          user: userData, // Agregamos la información del usuario
        };
      })
    );

    return detailedApplications;
  };

  const handleViewApplications = async (jobId) => {
    const applications = await fetchApplications(jobId);
    setApplications(applications);
    setModalOpen(true); // Abrimos el modal con las postulaciones
  };

  const closeModal = () => {
    setModalOpen(false);
    setApplications([]);
  };

  if (loading) {
    return <div className="text-white text-center">Cargando...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Tus Ofertas de Trabajo</h1>
      {jobOffers.length === 0 ? (
        <p className="text-white">No has creado ninguna oferta de trabajo.</p>
      ) : (
        <div className="grid gap-4">
          {jobOffers.map((job) => (
            <div
              key={job.id}
              className="p-4 bg-gray-800 rounded shadow-md text-white"
            >
              <h2 className="text-lg font-bold">{job.title}</h2>
              <p className="text-sm">{job.description}</p>
              <p className="text-xs text-gray-400">
                Publicado: {new Date(job.created_at).toLocaleString()}
              </p>
              <button
                onClick={() => handleViewApplications(job.id)}
                className="mt-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                Ver Postulaciones
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal para mostrar postulaciones */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-bold text-white mb-4">
              Postulaciones Recibidas
            </h2>
            {applications.length === 0 ? (
              <p className="text-white">No hay postulaciones para esta oferta.</p>
            ) : (
              <ul className="space-y-4">
                {applications.map((app) => (
                  <li
                    key={app.user_id}
                    className="p-4 bg-gray-700 rounded shadow-md"
                  >
                    <p className="text-sm text-white">
                      <strong>Email:</strong> {app.user?.email || 'No disponible'}
                    </p>
                    <p className="text-sm text-gray-400">
                      <strong>Rol:</strong> {app.user?.role || 'No disponible'}
                    </p>
                    <p className="text-sm text-gray-400">
                      <strong>Fecha de aplicación:</strong>{' '}
                      {new Date(app.created_at).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={closeModal}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
