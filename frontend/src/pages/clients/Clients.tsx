import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Plus, Search, Phone, Mail, MapPin, Calendar, DollarSign, Briefcase } from 'lucide-react';
import { StatCardSkeleton, CardSkeleton } from '../../components/ui';

interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    company?: string;
    address?: string;
    totalJobs: number;
    totalRevenue: number;
    lastJobDate: string;
    status: 'active' | 'inactive';
}

const Clients = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: clients = [], isLoading } = useQuery({
        queryKey: ['clients'],
        queryFn: async () => {
            // Replace with actual API call
            return [
                {
                    id: '1',
                    name: 'Rajesh Kumar',
                    email: 'rajesh@example.com',
                    phone: '+91 98765 43210',
                    company: 'Kumar Events Pvt Ltd',
                    address: 'MG Road, Bangalore',
                    totalJobs: 12,
                    totalRevenue: 450000,
                    lastJobDate: '2026-01-28',
                    status: 'active'
                },
                {
                    id: '2',
                    name: 'Priya Sharma',
                    email: 'priya.sharma@gmail.com',
                    phone: '+91 87654 32109',
                    company: 'Sharma Productions',
                    address: 'Indiranagar, Bangalore',
                    totalJobs: 8,
                    totalRevenue: 320000,
                    lastJobDate: '2026-01-25',
                    status: 'active'
                },
                {
                    id: '3',
                    name: 'Amit Patel',
                    email: 'amit.patel@company.com',
                    phone: '+91 76543 21098',
                    company: 'Patel Weddings',
                    address: 'Whitefield, Bangalore',
                    totalJobs: 15,
                    totalRevenue: 680000,
                    lastJobDate: '2026-01-30',
                    status: 'active'
                }
            ] as Client[];
        }
    });

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0B0E14] p-4 md:p-6 lg:p-8 pb-20 max-w-screen-2xl mx-auto">
            {/* Header */}
            <div className="mb-6 lg:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-2 md:p-3 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-600/30">
                            <Users className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">Client Management</h1>
                            <p className="text-gray-400 text-xs md:text-sm">Manage your client relationships</p>
                        </div>
                    </div>
                    <button
                        onClick={() => console.log('Add client clicked')}
                        className="flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all shadow-lg shadow-purple-600/20 text-xs md:text-sm font-bold"
                    >
                        <Plus className="w-4 h-4 md:w-5 md:h-5" />
                        Add Client
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 lg:mb-8">
                {isLoading ? (
                    <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </>
                ) : (
                    <>
                        <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-4 md:p-5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-400 text-[10px] md:text-xs uppercase font-bold tracking-wider">Total Clients</span>
                                <Users className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                            </div>
                            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white">{clients.length}</div>
                            <div className="text-[9px] md:text-[10px] text-green-400 mt-1">+3 this month</div>
                        </div>
                        <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-4 md:p-5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-400 text-[10px] md:text-xs uppercase font-bold tracking-wider">Active</span>
                                <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                            </div>
                            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                                {clients.filter(c => c.status === 'active').length}
                            </div>
                            <div className="text-[9px] md:text-[10px] text-gray-400 mt-1">Currently active</div>
                        </div>
                        <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-4 md:p-5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-400 text-[10px] md:text-xs uppercase font-bold tracking-wider">Revenue</span>
                                <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
                            </div>
                            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                                ₹{(clients.reduce((sum, c) => sum + (c.totalRevenue || 0), 0) / 100000).toFixed(1)}L
                            </div>
                            <div className="text-[9px] md:text-[10px] text-green-400 mt-1">+12% growth</div>
                        </div>
                        <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-4 md:p-5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-400 text-[10px] md:text-xs uppercase font-bold tracking-wider">Jobs</span>
                                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-orange-400" />
                            </div>
                            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                                {clients.reduce((sum, c) => sum + (c.totalJobs || 0), 0)}
                            </div>
                            <div className="text-[9px] md:text-[10px] text-gray-400 mt-1">All time</div>
                        </div>
                    </>
                )}
            </div>

            {/* Search Bar */}
            <div className="mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-10 bg-[#151A21] border border-[#1F2937] rounded-xl pl-10 pr-4 text-xs text-gray-200 placeholder-gray-500 focus:border-purple-600 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Clients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {isLoading ? (
                    <>
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </>
                ) : (
                    filteredClients.map((client) => (
                        <div
                            key={client.id}
                            className="bg-[#151A21] border border-[#1F2937] rounded-xl p-4 md:p-5 hover:border-purple-600/50 transition-all cursor-pointer group hover:bg-[#1A202A]"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center border border-purple-600/30 flex-shrink-0">
                                        <span className="text-purple-400 font-bold text-lg">
                                            {client.name.charAt(0)}
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-white text-base md:text-lg font-bold group-hover:text-purple-400 transition-colors truncate">
                                            {client.name}
                                        </h3>
                                        {client.company && (
                                            <p className="text-gray-400 text-xs md:text-sm truncate">{client.company}</p>
                                        )}
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${client.status === 'active'
                                    ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                                    : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                                    }`}>
                                    {client.status}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400 truncate">
                                    <Mail className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">{client.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400">
                                    <Phone className="w-4 h-4 flex-shrink-0" />
                                    <span>{client.phone}</span>
                                </div>
                                {client.address && (
                                    <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400 truncate">
                                        <MapPin className="w-4 h-4 flex-shrink-0" />
                                        <span className="truncate">{client.address}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-[#1F2937]">
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div>
                                        <div className="text-sm md:text-base font-bold text-white">{client.totalJobs}</div>
                                        <div className="text-[9px] md:text-[10px] text-gray-500 uppercase font-black tracking-tighter">Jobs</div>
                                    </div>
                                    <div>
                                        <div className="text-sm md:text-base font-bold text-white">
                                            ₹{(client.totalRevenue / 1000).toFixed(0)}K
                                        </div>
                                        <div className="text-[9px] md:text-[10px] text-gray-500 uppercase font-black tracking-tighter">Growth</div>
                                    </div>
                                    <div>
                                        <div className="text-sm md:text-base font-bold text-white">
                                            {new Date(client.lastJobDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </div>
                                        <div className="text-[9px] md:text-[10px] text-gray-500 uppercase font-black tracking-tighter">Last</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {filteredClients.length === 0 && (
                <div className="text-center py-20 bg-[#151A21] rounded-2xl border border-dashed border-[#1F2937]">
                    <Users className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-20" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">No clients found</h3>
                    <p className="text-gray-500 text-sm">Try adjusting your search or add a new client</p>
                </div>
            )}
        </div>
    );
};

export default Clients;
