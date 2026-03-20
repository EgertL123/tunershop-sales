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
import AddSale from '../components/sales/AddSale.tsx'
import EditSaleDialog from '../components/sales/EditSale.tsx'
import DeleteSaleDialog from '../components/sales/DeleteSale.tsx'
import LoadingSpinner from '../components/LoadingSpinner.tsx'
import Pagination from '../components/Pagination.tsx'
import {usePagination} from '../hooks/usePagination'

type Sale = {
    id: string
    created_at: string
    vehicle_name: string
    buyer_name: string
    plate: string
    price: number
    user_id: string
    display_name: string
    sale_class: string
}

export default function Dashboard() {
    const [sales, setSales] = useState<Sale[]>([])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)

    const {currentPage, totalPages, currentItems, handlePrevious, handleNext, resetPage} = usePagination(sales, 10)

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

    const fetchSales = async () => {
        setLoading(true)
        try {
            const {data, error} = await supabase
                .from('sales')
                .select(`*, users (display_name)`)
                .order('created_at', {ascending: false})

            if (error) {
                console.error('Error fetching sales:', error)
                return
            }

            setSales(data.map((sale: any) => ({
                ...sale,
                display_name: sale.users?.display_name ?? 'Tundmatu',
            })))
            resetPage()
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSales()

        const channel = supabase
            .channel('sales-realtime')
            .on(
                'postgres_changes',
                {event: 'INSERT', schema: 'public', table: 'sales'},
                async (payload) => {
                    const newSale = payload.new as Sale

                    const {data: userData} = await supabase
                        .from('users')
                        .select('display_name')
                        .eq('id', newSale.user_id)
                        .single()

                    setSales((prev) => [{
                        ...newSale,
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

    const handleEdit = (sale: Sale) => {
        setSelectedSale(sale)
        setEditDialogOpen(true)
    }

    const handleDeleteClick = (sale: Sale) => {
        setSelectedSale(sale)
        setDeleteDialogOpen(true)
    }

    return (
        <div className="p-6 text-white space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Müügitabel</h1>
            </div>

            <div>
                <button
                    onClick={() => setDialogOpen(true)}
                    className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
                >
                    <CirclePlus className="w-6 h-6 mr-2"/>
                    Lisa uus müük
                </button>
                <AddSale open={dialogOpen} onClose={() => setDialogOpen(false)}/>
                <EditSaleDialog
                    open={editDialogOpen}
                    onClose={() => setEditDialogOpen(false)}
                    sale={selectedSale}
                    onSave={fetchSales}
                />
                <DeleteSaleDialog
                    open={deleteDialogOpen}
                    onClose={() => setDeleteDialogOpen(false)}
                    saleId={selectedSale?.id ?? null}
                    saleVehicleName={selectedSale?.vehicle_name ?? null}
                    onDelete={() => {
                        setSales((prev) => prev.filter((s) => s.id !== selectedSale?.id))
                        resetPage()
                    }}
                />
            </div>

            {loading ? (
                <LoadingSpinner/>
            ) : (
                <>
                    <div className="rounded-xl border border-zinc-700 overflow-x-auto shadow-lg">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-900 border-b border-zinc-700">
                            <tr>
                                <th className="px-2 py-2 md:px-6 md:py-4 text-sm font-semibold text-zinc-300">
                                    <div className="flex items-center gap-2">
                                        <CalendarFold className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Kuupäev ja aeg
                                    </div>
                                </th>
                                <th className="px-2 py-2 md:px-6 md:py-4 text-sm font-semibold text-zinc-300">
                                    <div className="flex items-center gap-2">
                                        <CarFront className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Sõiduk
                                    </div>
                                </th>
                                <th className="px-2 py-2 md:px-6 md:py-4 text-sm font-semibold text-zinc-300">
                                    <div className="flex items-center gap-2">
                                        <CircleDollarSign className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Hind
                                    </div>
                                </th>
                                <th className="px-2 py-2 md:px-6 md:py-4 text-sm font-semibold text-zinc-300">
                                    <div className="flex items-center gap-2">
                                        <Hash className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Numbrimärk
                                    </div>
                                </th>
                                <th className="px-2 py-2 md:px-6 md:py-4 text-sm font-semibold text-zinc-300">
                                    <div className="flex items-center gap-2">
                                        <ShoppingBasket className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Ostja
                                    </div>
                                </th>
                                <th className="px-2 py-2 md:px-6 md:py-4 text-sm font-semibold text-zinc-300">
                                    <div className="flex items-center gap-2">
                                        <Store className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Müüja
                                    </div>
                                </th>
                                {isAdmin && (
                                    <th className="px-2 py-2 md:px-6 md:py-4 text-sm font-semibold text-zinc-300">
                                        <div className="flex items-center gap-2">
                                            <Gavel className="w-5 h-5 text-violet-300 shrink-0"/>
                                            Admin
                                        </div>
                                    </th>
                                )}
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-zinc-700/50">
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 7 : 6} className="px-6 py-8 text-center text-zinc-400 text-sm">
                                        Info puudub.
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((sale) => (
                                    <tr
                                        key={sale.id}
                                        className="hover:bg-zinc-700 transition duration-150 bg-zinc-800"
                                    >
                                        <td className="px-6 py-4 text-sm text-zinc-400">
                                            {new Date(sale.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-200">{sale.vehicle_name}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-emerald-400">
                                            {sale.price.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-indigo-300 uppercase">{sale.plate}</td>
                                        <td className="px-6 py-4 text-sm text-zinc-200">{sale.buyer_name}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-white">{sale.display_name}</td>
                                        {isAdmin && (
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(sale)}
                                                        className="inline-flex items-center p-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer"
                                                    >
                                                        <Edit2 className="w-4 h-4"/>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(sale)}
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

                    {sales.length > 0 && (
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