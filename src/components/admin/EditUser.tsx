import {useEffect, useState} from 'react'
import {X, Edit2, Check} from 'lucide-react'
import {supabase} from '../../supabaseClient.ts'

type Props = {
    open: boolean
    onClose: () => void
    user: {
        id: string
        display_name: string
        account_number: string
        rank: string
        is_admin: boolean
    } | null
    onSave: () => void
}

type UserForm = {
    display_name: string
    account_number: string
    rank: string
}

const RANKS = [
    'Katseajaline',
    'Müügiesindaja',
    'Müügispetsialist',
    'Müügijuht',
    'Raamatupidaja',
    'CEO'
]

export default function EditUserDialog({open, onClose, user, onSave}: Props) {
    const [form, setForm] = useState<UserForm>({
        display_name: '',
        account_number: '',
        rank: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (user) {
            setForm({
                display_name: user.display_name,
                account_number: user.account_number || '',
                rank: user.rank,
            })
            setError(null)
        }
    }, [user])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value, type} = e.target
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }))
    }

    const handleFormSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault()
        handleSubmit()
    }

    const handleSubmit = async () => {
        setError(null)

        if (!form.display_name.trim() || !form.account_number.trim()) {
            setError('Kõik väljad peavad olema täidetud!')
            return
        }

        if (!form.rank) {
            setError('Palun vali auaste!')
            return
        }

        setLoading(true)

        const {error: updateError} = await supabase
            .from('users')
            .update({
                display_name: form.display_name,
                account_number: form.account_number || null,
                rank: form.rank,
            })
            .eq('id', user!.id)

        if (updateError) {
            setError(updateError.message)
            setLoading(false)
            return
        }

        setLoading(false)
        onSave()
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
                <form
                    onSubmit={handleFormSubmit}
                    className={`bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl w-full max-w-md p-6 mx-4 space-y-5 transform transition-all duration-300 ${
                        open
                            ? 'opacity-100 scale-100 translate-y-0'
                            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Edit2 className="w-6 h-6 text-blue-400"/>
                            Muuda kasutajat
                        </div>
                        <button type="button" onClick={onClose}
                                className="text-zinc-400 hover:text-white transition cursor-pointer">
                            <X className="w-5 h-5"/>
                        </button>
                    </div>

                    {/* Fields */}
                    {[
                        {
                            label: 'Nimi',
                            name: 'display_name',
                            placeholder: 'Nimi',
                            type: 'text',
                            maxLength: 70
                        },
                        {
                            label: 'Kontonumber',
                            name: 'account_number',
                            placeholder: 'Kontonumber',
                            type: 'text',
                            maxLength: 50
                        },
                    ].map((field) => (
                        <div key={field.name} className="flex flex-col gap-1">
                            <label className="text-sm text-zinc-400">
                                {field.label} <span className="text-red-400">*</span>
                            </label>
                            <input
                                name={field.name}
                                type={field.type}
                                placeholder={field.placeholder}
                                value={form[field.name as keyof UserForm]}
                                onChange={handleChange}
                                maxLength={field.maxLength}
                                className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                            />
                        </div>
                    ))}

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-zinc-400">
                            Auaste <span className="text-red-400">*</span>
                        </label>
                        <select
                            name="rank"
                            value={form.rank}
                            onChange={handleChange}
                            className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 transition cursor-pointer"
                        >
                            <option value="" disabled>Vali auaste</option>
                            {RANKS.map((rank) => (
                                <option key={rank} value={rank}>{rank}</option>
                            ))}
                        </select>
                    </div>


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
                            className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 cursor-pointer flex items-center gap-1"
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