import {Search, X} from 'lucide-react'

type StockSearchProps = {
    searchTerm: string
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onClearSearch: () => void
}

export default function StockSearch({searchTerm, onSearchChange, onClearSearch}: StockSearchProps) {
    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400"/>
            <input
                type="text"
                placeholder="Otsi sõiduki nime järgi..."
                value={searchTerm}
                onChange={onSearchChange}
                className="w-full pl-10 pr-10 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition"
            />
            {searchTerm && (
                <button
                    onClick={onClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition"
                >
                    <X className="w-5 h-5"/>
                </button>
            )}
        </div>
    )
}
