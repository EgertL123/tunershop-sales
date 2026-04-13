import React from 'react'

type InfoCardProps = {
    icon: React.ReactNode
    label: string
    value: string
}

export default function InfoCard({icon, label, value}: InfoCardProps) {
    return (
        <div
            className="rounded-xl border border-zinc-700/70 bg-zinc-800/60 p-4 shadow-lg backdrop-blur-sm transition hover:border-zinc-500/70 hover:bg-zinc-800/80">
            <div className="mb-2 flex items-center gap-2 text-zinc-300">
                <span className="text-violet-300">{icon}</span>
                <span className="text-sm">{label}</span>
            </div>
            <p className="break-words text-base font-medium text-white">{value}</p>
        </div>
    )
}