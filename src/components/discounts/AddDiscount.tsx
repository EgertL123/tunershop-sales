import {useState} from 'react'
import {X, CirclePlus, Check} from 'lucide-react'
import {supabase} from '../../supabaseClient.ts'
import {showError, showSuccess} from '../../services/ToastService.tsx'

type Props = {
    open: boolean
    onClose: () => void
    onSave: () => void
}

type DiscountForm = {
    name: string
    company: string
}

const companies = ['Carstar', 'Jose Cafe']

const defaultForm: DiscountForm = {
    name: '',
    company: '',
}

export default function AddDiscount({open, onClose, onSave}: Props) {
    const [form, setForm] = useState<DiscountForm>(defaultForm)
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm((prev) => ({...prev, [e.target.name]: e.target.value}))
    }

    const handleFormSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault()
        handleSubmit()
    }

    const handleSubmit = async () => {

        if (!form.name.trim() || !isNaN(Number(form.name))) {
            showError('Töötaja nimi peab olema täidetud!')
            return
        }

        if (!form.company) {
            showError('Ettevõte peab olema valitud!')
            return
        }

        setLoading(true)

        const {error: insertError} = await supabase.from('discount').insert({
            name: form.name.trim(),
            company: form.company,
            discounts_used: 0
        })

        if (insertError) {
            showError(insertError.message)
            setLoading(false)
            return
        }

        showSuccess('Töötaja edukalt lisatud.')
        setForm(defaultForm)
        setLoading(false)
        onSave()
        onClose()
    }

    return (
        <>
            {/* Backdrop with fade animation */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ${
                    open ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
            >
                {/* Modal with scale and slide animation */}
                <form
                    onSubmit={handleFormSubmit}
                    className={`bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl w-full mx-4 max-w-md p-6 space-y-5 transform transition-all duration-300 ${
                        open
                            ? 'opacity-100 scale-100 translate-y-0'
                            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CirclePlus className="w-6 h-6 text-emerald-400"/>
                            Lisa uus töötaja
                        </div>
                        <button type="button" onClick={onClose}
                                className="text-zinc-400 hover:text-white transition cursor-pointer">
                            <X className="w-5 h-5"/>
                        </button>
                    </div>

                    {/* Fields */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-zinc-400">
                            Töötaja nimi <span className="text-red-400">*</span>
                        </label>
                        <input
                            name="name"
                            type="text"
                            placeholder="Töötaja nimi"
                            value={form.name}
                            onChange={handleChange}
                            maxLength={70}
                            className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-zinc-400">
                            Ettevõte <span className="text-red-400">*</span>
                        </label>
                        <select
                            name="company"
                            value={form.company}
                            onChange={handleChange}
                            className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 transition cursor-pointer"
                        >
                            <option value="" disabled>Vali ettevõte</option>
                            {companies.map(company => (
                                <option key={company} value={company}>{company}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer px-4 py-2 text-sm rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-700 transition"
                        >
                            <div className="flex items-center gap-1">
                                <X className="w-4 h-4 text-red-400"/>
                                Tühista
                            </div>
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50 cursor-pointer flex items-center gap-1"
                        >
                            <Check className="w-4 h-4"/>
                            {loading ? 'Salvestamine...' : 'Kinnita'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    )
}
