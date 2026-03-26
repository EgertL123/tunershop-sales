import {useEffect, useMemo, useState} from 'react'
import {supabase} from '../supabaseClient'
import {User, Shield, BadgeCheck, BadgeAlert, Bot, CreditCard} from 'lucide-react'
import InfoCard from '../components/InfoCard'
import LoadingSpinner from '../components/LoadingSpinner'

type UserProfile = {
    id: string
    display_name: string | null
    discord_username: string | null
    rank: string | null
    account_number: string | null
}

export default function Profile() {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true)
            setErrorMessage(null)

            try {
                const {
                    data: {user},
                    error: userError,
                } = await supabase.auth.getUser()

                if (userError) throw userError
                if (!user) {
                    setErrorMessage('You are not logged in.')
                    return
                }

                const {data, error} = await supabase
                    .from('users')
                    .select('id, display_name, discord_username, account_number, rank')
                    .eq('id', user.id)
                    .maybeSingle()

                if (error) throw error
                setProfile(data ?? null)
            } catch (err) {
                console.error('Error loading profile:', err)
                setErrorMessage('Could not load your profile.')
            } finally {
                setLoading(false)
            }
        }

        void loadProfile()
    }, [])

    const initials = useMemo(() => {
        const source = profile?.display_name || profile?.discord_username || 'User'
        return source
            .split(' ')
            .map((part) => part[0]?.toUpperCase() ?? '')
            .join('')
            .slice(0, 2)
    }, [profile?.display_name, profile?.discord_username])

    if (loading) {
        return <LoadingSpinner/>
    }

    if (errorMessage) {
        return (
            <div className="min-h-[60vh] p-6">
                <div className="mx-auto w-full max-w-2xl rounded-2xl border border-red-400/30 bg-red-500/10 p-5">
                    <p className="text-red-200">{errorMessage}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[60vh] p-6 text-white">
            <div className="mx-auto w-full max-w-4xl space-y-6">
                <header className="rounded-2xl border border-zinc-700/70 bg-zinc-800/70 p-6 shadow-xl backdrop-blur">
                    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                        <div
                            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/20 text-xl font-bold text-indigo-300 ring-1 ring-indigo-400/40">
                            {initials || 'U'}
                        </div>

                        <div className="space-y-1">
                            <h1 className="text-2xl font-semibold tracking-tight">Kasutaja profiil</h1>
                            <div className="flex items-center gap-2">
                                <BadgeAlert className="h-6 w-6 shrink-0 text-red-400"/>
                                <p>Andmete muutmiseks pead adminiga kontakteeruma.</p>
                            </div>
                        </div>

                        <div className="sm:ml-auto">
              <span
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                <BadgeCheck size={14}/>
                Oled Discordiga sisse logitud
              </span>
                        </div>
                    </div>
                </header>

                <section className="grid gap-4 md:grid-cols-2">
                    <InfoCard
                        icon={<User size={18}/>}
                        label="Karakteri nimi"
                        value={profile?.display_name ?? '-'}
                    />
                    <InfoCard
                        icon={<Shield size={18}/>}
                        label="Auaste"
                        value={profile?.rank ?? '-'}
                    />
                    <InfoCard
                        icon={<CreditCard size={18}/>}
                        label="Kontonumber"
                        value={profile?.account_number ?? '-'}
                    />
                    <InfoCard
                        icon={<Bot size={18}/>}
                        label="Discord"
                        value={profile?.discord_username ?? '-'}
                    />
                </section>
            </div>
        </div>
    )
}
