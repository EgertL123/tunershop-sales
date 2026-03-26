import {useEffect} from 'react'
import {Check, MessageSquareWarning, X} from 'lucide-react'

type PayConfirmationModalProps = {
    isOpen: boolean
    isLoading: boolean
    onConfirm: () => void
    onCancel: () => void
}

export default function PaySalariesConfirm({ isOpen, isLoading, onConfirm, onCancel }: PayConfirmationModalProps) {

    // Handle keyboard events for enter and escape keys
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (!isLoading) onConfirm();
            }
            if (e.key === 'Escape') {
                onCancel();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isLoading, onConfirm, onCancel]);

    return (
        <>
            {/* Backdrop with fade animation */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onCancel}
            >
                {/* Modal with scale and slide animation */}
                <div
                    className={`bg-zinc-800 border border-zinc-700 rounded-xl shadow-lg max-w-sm w-full mx-4 p-6 space-y-6 transform transition-all duration-300 ${
                        isOpen
                            ? 'opacity-100 scale-100 translate-y-0'
                            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-yellow-500/10 rounded-lg">
                            <MessageSquareWarning className="w-6 h-6 text-yellow-400"/>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-white">Kinnita palkade maksmine</h2>
                            <p className="text-sm text-zinc-400 mt-1">
                                Kas oled kindel, et palgad on makstud?
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onCancel}
                            className="cursor-pointer px-4 py-2 text-sm rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-700 transition"
                        >
                            <div className="flex items-center gap-1">
                                <X className="w-4 h-4 text-red-400"/>
                                Tühista
                            </div>
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer font-medium rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                                    Salvestamine...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4"/>
                                    Kinnita
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
