import {useEffect, useState} from 'react'
import {NavLink, Link} from 'react-router-dom'
import tunershopLogo from '../assets/images/tunershop-logo.svg'
import {House, Warehouse, Banknote, TrendingUp, User, Gem, Menu, X} from 'lucide-react'
import {supabase} from "../supabaseClient.ts";

export default function Sidebar() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [isPayrollAuthorized, setIsPayrollAuthorized] = useState(false)

    useEffect(() => {
        // Check if user has payroll access
        const fetchUser = async () => {
            const {data: {user}} = await supabase.auth.getUser()
            if (user) {
                const {data} = await supabase
                    .from('users')
                    .select('rank, is_admin')
                    .eq('id', user.id)
                    .single()
                setIsPayrollAuthorized(
                    data?.rank === 'Raamatupidaja' ||
                    data?.rank === 'CEO' ||
                    data?.is_admin === true
                )
            }
        }
        fetchUser()
    }, []);

    const linkClass = ({isActive}: { isActive: boolean }) =>
        `flex items-center rounded-lg px-4 py-2 transition ${
            isActive
                ? 'bg-zinc-700 text-white'
                : 'text-white hover:bg-zinc-700'
        }`

    const navLinks = (
        <>
            <nav className="flex-1 space-y-2">
                <NavLink to="/dashboard" className={linkClass} onClick={() => setMobileOpen(false)}>
                    <House className=" mr-2"/>
                    Avaleht
                </NavLink>
                <NavLink to="/statistics" className={linkClass} onClick={() => setMobileOpen(false)}>
                    <TrendingUp className=" mr-2"/>
                    Statistika
                </NavLink>
                <NavLink to="/stock" className={linkClass} onClick={() => setMobileOpen(false)}>
                    <Warehouse className=" mr-2"/>
                    Limiidid
                </NavLink>
                <NavLink to="/special-orders" className={linkClass} onClick={() => setMobileOpen(false)}>
                    <Gem className=" mr-2"/>
                    Eritellimused
                </NavLink>
                {isPayrollAuthorized && (
                    <NavLink to="/salaries" className={linkClass} onClick={() => setMobileOpen(false)}>
                        <Banknote className=" mr-2"/>
                        Palgad
                    </NavLink>
                )}
            </nav>
            <nav>
                <NavLink to="/profile" className={linkClass} onClick={() => setMobileOpen(false)}>
                    <User className=" mr-2"/>
                    Profiil
                </NavLink>
            </nav>
        </>
    )

    return (
        <>
            {/* Mobile top bar */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 bg-zinc-600 backdrop-blur-sm">
                <button
                    onClick={() => setMobileOpen(true)}
                    className="text-white cursor-pointer"
                >
                    <Menu className="w-6 h-6"/>
                </button>
            </div>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile drawer */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-zinc-600 border-r border-zinc-500 p-4 flex flex-col z-50 transform transition-transform duration-300 md:hidden ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="flex items-center justify-end mb-6">
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="text-white cursor-pointer"
                    >
                        <X className="w-5 h-5"/>
                    </button>
                </div>
                {navLinks}
            </div>

            {/* Desktop sidebar */}
            <aside
                className="hidden md:flex w-64 min-h-screen bg-zinc-600 border-r border-zinc-500 p-4 flex-col sticky top-0">
                <Link to="/dashboard">
                    <img src={tunershopLogo} alt="Tunershop Logo" className="w-lg h-lg mx-auto mb-6"/>
                </Link>
                {navLinks}
            </aside>
        </>
    )
}