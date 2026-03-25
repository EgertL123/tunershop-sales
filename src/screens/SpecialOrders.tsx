import {useEffect, useState} from 'react'
import {
    CalendarFold,
    CarFront,
    CircleDollarSign,
    Hash,
    ShoppingBasket,
    Store,
    CirclePlus,
    Edit2,
    Trash2,
    Gavel
} from 'lucide-react'
import {supabase} from '../supabaseClient'
import LoadingSpinner from '../components/LoadingSpinner.tsx'
import Pagination from '../components/Pagination.tsx'
import {usePagination} from '../hooks/usePagination'
import AddSpecialOrder from "../components/specialOrders/AddSpecialOrder.tsx"
import EditSpecialOrderDialog from "../components/specialOrders/EditSpecialOrder.tsx"
import DeleteSpecialOrder from "../components/specialOrders/DeleteSpecialOrder.tsx"

type SpecialOrder = {
    id: string
    created_at: string
    vehicle_name: string
    buyer_name: string
    plate: string
    price: number
    user_id: string
    display_name: string
}

export default function SpecialOrders() {
    const [specialOrders, setSpecialOrders] = useState<SpecialOrder[]>([])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedSpecialOrder, setSelectedSpecialOrder] = useState<SpecialOrder | null>(null)
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)

    const {currentPage, totalPages, currentItems, handlePrevious, handleNext, resetPage} = usePagination(specialOrders, 10)

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const {data: {user}} = await supabase.auth.getUser()
                if (user) {
                    const {data} = await supabase
                        .from('users')
                        .select('is_admin')
                        .eq('id', user.id)
                        .single()
                    setIsAdmin(data?.is_admin ?? false)
                }
            } catch (err) {
                console.error('Error fetching user:', err)
            }
        }

        fetchCurrentUser()
    }, [])

    const fetchSpecialOrders = async () => {
        setLoading(true)
        try {
            const {data, error} = await supabase
                .from('special_orders')
                .select(`*, users (display_name)`)
                .order('created_at', {ascending: false})

            if (error) {
                console.error('Error fetching special orders:', error)
                return
            }

            setSpecialOrders(data.map((order: any) => ({
                ...order,
                display_name: order.users?.display_name ?? 'Tundmatu',
            })))
            resetPage()
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSpecialOrders()

        const channel = supabase
            .channel('special_orders-realtime')
            .on(
                'postgres_changes',
                {event: 'INSERT', schema: 'public', table: 'special_orders'},
                async (payload) => {
                    const newSpecialOrder = payload.new as SpecialOrder

                    const {data: userData} = await supabase
                        .from('users')
                        .select('display_name')
                        .eq('id', newSpecialOrder.user_id)
                        .single()

                    setSpecialOrders((prev) => [{
                        ...newSpecialOrder,
                        display_name: userData?.display_name ?? 'Tundmatu',
                    }, ...prev])
                    resetPage()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const handleEdit = (specialOrder: SpecialOrder) => {
        setSelectedSpecialOrder(specialOrder)
        setEditDialogOpen(true)
    }

    const handleDeleteClick = (specialOrder: SpecialOrder) => {
        setSelectedSpecialOrder(specialOrder)
        setDeleteDialogOpen(true)
    }

    return (
        <div className="p-6 text-white space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Eritellimused</h1>
            </div>

            <div>
                <button
                    onClick={() => setDialogOpen(true)}
                    className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
                >
                    <CirclePlus className="w-6 h-6 mr-2"/>
                    Lisa uus eritellimus
                </button>
                <AddSpecialOrder open={dialogOpen} onClose={() => setDialogOpen(false)}/>
                <EditSpecialOrderDialog
                    open={editDialogOpen}
                    onClose={() => setEditDialogOpen(false)}
                    order={selectedSpecialOrder}
                    onSave={fetchSpecialOrders}
                />
                <DeleteSpecialOrder
                    open={deleteDialogOpen}
                    onClose={() => setDeleteDialogOpen(false)}
                    order={selectedSpecialOrder}
                    onDelete={() => {
                        setSpecialOrders((prev) => prev.filter((o) => o.id !== selectedSpecialOrder?.id))
                        resetPage()
                    }}
                />
            </div>

            {loading ? (
                <LoadingSpinner/>
            ) : (
                <>
                    <div className="rounded-xl border border-zinc-700 overflow-x-auto shadow-lg backdrop-blur-sm">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-900 border-b border-zinc-700">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-zinc-300">
                                    <div className="flex items-center gap-2">
                                        <CalendarFold className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Kuupäev
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-sm font-semibold text-zinc-300">
                                    <div className="flex items-center gap-2">
                                        <CarFront className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Sõiduk
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-sm font-semibold text-zinc-300">
                                    <div className="flex items-center gap-2">
                                        <CircleDollarSign className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Hind
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-sm font-semibold text-zinc-300">
                                    <div className="flex items-center gap-2">
                                        <Hash className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Numbrimärk
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-sm font-semibold text-zinc-300">
                                    <div className="flex items-center gap-2">
                                        <ShoppingBasket className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Ostja
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-sm font-semibold text-zinc-300">
                                    <div className="flex items-center gap-2">
                                        <Store className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Müüja
                                    </div>
                                </th>
                                {isAdmin && (
                                    <th className="px-6 py-4 text-sm font-semibold text-zinc-300">
                                        <div className="flex items-center gap-2">
                                            <Gavel className="w-5 h-5 text-violet-300 shrink-0"/>
                                            Admin
                                        </div>
                                    </th>
                                )}
                            </tr>
                            </thead>

                            <tbody>
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 7 : 6} className="px-6 py-8 text-center text-zinc-300 text-sm">
                                        Info puudub.
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-zinc-800/50 hover:backdrop-blur-sm transition duration-150 bg-zinc-800/60"
                                    >
                                        <td className="px-6 py-4 text-sm text-zinc-400">
                                            {new Date(order.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-200">{order.vehicle_name}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-emerald-400">
                                            {order.price.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-indigo-300 uppercase">{order.plate}</td>
                                        <td className="px-6 py-4 text-sm text-zinc-200">{order.buyer_name}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-white">{order.display_name}</td>
                                        {isAdmin && (
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(order)}
                                                        className="inline-flex items-center p-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer"
                                                    >
                                                        <Edit2 className="w-4 h-4"/>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(order)}
                                                        className="inline-flex items-center p-1.5 rounded bg-red-600 hover:bg-red-700 text-white transition cursor-pointer"
                                                    >
                                                        <Trash2 className="w-4 h-4"/>
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    {specialOrders.length > 0 && (
                        <div className="mt-6">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPrevious={handlePrevious}
                                onNext={handleNext}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    )
}