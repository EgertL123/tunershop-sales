import {Outlet} from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function DashboardLayout() {
    return (
        <div className="min-h-screen bg-indigo-950 flex flex-col md:flex-row">
            <Sidebar/>

            <main className="flex-1 overflow-auto">
                <Outlet/>
            </main>
        </div>
    )
}
