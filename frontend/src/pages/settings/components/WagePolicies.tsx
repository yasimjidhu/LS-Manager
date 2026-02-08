import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Plus, Trash2, X, Edit2, Search } from 'lucide-react';
import api from '../../../services/api';
import { Pagination } from '../../../components/ui';
import { inventoryApi } from '../../../services/inventory.service';

interface PieceRate {
    id: string;
    itemId: string;
    ratePerUnit: number;
    item: {
        name: string;
        price: number;
    };
}

interface RoleRate {
    id: string;
    roleName: string;
    wageType: 'DAILY_WAGE' | 'FIXED_JOB_RATE';
    rate: number;
    description?: string;
}

const WagePolicies = () => {
    const queryClient = useQueryClient();
    const [showPieceRateModal, setShowPieceRateModal] = useState(false);
    const [showRoleRateModal, setShowRoleRateModal] = useState(false);
    const [modalMode, setModalMode] = useState<'DAILY' | 'FIXED'>('DAILY');

    // Form States
    const [selectedItem, setSelectedItem] = useState('');
    const [itemRate, setItemRate] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    const [roleName, setRoleName] = useState('');
    const [roleRate, setRoleRate] = useState('');
    const [description, setDescription] = useState('');

    // Pagination States
    const [piecePage, setPiecePage] = useState(1);
    const [rolePage, setRolePage] = useState(1);
    const limit = 10;

    const [pieceSearch, setPieceSearch] = useState('');
    const [roleSearch, setRoleSearch] = useState('');

    // Fetch Data
    const { data: pieceRatesData = { data: [], meta: { total: 0, totalPages: 0 } } } = useQuery({
        queryKey: ['wage-policies', 'piece-rates', piecePage, pieceSearch],
        queryFn: async () => {
            const res = await api.get('/wage-policies/piece-rates', {
                params: { page: piecePage, limit, search: pieceSearch }
            });
            return res.data;
        }
    });

    const { data: roleRatesData = { data: [], meta: { total: 0, totalPages: 0 } } } = useQuery({
        queryKey: ['wage-policies', 'role-rates', rolePage, roleSearch],
        queryFn: async () => {
            const res = await api.get('/wage-policies/role-rates', {
                params: { page: rolePage, limit, search: roleSearch }
            });
            return res.data;
        }
    });

    const pieceRates = pieceRatesData.data;
    const pieceMeta = pieceRatesData.meta;
    const roleRates = roleRatesData.data;
    const roleMeta = roleRatesData.meta;

    const { data: inventoryData } = useQuery({
        queryKey: ['inventory'],
        queryFn: () => inventoryApi.getAll({ limit: 1000 })
    });

    const inventoryItems = inventoryData?.data || [];

    // Mutations
    const createPieceRate = useMutation({
        mutationFn: async () => {
            if (editingId) {
                await api.patch(`/wage-policies/piece-rates/${editingId}`, {
                    ratePerUnit: parseFloat(itemRate)
                });
            } else {
                await api.post('/wage-policies/piece-rates', {
                    itemId: selectedItem,
                    ratePerUnit: parseFloat(itemRate)
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wage-policies', 'piece-rates'] });
            closePieceRateModal();
        }
    });

    const closePieceRateModal = () => {
        setShowPieceRateModal(false);
        setSelectedItem('');
        setItemRate('');
        setEditingId(null);
    };

    const handleEditPieceRate = (rate: PieceRate) => {
        setSelectedItem(rate.itemId);
        setItemRate(rate.ratePerUnit.toString());
        setEditingId(rate.id);
        setShowPieceRateModal(true);
    };

    const deletePieceRate = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/wage-policies/piece-rates/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wage-policies', 'piece-rates'] });
        }
    });

    const createRoleRate = useMutation({
        mutationFn: async () => {
            if (editingId) {
                await api.patch(`/wage-policies/role-rates/${editingId}`, {
                    roleName,
                    wageType: modalMode === 'DAILY' ? 'DAILY_WAGE' : 'FIXED_JOB_RATE',
                    rate: parseFloat(roleRate),
                    description
                });
            } else {
                await api.post('/wage-policies/role-rates', {
                    roleName,
                    wageType: modalMode === 'DAILY' ? 'DAILY_WAGE' : 'FIXED_JOB_RATE',
                    rate: parseFloat(roleRate),
                    description
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wage-policies', 'role-rates'] });
            closeRoleRateModal();
        }
    });

    const closeRoleRateModal = () => {
        setShowRoleRateModal(false);
        setRoleName('');
        setRoleRate('');
        setDescription('');
        setEditingId(null);
    };

    const handleEditRoleRate = (rate: RoleRate) => {
        setRoleName(rate.roleName);
        setRoleRate(rate.rate.toString());
        setDescription(rate.description || '');
        setEditingId(rate.id);
        setShowRoleRateModal(true);
    };

    const deleteRoleRate = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/wage-policies/role-rates/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wage-policies', 'role-rates'] });
        }
    });

    // Filter Role Rates
    const dailyWages = roleRates.filter((r: RoleRate) => r.wageType === 'DAILY_WAGE');
    const fixedJobWages = roleRates.filter((r: RoleRate) => r.wageType === 'FIXED_JOB_RATE');

    return (
        <div className="space-y-6 relative">
            <div>
                <h2 className="text-xl font-bold text-white mb-2">Wage Policies</h2>
                <p className="text-gray-400 text-sm">Configure wage rates for different employee types</p>
            </div>

            {/* Piece Rate Settings */}
            <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Piece Rate</h3>
                        <p className="text-gray-400 text-sm">Rate per item handled</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={pieceSearch}
                                onChange={(e) => {
                                    setPieceSearch(e.target.value);
                                    setPiecePage(1);
                                }}
                                className="bg-[#0B0E14] border border-[#1F2937] text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors w-full md:w-64"
                            />
                        </div>
                        <button
                            onClick={() => setShowPieceRateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" /> Add Item Rate
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#1F2937]">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Item Name</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Item Price</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Piece Rate (₹)</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Percentage</th>
                                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1F2937]">
                            {pieceRates.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-4 text-center text-gray-500 text-sm">No piece rates defined</td>
                                </tr>
                            ) : (
                                pieceRates.map((item: PieceRate) => (
                                    <tr key={item.id} className="hover:bg-[#1F2937]/30 transition-colors">
                                        <td className="py-3 px-4 text-white">{item.item.name}</td>
                                        <td className="py-3 px-4 text-gray-400">₹{item.item.price}</td>
                                        <td className="py-3 px-4 text-green-400 font-mono font-semibold">₹{item.ratePerUnit}</td>
                                        <td className="py-3 px-4 text-blue-400 text-sm">
                                            {item.item.price > 0 ? ((item.ratePerUnit / item.item.price) * 100).toFixed(1) : 0}%
                                        </td>
                                        <td className="py-3 px-4 text-right flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEditPieceRate(item)}
                                                className="p-1.5 hover:bg-blue-500/10 text-blue-400 rounded transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deletePieceRate.mutate(item.id)}
                                                className="p-1.5 hover:bg-red-500/10 text-red-400 rounded transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex justify-center">
                    <Pagination
                        currentPage={piecePage}
                        totalPages={pieceMeta.totalPages}
                        onPageChange={setPiecePage}
                    />
                </div>
            </div>

            {/* Daily Wage Settings */}
            <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Role Rates</h3>
                        <p className="text-gray-400 text-sm">Rate per role/wage type</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search roles..."
                                value={roleSearch}
                                onChange={(e) => {
                                    setRoleSearch(e.target.value);
                                    setRolePage(1);
                                }}
                                className="bg-[#0B0E14] border border-[#1F2937] text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors w-full md:w-64"
                            />
                        </div>
                        <button
                            onClick={() => {
                                setModalMode('DAILY');
                                setEditingId(null);
                                setShowRoleRateModal(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" /> Add Role Rate
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#1F2937]">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Role</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Rate (₹)</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Description</th>
                                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1F2937]">
                            {dailyWages.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-4 text-center text-gray-500 text-sm">No daily wages defined</td>
                                </tr>
                            ) : (
                                dailyWages.map((item: RoleRate) => (
                                    <tr key={item.id} className="hover:bg-[#1F2937]/30 transition-colors">
                                        <td className="py-3 px-4 text-white">{item.roleName}</td>
                                        <td className="py-3 px-4 text-green-400 font-mono font-semibold">₹{item.rate}</td>
                                        <td className="py-3 px-4 text-gray-400 text-sm">{item.description || '-'}</td>
                                        <td className="py-3 px-4 text-right">

                                            <button
                                                onClick={() => handleEditRoleRate(item)}
                                                className="p-1.5 hover:bg-blue-500/10 text-blue-400 rounded transition-colors mr-2"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteRoleRate.mutate(item.id)}
                                                className="p-1.5 hover:bg-red-500/10 text-red-400 rounded transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div >

            {/* Fixed Job Wage Settings */}
            < div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6" >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Fixed Job Wage</h3>
                        <p className="text-gray-400 text-sm">Fixed rate per event/job</p>
                    </div>
                    <button
                        onClick={() => {
                            setModalMode('FIXED');
                            setEditingId(null);
                            setShowRoleRateModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Role Rate
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#1F2937]">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Role</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Rate (₹)</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Description</th>
                                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1F2937]">
                            {fixedJobWages.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-4 text-center text-gray-500 text-sm">No fixed wages defined</td>
                                </tr>
                            ) : (
                                fixedJobWages.map((item: RoleRate) => (
                                    <tr key={item.id} className="hover:bg-[#1F2937]/30 transition-colors">
                                        <td className="py-3 px-4 text-white">{item.roleName}</td>
                                        <td className="py-3 px-4 text-green-400 font-mono font-semibold">₹{item.rate}</td>
                                        <td className="py-3 px-4 text-gray-400 text-sm">{item.description || '-'}</td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                onClick={() => handleEditRoleRate(item)}
                                                className="p-1.5 hover:bg-blue-500/10 text-blue-400 rounded transition-colors mr-2"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteRoleRate.mutate(item.id)}
                                                className="p-1.5 hover:bg-red-500/10 text-red-400 rounded transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex justify-center">
                    <Pagination
                        currentPage={rolePage}
                        totalPages={roleMeta.totalPages}
                        onPageChange={setRolePage}
                    />
                </div>
            </div >

            {/* Info Box */}
            < div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4" >
                <div className="flex gap-3">
                    <DollarSign className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-blue-400 font-semibold mb-1">How Wage Calculation Works</h4>
                        <ul className="text-gray-300 text-sm space-y-1">
                            <li>• <strong>Piece Rate:</strong> Calculated based on items handled (e.g., 100 LED lights × ₹5 = ₹500)</li>
                            <li>• <strong>Daily Wage:</strong> Calculated based on days worked (e.g., 1 day × ₹800 = ₹800)</li>
                            <li>• <strong>Fixed Job:</strong> Fixed amount per job regardless of duration (e.g., ₹500 per event)</li>
                        </ul>
                    </div>
                </div>
            </div >

            {/* Modals */}
            {
                showPieceRateModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
                        <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6 w-full max-w-md">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-white">{editingId ? 'Edit' : 'Add'} Item Piece Rate</h3>
                                <button onClick={closePieceRateModal} className="text-gray-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Select Item</label>
                                    <select
                                        value={selectedItem}
                                        onChange={(e) => setSelectedItem(e.target.value)}
                                        disabled={!!editingId}
                                        className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                                    >
                                        <option value="">Select an item...</option>
                                        {inventoryItems.map((item: any) => (
                                            <option key={item.id} value={item.id}>{item.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Rate per Unit (₹)</label>
                                    <input
                                        type="number"
                                        value={itemRate}
                                        onChange={(e) => setItemRate(e.target.value)}
                                        className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                        placeholder="0.00"
                                    />
                                </div>
                                <button
                                    onClick={() => createPieceRate.mutate()}
                                    disabled={!selectedItem || !itemRate || createPieceRate.isPending}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {createPieceRate.isPending ? 'Saving...' : 'Save Rate'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showRoleRateModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
                        <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6 w-full max-w-md">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-white">
                                    {editingId ? 'Edit' : 'Add'} {modalMode === 'DAILY' ? 'Daily Wage' : 'Fixed Job Wage'}
                                </h3>
                                <button onClick={closeRoleRateModal} className="text-gray-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Role Name</label>
                                    <input
                                        type="text"
                                        value={roleName}
                                        onChange={(e) => setRoleName(e.target.value)}
                                        className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                        placeholder="e.g. Helper, Driver"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Rate (₹)</label>
                                    <input
                                        type="number"
                                        value={roleRate}
                                        onChange={(e) => setRoleRate(e.target.value)}
                                        className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Description (Optional)</label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                        placeholder="Additional notes"
                                    />
                                </div>
                                <button
                                    onClick={() => createRoleRate.mutate()}
                                    disabled={!roleName || !roleRate || createRoleRate.isPending}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {createRoleRate.isPending ? 'Saving...' : 'Save Rate'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default WagePolicies;
