'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { secondsForMinutes } from '../../utils/seconds_for_minutes';
import { handlerGemini } from '../../api/google/gemini';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ActivityDetail() {
    // 1. Hooks sempre no topo e mesma ordem
    const router = useRouter();
    const { id } = useParams();
    const { data: session } = useSession();
    const [dataA, setDataA] = useState();
    const [responseAi, setResponseAI] = useState();

    // 2. Manter a ordem dos hooks consistente
    const fetcher = (url) => fetch(url, {
        headers: { Authorization: `Bearer ${session?.accessToken}` }
    }).then(res => res.json());

    const { data: activity, error } = useSWR(
        session?.accessToken
            ? `https://www.strava.com/api/v3/activities/${id}`
            : null,
        fetcher
    );

    useEffect(() => {
        if (activity) {
            setDataA({
                "Distância:": (activity.distance / 1000).toFixed(2) + " km",
                "Duração": secondsForMinutes(activity.moving_time) + " min",
                "Tipo": activity.type,
                "Data": activity.start_date,
                "Velocidade média": (activity.average_speed * 3.6).toFixed(2) + " km/h",
                "Elevação": activity.total_elevation_gain + " m",
                "Calorias": activity.calories || 'N/A',
                "Melhores marcas": activity.best_efforts?.map(effort => ({
                    "distance": effort.distance + " m",
                    "moving_time": secondsForMinutes(effort.moving_time) + " min"
                })),
                "metricas por km": activity.splits_metric?.map(split => ({
                    "Quilometro": split.split,
                    "velocidade média": (split.average_speed * 3.6).toFixed(2) + " km/h",
                    "Tempo decorrido": secondsForMinutes(split.moving_time) + " min",
                    "Diferenca de elevacao": split.elevation_difference + " m"
                }))
            });
        }
    }, [activity]);

    // 3. Condicionais de renderização APÓS todos os hooks
    if (error) return <div>Erro ao carregar atividade</div>;
    if (!activity) return <div>Carregando...</div>;

    async function handleAi() {
        const res = await handlerGemini(dataA);
        setResponseAI(res);
    }

    // 4. Verificar existência de arrays antes de mapear
    const hasBestEfforts = activity.best_efforts?.length > 0;
    const hasSplitsMetric = activity.splits_metric?.length > 0;

    console.log(dataA)

    return (
        <div className="max-w-[1400px] mx-auto">
            <button
                onClick={() => router.back()}
                className="back-button"
            >
                &larr; Voltar
            </button>

            <h1>{activity.name}</h1>

            <div className="flex flex-wrap text-zinc-900 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg flex-1 ">
                    <h3>Informações Básicas</h3>
                    <p>Distância: {(activity.distance / 1000).toFixed(2)} km</p>
                    <p>Duração: {(activity.moving_time / 60).toFixed(1)} minutos</p>
                    <p>Tipo: {activity.type}</p>
                    <p>Data: {new Date(activity.start_date).toLocaleDateString()}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg flex-1 text-zinc-900">
                    <h3>Estatísticas</h3>
                    <p>Velocidade média: {(activity.average_speed * 3.6).toFixed(1)} km/h</p>
                    <p>Ritmo médio: {secondsForMinutes(1000 / activity.average_speed)} min/km</p>
                    <p>Elevação: {activity.total_elevation_gain} m</p>
                    <p>Calorias: {activity.calories || 'N/A'}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg flex-1 text-zinc-900">
                    <h3>Melhores marcas</h3>
                    {hasBestEfforts && activity.best_efforts.map(effort => (
                        <p key={effort.id}>{effort.name} : {secondsForMinutes(effort.elapsed_time)} min</p>
                    ))}
                </div>

                <div className="bg-slate-50 p-4 rounded-lg w-full text-zinc-900">
                    <h3>Métricas por km</h3>
                    <div className='grid grid-cols-4 gap-4'>
                        {hasSplitsMetric && activity.splits_metric.map(split => (
                            <div key={split.split} className='bg-slate-300 flex-1 rounded p-3'>
                                <p>Quilometro {split.split}</p>
                                <p>Velocidade média: {(split.average_speed * 3.6).toFixed(1)}</p>
                                <p>Tempo decorrido: {secondsForMinutes(split.moving_time)}</p>
                                <p>Diferença de elevação: {split.elevation_difference} m</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <button className='mt-8' onClick={handleAi}>
                Testar API Gemini
            </button>

            <div className="bg-slate-50 p-4 rounded-lg w-full text-zinc-900 mt-6">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {responseAi}
                </ReactMarkdown>
            </div>
        </div>
    );
}