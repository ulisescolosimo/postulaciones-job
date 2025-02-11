'use client';

import useAuth from '../../hooks/useAuth';

export default function Profile() {
  const user = useAuth('/auth/login'); // Redirige a /auth/login si no está autenticado

  if (!user) {
    return null; // O un spinner de carga
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <h1 className="text-3xl font-bold text-white">Perfil de {user.email}</h1>
    </div>
  );
}