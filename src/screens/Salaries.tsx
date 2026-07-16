import {useEffect, useState} from 'react'
import {supabase} from '../supabaseClient'
import {
    User,
    Activity,
    Banknote,
    Shield,
    Check,
    Info,
    Copy,
    CreditCard,
    TriangleAlert
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner.tsx'
import PaySalariesConfirm from '../components/salaries/PaySalariesConfirm.tsx'

type WorkerSalary = {
    user_id: string
    display_name: string
    rank: string
    total_final: number
    sale_count: number
    account_number: string | null
}

// Calculate salary based on user rank
const RANK_MULTIPLIERS: Record<string, number> = {
    'Katseajaline': 0.65,
    'Müügiesindaja': 0.75,
    'Müügispetsialist': 0.85,
    'Müügijuht': 1.0,
    'Raamatupidaja': 1.0,
    'CEO': 1.0,
}

// Calculate salary based on vehicle price
function getCommission(price: number): number {
    if (price < 250000) {
        return price * 0.10
    } else if (price < 1000000) {
        return 25000
    } else {
        return 35000
    }
}

export default function Salaries() {
    const [salaries, setSalaries] = useState<WorkerSalary[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [paying, setPaying] = useState(false)
    const [authorized, setAuthorized] = useState<boolean | null>(null)
    const [periodStart, setPeriodStart] = useState<string | null>(null)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [showPayConfirm, setShowPayConfirm] = useState(false)

    // Check if user is authorized to view page
    useEffect(() => {
        const fetchCurrentUser = async () => {
            const {data: {user}} = await supabase.auth.getUser()
            if (user) {
                setCurrentUserId(user.id)
                const {data} = await supabase
                    .from('users')
                    .select('rank, is_admin')
                    .eq('id', user.id)
                    .single()

                const rank = data?.rank
                const admin = data?.is_admin
                setAuthorized(rank === 'Raamatupidaja' || rank === 'CEO' || admin)
            }
        }
        fetchCurrentUser()
    }, [])

    const fetchSalaries = async () => {
        setLoading(true)
        try {
            const {data: lastPeriod} = await supabase
                .from('salary_periods')
                .select('paid_at')
                .order('paid_at', {ascending: false})
                .limit(1)
                .maybeSingle()

            const from = lastPeriod?.paid_at ?? '2025-01-01T00:00:00Z'
            const to = new Date().toISOString()

            setPeriodStart(lastPeriod?.paid_at ?? null)

            const [salesResult, specialOrdersResult, usersResult] = await Promise.all([
                supabase
                    .from('sales')
                    .select('user_id, price, seller_rank')
                    .gte('created_at', from)
                    .lte('created_at', to),
                supabase
                    .from('special_orders')
                    .select('user_id, price, seller_rank')
                    .gte('created_at', from)
                    .lte('created_at', to),
                supabase
                    .from('users')
                    .select('id, display_name, rank, account_number'),
            ])

            if (salesResult.error) {
                console.error(salesResult.error);
                return
            }
            if (specialOrdersResult.error) {
                console.error(specialOrdersResult.error);
                return
            }
            if (usersResult.error) {
                console.error(usersResult.error);
                return
            }

            const allSales = [
                ...(salesResult.data ?? []),
                ...(specialOrdersResult.data ?? []),
            ]

            const usersData = usersResult.data ?? []

            const commissionMap: Record<string, number> = {}
            const saleCountMap: Record<string, number> = {}

            for (const sale of allSales) {
                const commission = getCommission(sale.price)
                const multiplier = RANK_MULTIPLIERS[sale.seller_rank] ?? 1.0
                commissionMap[sale.user_id] = (commissionMap[sale.user_id] ?? 0) + commission * multiplier
                saleCountMap[sale.user_id] = (saleCountMap[sale.user_id] ?? 0) + 1
            }

            const result: WorkerSalary[] = Object.entries(commissionMap).map(([user_id, total_final]) => {
                const user = usersData.find((u) => u.id === user_id)
                return {
                    user_id,
                    display_name: user?.display_name ?? 'Tundmatu',
                    rank: user?.rank ?? 'Tundmatu',
                    total_final: Math.round(total_final),
                    sale_count: saleCountMap[user_id] ?? 0,
                    account_number: user?.account_number ?? null,
                }
            })
            const sorted = result.sort((a, b) => b.total_final - a.total_final)
            setSalaries(sorted)
            setTotal(sorted.reduce((sum, worker) => sum + worker.total_final, 0))        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (authorized) fetchSalaries()
    }, [authorized])

    const handlePaySalaries = async () => {
        setPaying(true)
        try {
            const {error} = await supabase.from('salary_periods').insert({
                paid_by: currentUserId,
            })

            if (error) {
                console.error('Error recording payout:', error)
                alert('Viga palga perioodi salvestamisel.')
                setShowPayConfirm(false)
                return
            }

            await fetchSalaries()
            setShowPayConfirm(false)
        } finally {
            setPaying(false)
        }
    }

    const handleCopyAccount = (worker: WorkerSalary) => {
        if (!worker.account_number) return
        navigator.clipboard.writeText(worker.account_number)
        setCopiedId(worker.user_id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    if (authorized === null) return <LoadingSpinner/>

    if (!authorized) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-6">
                <div
                    className="rounded-2xl border border-zinc-700/70 shadow-lg bg-zinc-800/60 backdrop-blur-sm p-6 text-center max-w-sm">
                    <TriangleAlert className="w-8 h-8 mx-auto mb-4 text-red-400"/>
                    <p className="text-white font-semibold text-lg mb-1">Ligipääs keelatud</p>
                    <p className="text-white text-sm">Sul ei ole õigust seda lehte vaadata.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 text-white space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-3xl">Palgad</h1>
            </div>

            <div className="flex items-center gap-2 text-lg text-white font-bold">
                <Info className="w-8 h-8 text-violet-300"/>
                {periodStart
                    ? `Periood algas: ${new Date(periodStart).toLocaleString('et-EE')}`
                    : 'Vajuta palkade maksmise nupule alles siis, kui palgad on makstud!'}
            </div>

            {loading ? <LoadingSpinner/> : (
                <>
                    <div className="rounded-xl border border-zinc-700 overflow-hidden shadow-lg overflow-x-auto">
                        <table className="w-full text-left min-w-150">
                            <thead className="bg-zinc-900 border-b border-zinc-700">
                            <tr>
                                <th className="px-6 py-4 text-sm font-bold text-zinc-200">
                                    <div className="flex items-center gap-2">
                                        <User className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Töötaja
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-sm font-bold text-zinc-200">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Auaste
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-sm font-bold text-zinc-200">
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Müüke
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-sm font-bold text-zinc-200">
                                    <div className="flex items-center gap-2">
                                        <Banknote className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Palk
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-sm font-bold text-zinc-200">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Kontonumber
                                    </div>
                                </th>
                            </tr>
                            </thead>

                            <tbody>
                            {salaries.length === 0 ? (
                                <tr>
                                    <td colSpan={5}
                                        className="px-6 py-8 text-center backdrop-blur-sm bg-zinc-800/60 text-zinc-300 text-sm">
                                        Müüke pole veel tehtud.
                                    </td>
                                </tr>
                            ) : (
                                salaries.map((worker) => (
                                    <tr
                                        key={worker.user_id}
                                        className="hover:bg-zinc-800/50 transition duration-150 bg-zinc-800/60"
                                    >
                                        <td className="px-6 py-4 text-sm font-medium text-white">
                                            {worker.display_name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-violet-300">
                                            {worker.rank ?? 'Katseajaline'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-300">
                                            {worker.sale_count}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-emerald-400">
                                            ${worker.total_final.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {worker.account_number ? (
                                                <button
                                                    onClick={() => handleCopyAccount(worker)}
                                                    className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs transition cursor-pointer"
                                                >
                                                    {copiedId === worker.user_id ? (
                                                        <>
                                                            <Check className="w-3 h-3 text-emerald-400"/>
                                                            Kopeeritud
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-3 h-3"/>
                                                            {worker.account_number}
                                                        </>
                                                    )}
                                                </button>
                                            ) : (
                                                <span className="text-zinc-500 text-xs">Puudub</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    {authorized && (
                        <div className="flex justify-between">
                            <button
                                onClick={() => setShowPayConfirm(true)}
                                disabled={paying}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-lg transition cursor-pointer disabled:opacity-50"
                            >
                                <Check className="text-emerald-400 w-5 h-5"/>
                                Palgad on makstud
                            </button>
                            {salaries.length > 0 && (
                                    <div className="flex items-center justify-between">
                                        <p className="flex items-center gap-2 text-lg font-extrabold text-white">
                                            Väljamaksed kokku: ${total.toLocaleString()}
                                        </p>
                                    </div>
                            )}
                        </div>
                    )}
                </>
            )}

            <PaySalariesConfirm
                isOpen={showPayConfirm}
                isLoading={paying}
                onConfirm={handlePaySalaries}
                onCancel={() => setShowPayConfirm(false)}
            />
        </div>
    )
}
