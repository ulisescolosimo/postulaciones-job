"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export default function UserDashboard() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchJobs = async () => {
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
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || profile.role !== "usuario") {
        router.push("/auth/login");
        return;
      }

      const { data: jobsData, error: jobsError } = await supabase
        .from("job_offers")
        .select("*");

      if (jobsError) {
        setError(jobsError.message);
      } else {
        setJobs(jobsData);
      }

      // Obtener postulaciones del usuario
      const { data: applicationsData } = await supabase
        .from("applications")
        .select("job_id")
        .eq("user_id", user.id);

      if (applicationsData) {
        setAppliedJobs(new Set(applicationsData.map((app) => app.job_id)));
      }

      setLoading(false);
    };

    fetchJobs();
  }, [router]);

  const handleApply = async (jobId) => {
    if (appliedJobs.has(jobId)) {
      toast.error("Ya te has postulado a esta oferta.");
      return;
    }

    const { data: userSession, error: sessionError } = await supabase.auth.getUser();
    if (sessionError) {
      toast.error("Error al obtener el usuario.");
      return;
    }

    const user = userSession?.user;
    if (!user) {
      toast.error("Usuario no autenticado.");
      return;
    }

    const { error } = await supabase.from("applications").insert([
      {
        job_id: jobId,
        user_id: user.id,
      },
    ]);

    if (error) {
      toast.error(`Error al postularse: ${error.message}`);
      return;
    }

    setAppliedJobs((prev) => new Set(prev).add(jobId));
    toast.success("¡Te has postulado con éxito!");
  };

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
  

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

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
        💼 Ofertas de Trabajo
      </motion.h1>

      {jobs.length === 0 ? (
        <motion.p
          className="text-gray-400 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          No hay ofertas disponibles en este momento. 🚀
        </motion.p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {jobs.map((job, index) => (
            <motion.div
              key={job.id}
              className="p-6 bg-gray-800 bg-opacity-80 backdrop-blur-md rounded-lg shadow-md border border-gray-700 hover:border-blue-500 transition-all duration-300"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <h2 className="text-xl font-semibold text-white">{job.title}</h2>
              <p className="text-gray-300 text-sm mt-2">{job.description}</p>
              <p className="text-gray-500 text-xs mt-2">
                📅 Publicado: {new Date(job.created_at).toLocaleDateString()}
              </p>
              <motion.button
                onClick={() => handleApply(job.id)}
                className={`mt-4 w-full py-2 rounded-md text-white font-semibold shadow-lg transition-all duration-200
                  ${
                    appliedJobs.has(job.id)
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                whileHover={!appliedJobs.has(job.id) ? { scale: 1.05 } : {}}
                whileTap={{ scale: 0.95 }}
                disabled={appliedJobs.has(job.id)}
              >
                {appliedJobs.has(job.id) ? "✅ Postulado" : "📄 Postularse"}
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
