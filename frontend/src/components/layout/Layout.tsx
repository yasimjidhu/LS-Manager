import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#0B0E14] text-gray-100 font-sans">
            <Sidebar
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
            />
            <Navbar
                toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
            {/* Main Content Area */}
            <main className="lg:pl-16 px-4 md:px-6 pt-20 pb-8 min-h-screen transition-all duration-300">
                <div className="max-w-[1600px] mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
