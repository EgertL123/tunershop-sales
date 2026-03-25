import {useCallback, useEffect, useRef, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {supabase} from '../supabaseClient'
import tunershopLogo from '../assets/images/tunershop-logo.svg'
import {TriangleAlert} from 'lucide-react'

const REQUIRED_GUILD_ID = '863795516743090207'

type DiscordGuild = {
    id: string
    name: string
}

type DiscordRateLimitPayload = {
    message?: string
    retry_after?: number
    global?: boolean
}

function Login() {
    const [checkingMembership, setCheckingMembership] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const navigate = useNavigate()

    const inFlightRef = useRef(false)

    const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

    const fetchGuildsWithRetry = useCallback(
        async (providerToken: string, attemptsLeft = 2): Promise<DiscordGuild[]> => {
            const response = await fetch('https://discord.com/api/v10/users/@me/guilds', {
                headers: {
                    Authorization: `Bearer ${providerToken}`,
                },
            })

            if (response.status === 429) {
                const rateData = (await response.json()) as DiscordRateLimitPayload
                const waitMs = Math.ceil((rateData.retry_after ?? 1) * 1000)

                if (attemptsLeft > 0) {
                    await sleep(waitMs)
                    return fetchGuildsWithRetry(providerToken, attemptsLeft - 1)
                }

                throw new Error(`Discord API 429 after retries: ${JSON.stringify(rateData)}`)
            }

            if (!response.ok) {
                const body = await response.text()
                throw new Error(`Discord API ${response.status}: ${body}`)
            }

            return (await response.json()) as DiscordGuild[]
        },
        [],
    )

    const checkGuildMembership = useCallback(async () => {
        if (inFlightRef.current) return
        inFlightRef.current = true

        setCheckingMembership(true)
        setErrorMessage(null)

        try {
            const {
                data: {session},
            } = await supabase.auth.getSession()

            if (!session) {
                return
            }

            if (!session.provider_token) {
                await supabase.auth.signOut()
                return
            }

            const guilds = await fetchGuildsWithRetry(session.provider_token)
            const isMember = guilds.some((guild) => guild.id === REQUIRED_GUILD_ID)

            if (!isMember) {
                setErrorMessage('Sisse logimiseks pead olema Tunershopi Discordis.')
                await supabase.auth.signOut()
                return
            }

            const {error: upsertError} = await supabase.from('users').upsert(
                {
                    id: session.user.id,
                    discord_username: session.user.user_metadata.full_name ?? null,
                },
                {onConflict: 'id', ignoreDuplicates: true}
            )

            if (upsertError) {
                console.error('Error creating/updating user row:', upsertError)
                setErrorMessage('Could not create your user profile.')
                return
            }

            const {data: profile} = await supabase
                .from('users')
                .select('display_name')
                .eq('id', session.user.id)
                .single()

            navigate(profile?.display_name ? '/dashboard' : '/setup-profile')
        } catch (error) {
            console.error('Error checking Discord guild membership:', error)
            setErrorMessage('Could not verify your Discord server membership. Please try again.')
        } finally {
            inFlightRef.current = false
            setCheckingMembership(false)
        }
    }, [fetchGuildsWithRetry, navigate])

    useEffect(() => {
        const {
            data: {subscription},
        } = supabase.auth.onAuthStateChange((event, session) => {
            if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN') && session) {
                void checkGuildMembership()
            }

            if (event === 'SIGNED_OUT') {
                setErrorMessage(null)
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [checkGuildMembership])

    const handleDiscordLogin = async () => {
        try {
            setErrorMessage(null)

            const {error} = await supabase.auth.signInWithOAuth({
                provider: 'discord',
                options: {
                    scopes: 'identify email guilds',
                    redirectTo: `${window.location.origin}/dashboard`,
                    queryParams: {prompt: 'consent'},
                },
            })

            if (error) {
                throw error
            }
        } catch (error) {
            console.error('Error logging in with Discord:', error)
            setErrorMessage('An error occurred during login. Please try again.')
        }
    }

    return (
        <div className="min-h-screen bg-indigo-950 flex flex-col items-center justify-center p-4">
            <div className="text-center max-w-xl">
                <img src={tunershopLogo} alt="Tunershop Logo" className="w-lg h-lg mx-auto mb-6"/>

                <div className="flex flex-col md:flex-row justify-center items-center text-gray-200 text-lg mb-4 gap-4">
                    <TriangleAlert className="text-orange-300 w-10 h-10 shrink-0"/>
                    <p className="font-[Inter] font-bold text-center md:text-left">Autentimine on võimalik vaid läbi Discordi!</p>
                </div>

                {errorMessage && (
                    <div className="mb-4 rounded-lg bg-red-500/15 border border-red-500/30 p-4 text-red-200">
                        <p>{errorMessage}</p>
                    </div>
                )}

                <button
                    onClick={handleDiscordLogin}
                    disabled={checkingMembership}
                    className="
                        inline-flex justify-center gap-3 px-8 py-4 cursor-pointer
                        bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 disabled:cursor-not-allowed
                        text-white font-bold text-lg
                        rounded-full shadow-lg hover:shadow-[#5865f2]/30
                        transition-all duration-200 ease-in-out transform hover:-translate-y-0.5
                    "
                >
                    <svg
                        role="img"
                        viewBox="0 0 24 24"
                        className="w-7 h-7 fill-white"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.7747-.2662-3.5283-.2662-5.2629 0-.1636-.3847-.4056-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1971.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
                    </svg>
                    {checkingMembership ? 'Checking...' : 'Login with Discord'}
                </button>
            </div>
        </div>
    )
}

export default Login