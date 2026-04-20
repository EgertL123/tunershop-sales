import {useEffect, useState} from 'react';
import {
    User,
    Shield,
    CreditCard,
    Bot,
    Gavel,
    CalendarFold,
    TriangleAlert,
    CircleQuestionMark,
    Edit2,
    Trash2
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner.tsx'
import {supabase} from "../supabaseClient.ts";
import {usePagination} from "../hooks/usePagination.ts";
import Pagination from "../components/Pagination.tsx";
import EditUserDialog from "../components/admin/EditUser.tsx"
import DeleteUserDialog from "../components/admin/DeleteUser.tsx";

type UserData = {
    id: string
    created_at: string
    discord_username: string
    display_name: string
    account_number: string
    rank: string
    is_admin: boolean
}

export default function Admin() {
    const [users, setUsers] = useState<UserData[]>([])
    const [loading, setLoading] = useState(true)
    const [authorized, setAuthorized] = useState<boolean | null>(null)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null)

    const {currentPage, totalPages, currentItems, handlePrevious, handleNext} = usePagination(users, 10)

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const {data: {user}} = await supabase.auth.getUser()
            if (user) {
                const {data} = await supabase
                    .from('users')
                    .select('rank, is_admin')
                    .eq('id', user.id)
                    .single()

                const rank = data?.rank
                const admin = data?.is_admin
                setAuthorized(rank === 'CEO' || admin)
            }
        }
        fetchCurrentUser()
    }, [])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const {data, error} = await supabase
                .from('users')
                .select('id, created_at, discord_username, display_name, account_number, rank, is_admin')
                .order('created_at', {ascending: true})

            if (error) {
                console.error('Error fetching users:', error)
                alert('Kasutajate laadimine ebaõnnestus.')
                return
            }
            setUsers(data || [])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (authorized) fetchUsers()
    }, [authorized])

    if (authorized === null) return <LoadingSpinner/>

    if (!authorized) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-6">
                <div
                    className="rounded-2xl border border-zinc-700/70 shadow-lg bg-zinc-800/60 backdrop-blur-sm p-6 text-center max-w-sm">
                    <TriangleAlert className="w-8 h-8 mx-auto mb-4 text-red-400"/>
                    <p className="text-white font-semibold text-lg mb-1">Ligipääs keelatud</p>
                    <p className="text-white text-sm">Sul ei ole õigust seda lehte vaadata.</p>
                </div>
            </div>
        )
    }

    const handleEdit = (user: UserData) => {
        setSelectedUser(user)
        setEditDialogOpen(true)
    }

    const handleDeleteClick = (user: UserData) => {
        setSelectedUser(user)
        setDeleteDialogOpen(true)
    }

    return (
        <div className="p-6 text-white space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-3xl">Töötajad</h1>
            </div>

            <EditUserDialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                user={selectedUser}
                onSave={fetchUsers}
            />

            <DeleteUserDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                userId={selectedUser?.id ?? null}
                userName={selectedUser?.discord_username ?? null}
                onDelete={() => {
                    setUsers((prev) => prev.filter((s) => s.id !== selectedUser?.id))
                }}
            />

            {loading ? (
            <LoadingSpinner/>
            ) : (
                <>
                    {/* Table */}
                    <div className="rounded-xl border border-zinc-700 overflow-x-auto shadow-lg backdrop-blur-sm">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-900 border-b border-zinc-700">
                            <tr>
                                <th className="px-2 py-2 md:px-6 md:py-4 text-sm font-bold text-zinc-200">
                                    <div className="flex items-center gap-2">
                                        <CalendarFold className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Kasutaja loodud
                                    </div>
                                </th>
                                <th className="px-2 py-2 md:px-6 md:py-4 text-sm font-bold text-zinc-200">
                                    <div className="flex items-center gap-2">
                                        <User className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Töötaja
                                    </div>
                                </th>
                                <th className="px-2 py-2 md:px-6 md:py-4 text-sm font-bold text-zinc-200">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Auaste
                                    </div>
                                </th>
                                <th className="px-2 py-2 md:px-6 md:py-4 text-sm font-bold text-zinc-200">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Kontonumber
                                    </div>
                                </th>
                                <th className="px-2 py-2 md:px-6 md:py-4 text-sm font-bold text-zinc-200">
                                    <div className="flex items-center gap-2">
                                        <CircleQuestionMark className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Admin
                                    </div>
                                </th>
                                <th className="px-2 py-2 md:px-6 md:py-4 text-sm font-bold text-zinc-200">
                                    <div className="flex items-center gap-2">
                                        <Bot className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Discord
                                    </div>
                                </th>
                                <th className="px-2 py-2 md:px-6 md:py-4 text-sm font-bold text-zinc-200">
                                    <div className="flex items-center gap-2">
                                        <Gavel className="w-5 h-5 text-violet-300 shrink-0"/>
                                        Tegevused
                                    </div>
                                </th>
                            </tr>
                            </thead>

                            <tbody>
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan={5}
                                        className="px-6 py-8 text-center bg-zinc-800/60 backdrop-blur-sm text-zinc-300 text-sm">
                                        Info puudub.
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((users) => (
                                    <tr
                                        key={users.id}
                                        className="hover:bg-zinc-800/50 hover:backdrop-blur-sm transition duration-150 bg-zinc-800/60"
                                    >
                                        <td className="px-6 py-4 text-sm text-zinc-400">{new Date(users.created_at).toLocaleString('et-EE')}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-zinc-200">{users.display_name}</td>
                                        <td className="px-6 py-4 text-sm text-violet-300">{users.rank}</td>
                                        <td className="px-6 py-4 text-sm">{users.account_number}</td>
                                        <td className="px-6 py-4 text-sm">{users.is_admin ? 'Jah' : 'Ei'}</td>
                                        <td className="px-6 py-4 text-sm">{users.discord_username}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(users)}
                                                    className="inline-flex items-center p-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer"
                                                >
                                                    <Edit2 className="w-4 h-4"/>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(users)}
                                                    className="inline-flex items-center p-1.5 rounded bg-red-600 hover:bg-red-700 text-white transition cursor-pointer"
                                                >
                                                    <Trash2 className="w-4 h-4"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    {users.length > 0 && (
                        <div className="mt-6">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPrevious={handlePrevious}
                                onNext={handleNext}
                            />
                        </div>
                    )}
                </>
            )
            }
        </div>
    )
}