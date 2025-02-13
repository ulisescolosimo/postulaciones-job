"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/utils/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const statuses = [
  "Recibido",
  "Entrevistado",
  "Avanzado",
  "Completado",
  "Rechazado",
];

export default function JobApplications() {
  const [applications, setApplications] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useParams();
  const jobId = params.id;

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        const { data: job, error: jobError } = await supabase
          .from("job_offers")
          .select("title")
          .eq("id", jobId)
          .single();

        if (jobError) throw new Error("No se pudo obtener la oferta de trabajo.");
        setJobTitle(job.title);

        const { data: applicationsData, error: appError } = await supabase
          .from("applications")
          .select(
            `user_id, created_at, status, profiles(email)`
          )
          .eq("job_id", jobId);

        if (appError) throw new Error("Error al obtener postulaciones.");

        const formattedApplications = applicationsData.map((app) => ({
          ...app,
          email: app.profiles?.email || "No disponible",
        }));

        setApplications(formattedApplications);
      } catch (error) {
        console.error(error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [jobId]);

  // 🔄 Mover una postulación entre columnas
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = statuses[parseInt(destination.droppableId)];

    setApplications((prev) =>
      prev.map((app) =>
        app.user_id === draggableId ? { ...app, status: newStatus } : app
      )
    );

    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("user_id", draggableId)
      .eq("job_id", jobId);

    if (error) {
      toast.error("Error al actualizar el estado.");
      return;
    }

    toast.success("Estado actualizado correctamente.");
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
  
  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="flex flex-col min-h-screen mt-20 p-6 bg-gray-900">
      <motion.h1 
        className="text-3xl font-bold text-white mb-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        📌 {jobTitle}
      </motion.h1>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {statuses.map((status, index) => (
            <Droppable key={status} droppableId={String(index)}>
              {(provided) => (
                <motion.div 
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-800 p-4 rounded-lg shadow-md min-h-[250px] flex flex-col gap-2 border border-gray-700"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="text-white text-center font-bold text-lg py-2 border-b border-gray-700">
                    {status}
                  </h3>
                  {applications
                    .filter((app) => app.status.toLowerCase() === status.toLowerCase())
                    .map((app, i) => (
                      <Draggable key={app.user_id} draggableId={app.user_id} index={i}>
                        {(provided, snapshot) => (
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-4 bg-gray-700 text-white rounded shadow-md cursor-pointer transition-transform ${
                              snapshot.isDragging ? "shadow-lg scale-105 bg-blue-700" : "hover:scale-105"
                            }`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <p className="text-sm">
                              <strong>Email:</strong> {app.email}
                            </p>
                            <p className="text-xs text-gray-400">
                              📅 {new Date(app.created_at).toLocaleString()}
                            </p>
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </motion.div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
