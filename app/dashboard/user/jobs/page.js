"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import { motion } from "framer-motion";

export default function UserApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      const { data: userSession, error: sessionError } = await supabase.auth.getUser();
      if (sessionError) {
        setError(sessionError.message);
        setLoading(false);
        return;
      }

      const user = userSession?.user;
      if (!user) {
        setError("Usuario no autenticado.");
        setLoading(false);
        return;
      }

      console.log("Usuario autenticado:", user.id); // Depuración

      // Obtener las postulaciones del usuario con JOIN en job_offers
      const { data, error: applicationsError } = await supabase
        .from("applications")
        .select(
          `id, created_at, status, 
          job_offers!inner(id, title, description, created_at)`
        )
        .eq("user_id", user.id);

      if (applicationsError) {
        setError(applicationsError.message);
      } else {
        setApplications(data);
        console.log("Postulaciones obtenidas:", data);
      }

      setLoading(false);
    };

    fetchApplications();
  }, []);

  if (loading) {
    return (
      <motion.div
        className="flex justify-center items-center h-screen bg-gray-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="text-white text-lg font-semibold flex space-x-1"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <span>Cargando</span>
          <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}>.</motion.span>
          <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}>.</motion.span>
          <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }}>.</motion.span>
        </motion.div>
      </motion.div>
    );
  }
    if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <motion.div
      className="flex flex-col items-center min-h-screen mt-20 p-6 bg-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="text-3xl font-bold text-white mb-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        📑 Mis Postulaciones
      </motion.h1>

      {applications.length === 0 ? (
        <motion.p
          className="text-gray-400 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Aún no te has postulado a ningún trabajo. 🚀
        </motion.p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {applications.map((app, index) => (
            <motion.div
              key={app.id}
              className="p-6 bg-gray-800 bg-opacity-80 backdrop-blur-md rounded-lg shadow-md border border-gray-700 hover:border-blue-500 transition-all duration-300"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <h2 className="text-xl font-semibold text-white">{app.job_offers.title}</h2>
              <p className="text-gray-300 text-sm mt-2">{app.job_offers.description}</p>
              <p className="text-gray-400 text-xs mt-2">
                📅 Postulado el {new Date(app.created_at).toLocaleDateString()}
              </p>
              <p className="text-blue-400 text-xs mt-1">🔹 Estado: {app.status}</p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
