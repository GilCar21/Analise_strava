'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Activities from './Activities.client';

export default function Home() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="container">
        <h1>Bem-vindo ao Strava App</h1>
        <button 
          onClick={() => signIn('strava')}
          className="login-button"
        >
          Conectar com Strava
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <h1>Olá, {session.user.name}!</h1>
        <button 
          onClick={() => signOut()}
          className="logout-button"
        >
          Sair
        </button>
      </header>
      <Activities />
    </div>
  );
}