import {useEffect, useState} from 'react'
import {supabase} from '../supabaseClient'
import LoadingSpinner from '../components/LoadingSpinner.tsx'
import {CirclePlus, Trash2, Gavel, Wrench, Coffee, Building2, User, Info, SquareCheckBig, Search, X} from 'lucide-react'
import AddDiscount from '../components/discounts/AddDiscount.tsx'
import DeleteDiscount from '../components/discounts/DeleteDiscount.tsx'
import Pagination from '../components/Pagination.tsx'

export type DiscountCustomer = {
    id: string
    name: string
    company: string
    discounts_used: number
}

const ITEMS_PER_PAGE = 10

export default function Discounts() {
    const [discounts, setDiscounts] = useState<DiscountCustomer[]>([])
    const [filteredDiscounts, setFilteredDiscounts] = useState<DiscountCustomer[]>([])
    const [loading, setLoading] = useState(true)
    const [canManage, setCanManage] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState<DiscountCustomer | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    const fetchDiscountsData = async () => {
        const {data, error} = await supabase
            .from('discount')
            .select('*')
            .order('name', {ascending: true})

        if (error) {
            console.error('Error fetching discounts:', error)
        } else {
            setDiscounts(data || [])
            setFilteredDiscounts(data || [])
        }
        setLoading(false)
    }

    useEffect(() => {
        const fetchUserAndDiscounts = async () => {
            setLoading(true)
            try {
                const {data: {user}} = await supabase.auth.getUser()
                if (user) {
                    const {data} = await supabase
                        .from('users')
                        .select('is_admin, rank')
                        .eq('id', user.id)
                        .single()

                    if (data?.is_admin || data?.rank === 'CEO') {
                        setCanManage(true)
                    }
                }
            } catch (err) {
                console.error('Error fetching user permissions:', err)
            }
            await fetchDiscountsData()
        }

        fetchUserAndDiscounts()
    }, [])

    useEffect(() => {
        const channel = supabase
            .channel('discount-realtime')
            .on(
                'postgres_changes',
                {event: '*', schema: 'public', table: 'discount'},
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setDiscounts((prev) => [...prev, payload.new as DiscountCustomer].sort((a, b) => a.name.localeCompare(b.name)))
                    } else if (payload.eventType === 'UPDATE') {
                        setDiscounts((prev) => prev.map((c) => c.id === (payload.new as DiscountCustomer).id ? payload.new as DiscountCustomer : c))
                    } else if (payload.eventType === 'DELETE') {
                        setDiscounts((prev) => prev.filter((c) => c.id !== (payload.old as DiscountCustomer).id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    // Update filtered results and reset to page 1 when search term changes
    useEffect(() => {
        const filtered = discounts.filter((customer) =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setFilteredDiscounts(filtered)
        setCurrentPage(1)
    }, [searchTerm, discounts])

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
    }

    const handleClearSearch = () => {
        setSearchTerm('')
    }

    const updateDiscountCount = async (id: string, newCount: number) => {
        setDiscounts(prev => prev.map(c => c.id === id ? {...c, discounts_used: newCount} : c))
        const {error} = await supabase
            .from('discount')
            .update({discounts_used: newCount})
            .eq('id', id)

        if (error) {
            console.error('Error updating discount:', error)
            await fetchDiscountsData()
        }
    }

    const handleDeleteClick = (customer: DiscountCustomer) => {
        setSelectedCustomer(customer)
        setDeleteDialogOpen(true)
    }

    const getCompanyIcon = (companyName: string) => {
        switch (companyName) {
            case 'Carstar':
                return <Wrench className="w-5 h-5 text-indigo-300"/>
            case 'Jose Cafe':
                return <Coffee className="w-5 h-5 text-indigo-300"/>
            default:
                return <Building2 className="w-5 h-5 text-indigo-300"/>
        }
    }

    // Pagination
    const totalPages = Math.ceil(filteredDiscounts.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const paginatedDiscounts = filteredDiscounts.slice(startIndex, endIndex)

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1)
        }
    }

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1)
        }
    }

    return (
        <div className="p-6 text-white space-y-6">
            <div>
                <h1 className="text-3xl">Koostööd</h1>
            </div>

            <div className="flex items-center gap-2 text-sm text-white font-bold">
                <Info className="w-6 h-6 text-indigo-300"/>
                Limiidid nullitakse iga kuu alguses automaatselt.
            </div>

            {canManage && (
                <div>
                    <button
                        onClick={() => setDialogOpen(true)}
                        className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
                    >
                        <CirclePlus className="w-6 h-6 mr-2"/>
                        Lisa uus töötaja
                    </button>

                    <AddDiscount
                        open={dialogOpen}
                        onClose={() => setDialogOpen(false)}
                        onSave={fetchDiscountsData}
                    />
                </div>
            )}

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400 z-10"/>
                <input
                    type="text"
                    placeholder="Otsi töötaja nime järgi..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-10 py-2 bg-zinc-800/60 backdrop-blur-sm border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-violet-400 transition"
                />
                {searchTerm && (
                    <button
                        onClick={handleClearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
                    >
                        <X className="w-5 h-5"/>
                    </button>
                )}
            </div>

            {loading ? <LoadingSpinner/> : (
                <>
                    <div
                        className="rounded-xl border border-zinc-700 overflow-x-auto shadow-lg backdrop-blur-sm">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-900 border-b border-zinc-700">
                            <tr>
                                <th className="px-6 py-3 text-sm font-semibold text-zinc-300">
                                    <div className="flex items-center gap-2">
                                        <User className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Töötaja
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-sm font-semibold text-zinc-300">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Ettevõte
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-sm font-semibold text-zinc-300">
                                    <div className="flex items-center justify-center gap-2">
                                        <SquareCheckBig className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Kasutatud
                                    </div>
                                </th>
                                {canManage && (
                                    <th className="px-6 py-3 text-sm font-semibold text-zinc-300">
                                        <div className="flex items-center justify-center gap-2">
                                            <Gavel className="w-5 h-5 text-violet-300 shrink-0"/>
                                            Admin
                                        </div>
                                    </th>
                                )}
                            </tr>
                            </thead>
                            <tbody>
                            {paginatedDiscounts.length === 0 ? (
                                <tr>
                                    <td colSpan={canManage ? 4 : 3}
                                        className="px-6 py-6 text-center text-zinc-300 text-sm bg-zinc-800/60">
                                        {filteredDiscounts.length === 0 ? 'Ühtegi töötajat ei leitud.' : 'Otsingu tulemusi ei leitud.'}
                                    </td>
                                </tr>
                            ) : (
                                paginatedDiscounts.map((customer) => (
                                    <tr key={customer.id}
                                        className="border-zinc-700/50 last:border-0 bg-zinc-800/60  hover:bg-zinc-800/50 hover:backdrop-blur-sm transition">
                                        <td className="px-6 py-4 text-sm font-medium text-white">
                                            {customer.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                {getCompanyIcon(customer.company)}
                                                <span className="text-zinc-300">{customer.company}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-4">
                                                <input
                                                    type="checkbox"
                                                    checked={customer.discounts_used >= 1}
                                                    onChange={(e) => updateDiscountCount(customer.id, e.target.checked ? 1 : 0)}
                                                    className="w-5 h-5 rounded border-zinc-600 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                                                />
                                                <input
                                                    type="checkbox"
                                                    checked={customer.discounts_used === 2}
                                                    onChange={(e) => updateDiscountCount(customer.id, e.target.checked ? 2 : 1)}
                                                    className="w-5 h-5 rounded border-zinc-600 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                                                />
                                            </div>
                                        </td>
                                        {canManage && (
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center">
                                                    <button
                                                        onClick={() => handleDeleteClick(customer)}
                                                        className="inline-flex items-center justify-center p-1.5 rounded bg-red-600 hover:bg-red-700 text-white transition cursor-pointer"
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPrevious={handlePreviousPage}
                            onNext={handleNextPage}
                        />
                    )}
                </>
            )}

            <DeleteDiscount
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                customerId={selectedCustomer?.id ?? null}
                customerName={selectedCustomer?.name ?? null}
                onDelete={() => {
                    setDiscounts((prev) => prev.filter((c) => c.id !== selectedCustomer?.id))
                    setCurrentPage(1)
                }}
            />
        </div>
    )
}
