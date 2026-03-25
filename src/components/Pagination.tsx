import {CircleArrowLeft, CircleArrowRight} from 'lucide-react'

type PaginationProps = {
    currentPage: number
    totalPages: number
    onPrevious: () => void
    onNext: () => void
}

export default function Pagination({currentPage, totalPages, onPrevious, onNext}: PaginationProps) {
    return (
        <div className="flex items-center justify-between">
            <button
                onClick={onPrevious}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-2 cursor-pointer bg-zinc-700 border border-zinc-600 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-2 md:px-4 py-2 rounded-lg transition"
            >
                <CircleArrowLeft className="w-5 h-5 text-violet-300"/>
                Eelmine
            </button>

            <span className="text-white text-sm">
                Leht {currentPage} / {totalPages}
            </span>

            <button
                onClick={onNext}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-2 cursor-pointer bg-zinc-700 border border-zinc-600 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-2 md:px-4 py-2 rounded-lg transition"
            >
                Järgmine
                <CircleArrowRight className="w-5 h-5 text-violet-300"/>
            </button>
        </div>
    )
}
