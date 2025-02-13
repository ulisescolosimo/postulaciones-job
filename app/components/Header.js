"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../utils/supabaseClient";
import { motion } from "framer-motion";

export default function Header() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (!error) {
          setRole(profile.role);
        }
      }
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setRole(null);

      if (session?.user) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()
          .then(({ data: profile, error }) => {
            if (!error) {
              setRole(profile.role);
            }
          });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <motion.header
      className="bg-gray-900 bg-opacity-80 backdrop-blur-md shadow-lg fixed top-0 left-0 w-full py-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto flex justify-between items-center px-6">
        <Link href="/" className="text-xl font-bold text-white tracking-wide">
          🌟 JobConnect
        </Link>

        <nav>
          {user ? (
            <div className="flex items-center space-x-6">
              {role === "usuario" ? (
                <>
                  <Link
                    href="/dashboard/user"
                    className="text-gray-300 hover:text-white transition"
                  >
                    🔍 Ver Trabajos
                  </Link>
                  <Link
                    href="/dashboard/user/jobs"
                    className="text-gray-300 hover:text-white transition"
                  >
                    📂 Mis Postulaciones
                  </Link>
                </>
              ) : role === "empresa" ? (
                <>
                  <Link
                    href="/dashboard/company"
                    className="text-gray-300 hover:text-white transition"
                  >
                    📢 Mis Publicaciones
                  </Link>
                  <Link
                    href="/dashboard/company/create-job"
                    className="text-gray-300 hover:text-white transition"
                  >
                    ➕ Crear Trabajo
                  </Link>
                </>
              ) : null}

              <motion.button
                onClick={handleLogout}
                className="bg-red-500 px-4 py-2 text-white rounded-lg shadow-md hover:bg-red-600 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🚪 Cerrar sesión
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-300 hover:text-white transition"
              >
                🔑 Iniciar sesión
              </Link>
              <Link
                href="/auth/register"
                className="bg-blue-500 px-4 py-2 text-white rounded-lg shadow-md hover:bg-blue-600 transition-all duration-200"
              >
                📝 Registrarse
              </Link>
            </div>
          )}
        </nav>
      </div>
    </motion.header>
  );
}
