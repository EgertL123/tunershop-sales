import {useEffect, useState} from 'react'
import {supabase} from '../supabaseClient'
import LoadingSpinner from '../components/LoadingSpinner.tsx'
import InfoCard from '../components/InfoCard.tsx'
import {ShoppingBasket, Gem, Crown, Car, Trophy, Users} from 'lucide-react'

type Stats = {
    totalSales: number
    totalSpecialOrders: number
    totalVehicles: number
    mostPopularVehicle: string | null
    mostFrequentBuyer: string | null
    topSeller: string | null
}

export default function Statistics() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true)
            try {
                const [salesResult, specialOrdersResult] = await Promise.all([
                    supabase.from('sales').select('vehicle_name, buyer_name, user_id, users(display_name)'),
                    supabase.from('special_orders').select('id'),
                ])

                if (salesResult.error) {
                    console.error(salesResult.error);
                    return
                }
                if (specialOrdersResult.error) {
                    console.error(specialOrdersResult.error);
                    return
                }

                const sales = salesResult.data ?? []
                const specialOrders = specialOrdersResult.data ?? []

                const vehicleMap: Record<string, number> = {}
                for (const sale of sales) {
                    vehicleMap[sale.vehicle_name] = (vehicleMap[sale.vehicle_name] ?? 0) + 1
                }

                const mostPopularVehicle = Object.entries(vehicleMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

                const buyerMap: Record<string, number> = {}
                for (const sale of sales) {
                    buyerMap[sale.buyer_name] = (buyerMap[sale.buyer_name] ?? 0) + 1
                }
                const mostFrequentBuyer = Object.entries(buyerMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

                const workerMap: Record<string, number> = {}
                for (const sale of sales) {
                    const workerName = (sale.users as any)?.display_name || 'Tundmatu'
                    workerMap[workerName] = (workerMap[workerName] ?? 0) + 1
                }
                const topSeller = Object.entries(workerMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

                setStats({
                    totalSales: sales.length,
                    totalSpecialOrders: specialOrders.length,
                    totalVehicles: sales.length + specialOrders.length,
                    mostPopularVehicle,
                    mostFrequentBuyer,
                    topSeller,
                })
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    return (
        <div className="p-6 text-white space-y-6">
            <h1 className="text-3xl">Statistika</h1>

            {loading ? <LoadingSpinner/> : (
                <div className="rounded-xl border border-zinc-700/70 bg-zinc-800/60 p-6 shadow-lg backdrop-blur-sm">
                    {/* Total vehicles with breakdown */}
                    <div className="mb-6">
                        <div className="mb-4 flex items-center gap-2 text-zinc-300 text-xl">
                            <span className="text-violet-300"><ShoppingBasket className="w-5 h-5"/></span>
                            <span>Müüke kokku</span>
                        </div>
                        <p className="text-md text-white mb-4">
                            <span className="font-bold">{stats?.totalVehicles.toLocaleString() ?? '0'}</span>, millest
                        </p>

                        <div className="space-y-2 ps-6 text-gray-300">
                            <div className="flex items-center gap-2">
                                <Car className="w-4 h-4 text-violet-300"/>
                                <span>Tavasõidukeid: <span
                                    className="font-bold text-white">{stats?.totalSales.toLocaleString() ?? '0'}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Gem className="w-4 h-4 text-violet-300"/>
                                <span>Eritellimusi: <span
                                    className="font-bold text-white">{stats?.totalSpecialOrders.toLocaleString() ?? '0'}</span></span>
                            </div>
                        </div>
                    </div>

                    {/* Other stats */}
                    <div className="border-t border-zinc-700/50 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InfoCard
                                icon={<Trophy className="w-5 h-5"/>}
                                label="Populaarseim sõiduk"
                                value={stats?.mostPopularVehicle ?? '-'}
                            />

                            <InfoCard
                                icon={<Crown className="w-5 h-5"/>}
                                label="Kõige tihedam klient"
                                value={stats?.mostFrequentBuyer ?? '-'}
                            />

                            <InfoCard
                                icon={<Users className="w-5 h-5"/>}
                                label="Enim müüke teinud müüja"
                                value={stats?.topSeller ?? '-'}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}