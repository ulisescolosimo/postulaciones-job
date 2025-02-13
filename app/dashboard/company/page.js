"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function CompanyDashboard() {
  const [jobOffers, setJobOffers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchJobOffers = async () => {
      const { data, error: userError } = await supabase.auth.getUser();
      const user = data?.user;

      if (userError || !user) {
        setError("No se pudo obtener el usuario.");
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || profile?.role !== "empresa") {
        router.push("/auth/login");
        return;
      }

      const { data: jobData, error: jobError } = await supabase
        .from("job_offers")
        .select("id, title, description, created_at")
        .eq("company_id", user.id);

      if (jobError) {
        setError(jobError.message);
      } else {
        setJobOffers(jobData);
      }

      setLoading(false);
    };

    fetchJobOffers();
  }, [router]);

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
    <div className="flex flex-col min-h-screen">
      {/* 📌 Asegurarnos de que el header esté separado y el contenido inicie abajo */}
      <motion.div 
        className="flex flex-col flex-grow p-6 bg-gray-900 mt-20" // 👈 `mt-20` para evitar superposición con el header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1 
          className="text-3xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          📢 Tus Ofertas de Trabajo
        </motion.h1>

        {jobOffers.length === 0 ? (
          <motion.p 
            className="text-gray-400 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Aún no has publicado ninguna oferta. 🚀
          </motion.p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
            {jobOffers.map((job, index) => (
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
                  📅 Publicado: {new Date(job.created_at).toLocaleString()}
                </p>
                <motion.button
                  onClick={() => router.push(`/dashboard/company/job/${job.id}`)}
                  className="mt-4 w-full bg-blue-600 py-2 rounded-md text-white font-semibold shadow-lg hover:bg-blue-700 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  📄 Ver Postulaciones
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
