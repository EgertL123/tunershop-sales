import {useState} from 'react'
import {X, CirclePlus, Check} from 'lucide-react'
import {supabase} from '../../supabaseClient.ts'

type Props = {
    open: boolean
    onClose: () => void
}

type SaleForm = {
    vehicle_name: string
    price: string
    plate: string
    buyer_name: string
    sale_class: string
}

const defaultForm: SaleForm = {
    vehicle_name: '',
    price: '',
    plate: '',
    buyer_name: '',
    sale_class: '',
}

export default function AddSaleDialog({open, onClose}: Props) {
    const [form, setForm] = useState<SaleForm>(defaultForm)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({...prev, [e.target.name]: e.target.value}))
    }

    const handleFormSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault()
        handleSubmit()
    }

    const handleSubmit = async () => {
        setError(null)

        const priceNum = Number(form.price)

        if (!form.vehicle_name.trim() || !form.price || !form.plate.trim() || !form.buyer_name.trim()) {
            setError('Kõik väljad peavad olema täidetud!')
            return
        }

        if (priceNum <= 0) {
            setError('Hind ei saa olla null või negatiivne.')
            return
        }

        if (form.price.length > 7) {
            setError('Hind ei saa olla pikem kui 7 numbrit.');
            return
        } else if (!form.sale_class) {
            setError('Palun vali klass!')
            return
        }

        setLoading(true)

        const {data: {user}} = await supabase.auth.getUser()
        if (!user) {
            setError('Kasutaja ei ole sisse logitud.')
            setLoading(false)
            return
        }

        const {data: userData} = await supabase
            .from('users')
            .select('rank')
            .eq('id', user.id)
            .single()

        const {error: insertError} = await supabase.from('sales').insert({
            vehicle_name: form.vehicle_name,
            price: Number(form.price),
            plate: form.plate,
            buyer_name: form.buyer_name,
            user_id: user.id,
            sale_class: form.sale_class,
            seller_rank: userData?.rank ?? 'Katseajaline',
        })

        if (insertError) {
            setError(insertError.message)
            setLoading(false)
            return
        }

        setForm(defaultForm)
        setLoading(false)
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
                    className={`bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl w-full max-w-md mx-4 p-6 transform transition-all duration-300 max-h-[90vh] overflow-y-auto ${
                        open
                            ? 'opacity-100 scale-100 translate-y-0'
                            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between my-2">
                        <div className="flex items-center gap-2">
                            <CirclePlus className="w-6 h-6 text-emerald-400"/>
                            Lisa uus müük
                        </div>
                        <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white transition cursor-pointer">                            <X className="w-5 h-5"/>
                        </button>
                    </div>

                    {/* Fields */}
                    {[
                        {
                            label: 'Sõiduki nimi',
                            name: 'vehicle_name',
                            placeholder: 'Sõiduki nimi',
                            type: 'text',
                            maxLength: 70
                        },
                        {label: 'Hind', name: 'price', placeholder: 'Hind', type: 'number', maxLength: 8},
                        {label: 'Numbrimärk', name: 'plate', placeholder: 'Numbrimärk', type: 'text', maxLength: 8},
                        {label: 'Ostja', name: 'buyer_name', placeholder: 'Ostja', type: 'text', maxLength: 70},
                    ].map((field) => (
                        <div key={field.name} className="flex flex-col gap-1 my-4">
                            <label className="text-sm text-zinc-400">
                                {field.label} <span className="text-red-400">*</span>
                            </label>
                            <input
                                name={field.name}
                                type={field.type}
                                placeholder={field.placeholder}
                                value={form[field.name as keyof SaleForm]}
                                onChange={handleChange}
                                maxLength={field.maxLength}
                                className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                            />
                            {/* Render class dropdown right after vehicle_name */}
                            {field.name === 'vehicle_name' && (
                                <div className="flex flex-col gap-1 mt-1">
                                    <label className="text-sm text-zinc-400">
                                        Klass <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        name="sale_class"
                                        value={form.sale_class}
                                        onChange={(e) => setForm((prev) => ({...prev, sale_class: e.target.value}))}
                                        className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 transition cursor-pointer"
                                    >
                                        <option value="" disabled>Vali klass</option>
                                        <option value="X">X</option>
                                        <option value="S">S</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                        <option value="D">D</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    ))}

                    {error && <p className="text-sm text-red-400">{error}</p>}

                    <div className="flex justify-end gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer px-4 py-2 text-sm rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-700 transition"
                        >
                            <div className="flex items-center gap-1 cursor-pointer">
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
