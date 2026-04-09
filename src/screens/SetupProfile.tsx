import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {supabase} from '../supabaseClient'
import tunershopLogo from '../assets/images/tunershop-logo.svg'
import loginBackground from '../assets/images/login-background.webp'

function SetupProfile() {
    const [displayName, setDisplayName] = useState('')
    const [accountNumber, setAccountNumber] = useState('')
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const navigate = useNavigate()

    const handleSubmit = async () => {
        const trimmedName = displayName.trim()
        const trimmedAccountNumber = accountNumber.trim()

        if (!trimmedName) {
            setErrorMessage('Karakteri nimi ei saa tühi olla.')
            return
        } else if (!trimmedAccountNumber) {
            setErrorMessage('Kontonumber nimi ei saa tühi olla.')
            return
        } else if (!/^\d+$/.test(trimmedAccountNumber)) {
            setErrorMessage('Kontonumber tohib sisaldada ainult numbreid.')
            return
        } else if (Number(trimmedAccountNumber) <= 0) {
            setErrorMessage('Kontonumber ei saa olla null või negatiivne.')
            return
        }

        setLoading(true)
        setErrorMessage(null)

        try {
            const {data: {session}} = await supabase.auth.getSession()

            if (!session) {
                navigate('/')
                return
            }

            const {error} = await supabase
                .from('users')
                .upsert(
                    {
                        id: session.user.id,
                        discord_username: session.user.user_metadata.full_name ?? null,
                        display_name: trimmedName,
                        account_number: trimmedAccountNumber,
                    },
                    {onConflict: 'id'}
                )

            if (error) throw error

            navigate('/dashboard')
        } catch (error) {
            console.error('Error saving display name:', error)
            setErrorMessage('Karakteri nime salvestamine ebaõnnestus. Palun proovi uuesti.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen  flex flex-col items-center justify-center p-4"
             style={{
                 backgroundImage: `url(${loginBackground})`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
             }}>
            <div className="text-center max-w-xl w-full">
                <img src={tunershopLogo} alt="Tunershop Logo" className="w-lg h-lg mx-auto mb-6"/>

                {errorMessage && (
                    <div
                        className="mb-4 rounded-lg bg-red-500/40 border border-red-500 backdrop-blur-sm p-4 text-red-200">
                        <p>{errorMessage}</p>
                    </div>
                )}

                <h1 className="text-white text-2xl font-bold font-[Inter] mb-2">Sisesta enda karakteri nimi</h1>

                <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="Karakteri nimi"
                    maxLength={75}
                    className="
                        w-full px-5 py-3 mb-4
                        bg-zinc-800/60 border backdrop-blur-sm border-white/20 rounded-full
                        text-white placeholder-zinc-300 text-lg
                        focus:outline-none focus:border-indigo-400
                        transition-colors duration-200
                    "
                />

                <h1 className="text-white text-2xl font-bold font-[Inter] mb-2">Sisesta enda kontonumber</h1>

                <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="Kontonumber"
                    maxLength={9}
                    className="
                        w-full px-5 py-3 mb-4
                        bg-zinc-800/60 backdrop-blur-sm border border-white/20 rounded-full
                        text-white placeholder-zinc-300 text-lg
                        focus:outline-none focus:border-indigo-400
                        transition-colors duration-200
                    "
                />

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="
                        px-16 py-4 cursor-pointer
                        bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed
                        text-white font-bold text-lg
                        rounded-full shadow-lg
                        transition-all duration-200 ease-in-out transform hover:-translate-y-0.5
                    "
                >
                    {loading ? 'Salvestan...' : 'Edasi'}
                </button>
            </div>
        </div>
    )
}

export default SetupProfile