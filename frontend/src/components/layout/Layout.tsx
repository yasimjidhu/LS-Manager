import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
    return (
        <div className="min-h-screen bg-[#0B0E14] text-gray-100 font-sans">
            <Sidebar />
            <Navbar />
            <div className="pl-24 pr-8 pt-24 pb-8 min-h-screen">
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
