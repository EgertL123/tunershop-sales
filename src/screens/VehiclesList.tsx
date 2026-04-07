import {useEffect, useState} from "react";
import {supabase} from '../supabaseClient'
import LoadingSpinner from "../components/LoadingSpinner.tsx";
import {
    CarFront,
    CircleDollarSign,
    Package,
    Layers,
    ChevronDown,
    Search,
    Sparkles,
} from "lucide-react";
import Pagination from "../components/Pagination.tsx";
import CategoryDropdown from "../components/CategoryDropdown.tsx";
import {usePagination} from "../hooks/usePagination.ts";

type Vehicle = {
    id: string
    vehicle_name: string
    price: number
    class: string
    category: string
    storage: number
}

export default function VehiclesList() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [categories, setCategories] = useState<string[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Filter vehicles based on category and search term
    const filteredVehicles = vehicles.filter((vehicle) => {
        const matchesCategory = selectedCategory === 'all' || vehicle.category === selectedCategory
        const matchesSearch = vehicle.vehicle_name.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const {currentPage, totalPages, currentItems, handlePrevious, handleNext, resetPage} = usePagination(filteredVehicles, 10)

    useEffect(() => {
        const fetchVehicles = async () => {
            setLoading(true)
            try {
                const {data, error} = await supabase
                    .from('vehicles_list')
                    .select('*')
                    .order('price', {ascending: true})

                if (error) {
                    console.error('Error fetching vehicles:', error)
                    return
                }

                setVehicles(data || [])

                // Extract unique categories
                const uniqueCategories = [...new Set(data?.map(v => v.category) || [])]
                setCategories(uniqueCategories.sort())

                resetPage()
            } finally {
                setLoading(false)
            }
        }

        fetchVehicles()
    }, [])

    // Reset to first page when category or search changes
    useEffect(() => {
        resetPage()
    }, [selectedCategory, searchTerm])

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
    }

    const handleClearSearch = () => {
        setSearchTerm('')
    }

    return (
        <div className="p-6 text-white space-y-6">
            <div>
                <h1 className="text-3xl">Tavasõidukid</h1>
            </div>

            {loading ? (
                <LoadingSpinner/>
            ) : (
                <>
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Category Filter */}
                        <div className="relative">
                            <CategoryDropdown
                                selectedCategory={selectedCategory}
                                categories={categories}
                                onCategoryChange={handleCategoryChange}
                            />
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none"/>
                        </div>

                        {/* Search Filter */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400 z-10"/>
                            <input
                                type="text"
                                placeholder="Otsi sõiduki nime järgi..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-10 py-2 bg-zinc-800/60 backdrop-blur-sm border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-violet-400 transition"
                            />
                            {searchTerm && (
                                <button
                                    onClick={handleClearSearch}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-xl border border-zinc-700 overflow-x-auto shadow-lg backdrop-blur-sm">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-900 border-b border-zinc-700">
                            <tr>
                                <th className="px-2 py-2 md:px-6 md:py-4 text-sm font-bold text-zinc-200">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Kategooria
                                    </div>
                                </th>
                                <th className="px-2 py-2 md:px-6 md:py-4 text-sm font-bold text-zinc-200">
                                    <div className="flex items-center gap-2">
                                        <CarFront className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Sõiduk
                                    </div>
                                </th>
                                <th className="px-2 py-2 md:px-6 md:py-4 text-sm font-bold text-zinc-200">
                                    <div className="flex items-center gap-2">
                                        <CircleDollarSign className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Hind
                                    </div>
                                </th>
                                <th className="px-2 py-2 md:px-6 md:py-4 text-sm font-bold text-zinc-200">
                                    <div className="flex items-center gap-2">
                                        <Layers className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Klass
                                    </div>
                                </th>
                                <th className="px-2 py-2 md:px-6 md:py-4 text-sm font-bold text-zinc-200">
                                    <div className="flex items-center gap-2">
                                        <Package className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Mahutavus
                                    </div>
                                </th>
                            </tr>
                            </thead>

                            <tbody>
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan={5}
                                        className="px-6 py-8 text-center bg-zinc-800/60 backdrop-blur-sm text-zinc-300 text-sm">
                                        Info puudub.
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((vehicle) => (
                                    <tr
                                        key={vehicle.id}
                                        className="hover:bg-zinc-800/50 hover:backdrop-blur-sm transition duration-150 bg-zinc-800/60"
                                    >
                                        <td className="px-6 py-4 text-sm font-semibold text-zinc-200">{vehicle.category}</td>
                                        <td className="px-6 py-4 text-sm text-zinc-200">{vehicle.vehicle_name}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-emerald-400">
                                            ${vehicle.price.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm">{vehicle.class}-klass</td>
                                        <td className="px-6 py-4 text-sm text-zinc-200">
                                            {vehicle.storage ? `${vehicle.storage} kg` : 'N/A'}
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    {filteredVehicles.length > 0 && (
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
