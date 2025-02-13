"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/utils/supabaseClient";
import { motion } from "framer-motion"; // Animaciones

export default function CreateJob() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      setError("");

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/auth/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || !profile || profile.role !== "empresa") {
        router.push("/dashboard/user");
        return;
      }

      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("Error al obtener el usuario.");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile.role !== "empresa") {
      setError("No tienes permiso para crear ofertas de trabajo.");
      return;
    }

    const { error: jobError } = await supabase.from("job_offers").insert([
      {
        company_id: user.id,
        title,
        description,
      },
    ]);

    if (jobError) {
      setError(jobError.message);
    } else {
      setSuccess(true);
      setTitle("");
      setDescription("");
      setTimeout(() => setSuccess(false), 3000);
    }
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
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-6">
      <motion.div
        className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          🚀 Publicar Oferta de Trabajo
        </h2>

        {error && (
          <motion.p
            className="text-red-500 bg-red-900 p-3 rounded-md text-sm mb-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p
            className="text-green-400 bg-green-900 p-3 rounded-md text-sm mb-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            🎉 ¡Oferta creada con éxito!
          </motion.p>
        )}

        <form onSubmit={handleCreateJob} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Título de la Oferta
            </label>
            <input
              type="text"
              placeholder="Ej: Desarrollador Full Stack"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Descripción
            </label>
            <textarea
              placeholder="Describe los requisitos y responsabilidades..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
              required
            ></textarea>
          </div>

          <motion.button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold tracking-wide transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ✨ Crear Oferta
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
