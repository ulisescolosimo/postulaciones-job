'use client'

import useAuth from "./hooks/useAuth";

export default function Home() {
  const user = useAuth('/auth/login'); // Redirige a /auth/login si no está autenticado
  
    if (!user) {
      return null; // O un spinner de carga
    }
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-600">
        ¡Bienvenido a la App de Postulaciones!
      </h1>
    </div>
  );
}