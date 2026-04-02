import {CarFront, Layers, Package, Radio} from 'lucide-react'
import StockRow from './StockRow'

type Stock = {
    id: string
    vehicle_name: string
    class: string
    current_stock: number
    max_stock: number
}

type StockTableProps = {
    stocks: Stock[]
    searchTerm: string
}

export default function StockTable({stocks, searchTerm}: StockTableProps) {
    return (
        <div className="rounded-xl border border-zinc-700 overflow-x-auto shadow-lg backdrop-blur-sm">
            <table className="w-full  text-left">
                <thead className="bg-zinc-900 border-b border-zinc-700">
                <tr>
                    <th className="px-2 py-2 md:px-6 md:py-4 text-sm font-bold text-zinc-200">
                        <div className="flex items-center gap-2">
                            <CarFront className="w-5 h-5 text-violet-300 shrink-0"/>
                            Sõiduk
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
                            <Radio className="w-5 h-5 text-violet-300 shrink-0"/>
                            Müüdud
                        </div>
                    </th>
                    <th className="px-2 py-2 md:px-6 md:py-4 text-sm font-bold text-zinc-200">
                        <div className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-violet-300 shrink-0"/>
                            Limiit
                        </div>
                    </th>
                </tr>
                </thead>

                <tbody>
                {stocks.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-zinc-300 text-sm bg-zinc-800/60">
                            {searchTerm ? 'Otsingule vastavaid tulemusi ei leitud.' : 'Info puudub.'}
                        </td>
                    </tr>
                ) : (
                    stocks.map((stock) => (
                        <StockRow key={stock.id} stock={stock}/>
                    ))
                )}
                </tbody>
            </table>
        </div>
    )
}
