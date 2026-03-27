import {Outlet} from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import backgroundImage from '../assets/images/background.png'

export default function DashboardLayout() {
    return (
        <div className="min-h-screen flex flex-col md:flex-row"
             style={{
                 backgroundImage: `url(${backgroundImage})`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
             }}
        >
            <Sidebar/>
            <main className="relative flex-1 overflow-auto">
                <div className="absolute inset-0 pointer-events-none"/>
                <div className="relative z-10">
                    <Outlet/>
                </div>
            </main>
        </div>
    )
}