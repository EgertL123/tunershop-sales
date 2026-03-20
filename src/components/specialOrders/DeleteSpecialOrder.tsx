import {Trash2, X} from 'lucide-react'
import {supabase} from '../../supabaseClient.ts'
import {useState} from 'react'

type Props = {
    open: boolean
    onClose: () => void
    order: {
        id: string
        vehicle_name: string
    } | null
    onDelete: () => void
}

export default function DeleteSpecialOrder({open, onClose, order, onDelete}: Props) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleDelete = async () => {
        if (!order) return

        setLoading(true)
        setError(null)

        const {error: deleteError} = await supabase
            .from('special_orders')
            .delete()
            .eq('id', order.id)

        if (deleteError) {
            setError(deleteError.message)
            setLoading(false)
            return
        }

        setLoading(false)
        onDelete()
        onClose()
    }

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ${
                    open ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
            >
                <div
                    className={`bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-5 transform transition-all duration-300 ${
                        open
                            ? 'opacity-100 scale-100 translate-y-0'
                            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Trash2 className="w-6 h-6 text-red-400"/>
                            Kustuta eritellimus
                        </div>
                        <button onClick={onClose} className="text-zinc-400 hover:text-white transition cursor-pointer">
                            <X className="w-5 h-5"/>
                        </button>
                    </div>

                    <div className="space-y-3">
                        <p className="text-zinc-300">
                            Oled sa kindel, et soovid seda eritellimust kustutada?
                        </p>
                    </div>

                    {error && <p className="text-sm text-red-400">{error}</p>}

                    <div className="flex justify-end gap-3 pt-1">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-700 transition"
                        >
                            <div className="flex items-center gap-1 cursor-pointer">
                                <X className="w-4 h-4 text-red-400"/>
                                Tühista
                            </div>
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50 cursor-pointer flex items-center gap-1"
                        >
                            <Trash2 className="w-4 h-4"/>
                            {loading ? 'Kustutamine...' : 'Kustuta'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}