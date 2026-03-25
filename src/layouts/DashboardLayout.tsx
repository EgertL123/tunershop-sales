import {Outlet} from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import backgroundImage from '../assets/images/background.png'

export default function DashboardLayout() {
    return (
        <div
            className="min-h-screen flex flex-col md:flex-row"
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="absolute inset-0 bg-black/30 pointer-events-none md:hidden"></div>
            <Sidebar/>

            <main className="relative z-10 flex-1 overflow-auto">
                <Outlet/>
            </main>
        </div>
    )
}
