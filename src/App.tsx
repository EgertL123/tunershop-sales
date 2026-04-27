import {useEffect, useState} from 'react'
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import {supabase} from './supabaseClient'
import {Toaster} from 'react-hot-toast'
import Login from './screens/Login'
import SetupProfile from './screens/SetupProfile'
import Dashboard from './screens/Dashboard'
import Profile from './screens/Profile'
import DashboardLayout from './layouts/DashboardLayout'
import Stock from './screens/Stock'
import SpecialOrders from './screens/SpecialOrders'
import Statistics from './screens/Statistics'
import Salaries from './screens/Salaries'
import Discounts from './screens/Discounts'
import VehiclesList from './screens/VehiclesList'
import Admin from './screens/Admin'

function ProtectedRoute({children}: { children: React.ReactNode }) {
    const [session, setSession] = useState<boolean | null>(null)

    useEffect(() => {
        supabase.auth.getSession().then(({data: {session}}) => {
            setSession(!!session)
        })

        const {data: {subscription}} = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(!!session)
        })

        return () => subscription.unsubscribe()
    }, [])

    if (session === null) return null

    return session ? <>{children}</> : <Navigate to="/" replace/>
}

function App() {
    return (
        <BrowserRouter>
            <Toaster position="top-right"
            reverseOrder={false}
            />
            <Routes>
                <Route path="/" element={<Login/>}/>

                <Route
                    path="/setup-profile"
                    element={
                        <ProtectedRoute>
                            <SetupProfile/>
                        </ProtectedRoute>
                    }
                />

                <Route
                    element={
                        <ProtectedRoute>
                            <DashboardLayout/>
                        </ProtectedRoute>
                    }
                >
                    <Route path="/dashboard" element={<Dashboard/>}/>
                    <Route path="/statistics" element={<Statistics/>}/>
                    <Route path="/salaries" element={<Salaries/>}/>
                    <Route path="/stock" element={<Stock/>}/>
                    <Route path="/special-orders" element={<SpecialOrders/>}/>
                    <Route path="/discounts" element={<Discounts/>}/>
                    <Route path="/vehicles" element={<VehiclesList/>}/>
                    <Route path="/admin" element={<Admin/>}/>
                    <Route path="/profile" element={<Profile/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App
