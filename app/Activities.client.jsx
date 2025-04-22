'use client';

import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Activities() {
    const { data: session } = useSession();
    const [dataActivity,setDataactivity] = useState([])
    
    const fetcher = async (url) => {
        const res = await fetch(url, {
          headers: { 
            Authorization: `Bearer ${session?.accessToken}` 
          }
        });
        
        // Verificar token expirado
        if (res.status === 401) {
          await update(); // Tentar atualizar o token
          throw new Error('Token expirado - Tentando renovar...');
        }
        
        if (!res.ok) {
          throw new Error('Falha ao carregar atividades');
        }
        
        const data = await res.json();
        
        // Verificar formato dos dados
        if (!Array.isArray(data)) {
          throw new Error('Formato de dados inválido');
        }
        
        return data;
      };
    
      const { 
        data: activities, 
        error,
        isLoading,
        mutate
      } = useSWR(
        session?.accessToken 
          ? 'https://www.strava.com/api/v3/athlete/activities?per_page=10'
          : null,
        fetcher,
        {
          revalidateOnFocus: false,
          shouldRetryOnError: false,
          onErrorRetry: (error) => {
            if (error.status === 401) return;
          }
        }
      );
    
      // Tentar renovar token automaticamente
      useEffect(() => {
        if (error?.message.includes('Token expirado')) {
          mutate();
        }
      }, [error, mutate]);
    
      if (error) {
        return (
          <div className="error-container">
            <h3>Erro ao carregar atividades</h3>
            <p>{error.message}</p>
            <button
              onClick={() => signIn('strava')}
              className="reconnect-button"
            >
              Reconectar ao Strava
            </button>
          </div>
        );
      }
    
      if (isLoading) return <div className="loading">Carregando atividades...</div>;
    
      if (!Array.isArray(activities)) {
        return (
          <div className="error-container">
            Formato inválido de atividades recebido da API
          </div>
        );
      }
    
      if (activities.length === 0) {
        return <div>Nenhuma atividade encontrada</div>;
      }
    
      const validateActivity = (activity) => {
        const requiredFields = ['id', 'name', 'type', 'distance', 'moving_time', 'start_date'];
        return requiredFields.every(field => activity?.[field] !== undefined);
      };

    if(dataActivity.length == 0 && activities){
        activities?.forEach(element => {
            element.sport_type == "Run" ?
            setDataactivity(prev => [...prev,{
                Distância: element.distance,
                average_cadence: element.average_cadence,
                average_speed: element.average_speed,
                elapsed_time: element.elapsed_time,
                elev_high: element.elev_high,
                elev_low: element.elev_low,
                max_speed: element.max_speed,
                total_elevation_gain: element.total_elevation_gain,             
                Tempo: element.moving_time ,
            }])
            :
            null
        });
    }

    return (
        <div>
            <h2>Últimas Atividades</h2>
            <ul className='text-zinc-900'>
                {activities?.map((activity) => (
                    activity.sport_type == "Run" ?
                    <li key={activity.id}>
                    <Link href={`/activities/${activity.id}`} className="activity-link">
                      <h3>{activity.name}</h3>
                      <p>Distância: {(activity.distance / 1000).toFixed(2)} km</p>
                      <p>average_cadence: {activity.average_cadence} </p>
                      <p>average_speed: {activity.average_speed} </p>
                      <p>elapsed_time: {activity.elapsed_time} </p>
                      <p>elev_high: {activity.elev_high} </p>
                      <p>elev_low: {activity.elev_low} </p>
                      <p>max_speed: {activity.max_speed} </p>
                      <p>total_elevation_gain: {activity.total_elevation_gain} </p>              
                      <p>Tempo: {(activity.moving_time / 60).toFixed(1)} minutos</p>
                    </Link>
                  </li>
                        :
                        null
                ))}
            </ul>
        </div>
    );
}