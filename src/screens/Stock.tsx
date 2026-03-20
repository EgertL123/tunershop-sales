import {useEffect, useState} from 'react'
import {supabase} from '../supabaseClient'
import StockSearch from '../components/stock/StockSearch'
import StockTable from '../components/stock/StockTable'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'

type Stock = {
    id: string
    vehicle_name: string
    class: string
    current_stock: number
    max_stock: number
}

export default function Stock() {
    const [stocks, setStocks] = useState<Stock[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Fetch data from Supabase
    useEffect(() => {
        const fetchStocks = async () => {
            setLoading(true)
            try {
                const {data, error} = await supabase
                    .from('stock')
                    .select('*')
                    .order('vehicle_name', {ascending: true})

                if (error) {
                    console.error('Error fetching stocks:', error)
                    return
                }

                setStocks(data || [])
            } finally {
                setLoading(false)
            }
        }

        fetchStocks()

        // Subscribe to real-time changes
        const channel = supabase
            .channel('stock-realtime')
            .on(
                'postgres_changes',
                {event: '*', schema: 'public', table: 'stock'},
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setStocks((prev) => [...prev, payload.new as Stock])
                    } else if (payload.eventType === 'UPDATE') {
                        setStocks((prev) =>
                            prev.map((s) =>
                                s.id === (payload.new as Stock).id ? (payload.new as Stock) : s
                            )
                        )
                    } else if (payload.eventType === 'DELETE') {
                        setStocks((prev) => prev.filter((s) => s.id !== (payload.old as Stock).id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    // Filter stocks based on search term
    const filteredStocks = stocks.filter((stock) =>
        stock.vehicle_name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const totalPages = Math.ceil(filteredStocks.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentStocks = filteredStocks.slice(startIndex, endIndex)

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1)
        }
    }

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1)
        }
    }

    const handleClearSearch = () => {
        setSearchTerm('')
        setCurrentPage(1)
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        setCurrentPage(1)
    }

    return (
        <div className="p-6 text-white space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Sõidukite limiidid</h1>
            </div>

            <StockSearch
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                onClearSearch={handleClearSearch}
            />

            {loading ? (
                <LoadingSpinner/>
            ) : (
                <>
                    <StockTable stocks={currentStocks} searchTerm={searchTerm}/>

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPrevious={handlePrevious}
                            onNext={handleNext}
                        />
                    )}
                </>
            )}
        </div>
    )
}
