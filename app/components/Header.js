'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabaseClient';

export default function Header() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <header className="bg-gray-800 text-white py-4">
      <div className="container mx-auto flex justify-between items-center px-4">
        <Link href="/" className="text-xl font-bold">
          App de Postulaciones
        </Link>
        <nav>
          {user ? (
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="hover:text-gray-400">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="hover:text-gray-400">
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="hover:text-gray-400">
                Iniciar sesión
              </Link>
              <Link href="/auth/register" className="hover:text-gray-400">
                Registrarse
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}