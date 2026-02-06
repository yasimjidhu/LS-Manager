import { Search, Plus, Filter, PenSquare, History, Box, ChevronDown, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { inventoryApi, type InventoryItem } from '../../services/inventory.service';

const InventoryCard = ({ item, readOnly, onEdit, onDelete, onHistory }: { item: InventoryItem; readOnly?: boolean; onEdit: (item: InventoryItem) => void; onDelete: (id: string) => void; onHistory: (id: string) => void }) => {
    return (
        <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl p-4 group hover:border-gray-600 transition-all flex flex-col h-full relative overflow-hidden">
            {/* Status Badge - Now shows Availability */}
            <div className="absolute top-4 right-4 z-10">
                {(() => {
                    const available = item.quantity - (item.checkedOutQuantity || 0);
                    const isFullyAvailable = available === item.quantity;
                    const isPartiallyAvailable = available > 0 && available < item.quantity;

                    return (
                        <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 backdrop-blur-md transition-all",
                            isFullyAvailable ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                isPartiallyAvailable ? "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-lg shadow-amber-500/5" :
                                    "bg-red-500/10 text-red-400 border-red-500/20"
                        )}>
                            <span className={cn("w-1.5 h-1.5 rounded-full bg-current animate-pulse")}></span>
                            {available}/{item.quantity} AVAILABLE
                        </span>
                    );
                })()}
            </div>

            {/* Image Placeholder */}
            <div className="h-40 bg-[#0B0E14] rounded-xl mb-4 flex items-center justify-center relative group-hover:bg-[#111419] transition-colors">
                <Box className={cn("w-12 h-12 opacity-20 transition-transform duration-500 group-hover:scale-110",
                    item.category?.name === 'Lighting' ? "text-cyan-400" :
                        item.category?.name === 'Audio' ? "text-purple-400" :
                            item.category?.name === 'Rigging' ? "text-amber-400" :
                                "text-gray-400"
                )} />
            </div>

            {/* Content */}
            <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-white font-semibold text-lg">{item.name}</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description || 'No description'}</p>

                <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-500 mb-6">
                    <div>Asset ID: <span className="text-gray-300 block">{item.qrCode}</span></div>
                    <div className="text-right">Category: <span className="text-gray-300 block">{item.category?.name}</span></div>
                    <div>Availability: <span className="text-gray-300 block">{item.quantity - (item.checkedOutQuantity || 0)} / {item.quantity} available</span></div>
                    <div className="text-right">Price: <span className="text-gray-300 block">${item.price}</span></div>
                </div>
            </div>

            {/* Actions */}
            {!readOnly && (
                <div className="grid grid-cols-2 gap-3 mt-auto">
                    <button
                        onClick={() => onEdit(item)}
                        className="flex items-center justify-center gap-2 py-2 rounded-lg bg-[#1F2937] hover:bg-[#374151] text-gray-300 text-xs font-medium transition-colors"
                    >
                        <PenSquare className="w-3.5 h-3.5" /> Edit
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onHistory(item.id)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-[#1F2937] hover:bg-[#374151] text-gray-300 text-xs font-medium transition-colors"
                        >
                            <History className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this item?')) {
                                    onDelete(item.id);
                                }
                            }}
                            className="flex items-center justify-center px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-medium transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}
            {readOnly && (
                <div className="mt-auto">
                    <button
                        onClick={() => onHistory(item.id)}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#1F2937] hover:bg-[#374151] text-gray-300 text-xs font-medium transition-colors"
                    >
                        <History className="w-3.5 h-3.5" /> View History
                    </button>
                </div>
            )}
        </div>
    );
};

const CreateItemModal = ({ isOpen, onClose, itemToEdit }: { isOpen: boolean; onClose: () => void; itemToEdit?: InventoryItem | null }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        quantity: 1,
        price: 0,
        categoryId: '',
        status: 'AVAILABLE'
    });

    useEffect(() => {
        if (itemToEdit) {
            setFormData({
                name: itemToEdit.name,
                description: itemToEdit.description || '',
                quantity: itemToEdit.quantity,
                price: parseFloat(String(itemToEdit.price)),
                categoryId: itemToEdit.categoryId,
                status: itemToEdit.status
            });
        } else {
            setFormData({ name: '', description: '', quantity: 1, price: 0, categoryId: '', status: 'AVAILABLE' });
        }
    }, [itemToEdit, isOpen]);

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: inventoryApi.getCategories
    });

    const mutation = useMutation({
        mutationFn: (data: any) => {
            if (itemToEdit) {
                return inventoryApi.update(itemToEdit.id, data);
            }
            return inventoryApi.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            onClose();
            if (!itemToEdit) {
                setFormData({ name: '', description: '', quantity: 1, price: 0, categoryId: '', status: 'AVAILABLE' });
            }
        }
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">{itemToEdit ? 'Edit Equipment' : 'Add New Equipment'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Item Name</label>
                        <input
                            type="text"
                            className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Category</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none appearance-none"
                                    value={formData.categoryId}
                                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                >
                                    <option value="">Select Category</option>
                                    {categories?.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Status</label>
                            <div className="relative">
                                <select
                                    className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none appearance-none"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="AVAILABLE">Available</option>
                                    <option value="IN_USE">In Use</option>
                                    <option value="MAINTENANCE">Maintenance</option>
                                    <option value="DAMAGED">Damaged</option>
                                    <option value="RETIRED">Retired</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Quantity</label>
                            <input
                                type="number"
                                className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none"
                                value={formData.quantity}
                                onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Daily Rate ($)</label>
                            <input
                                type="number"
                                className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Description (Optional)</label>
                        <textarea
                            rows={3}
                            className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 bg-[#1F2937] hover:bg-[#374151] text-gray-300 font-medium rounded-xl transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={() => mutation.mutate(formData as any)}
                        disabled={mutation.isPending}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
                    >
                        {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        {itemToEdit ? 'Update Item' : 'Create Item'}
                    </button>
                </div>
            </div>
        </div>
    );
}

const CreateCategoryModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    const createMutation = useMutation({
        mutationFn: inventoryApi.createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            onClose();
            setFormData({ name: '', description: '' });
        }
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Add New Category</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Category Name</label>
                        <input
                            type="text"
                            placeholder="e.g., Lighting, Audio, Video"
                            className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Description (Optional)</label>
                        <textarea
                            rows={3}
                            placeholder="Brief description of this category"
                            className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-[#1F2937] hover:bg-[#374151] text-gray-300 font-medium rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => createMutation.mutate(formData as any)}
                        disabled={createMutation.isPending || !formData.name}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        Create Category
                    </button>
                </div>
            </div>
        </div>
    );
}

const HistoryModal = ({ isOpen, onClose, itemId }: { isOpen: boolean; onClose: () => void; itemId: string | null }) => {
    const { data: logs, isLoading } = useQuery({
        queryKey: ['maintenanceHistory', itemId],
        queryFn: () => itemId ? inventoryApi.getMaintenanceHistory(itemId) : Promise.resolve([]),
        enabled: !!itemId
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl w-full max-w-2xl p-6 animate-in zoom-in-95 duration-200 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <History className="w-5 h-5 text-blue-500" />
                        Maintenance History
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>

                {isLoading ? (
                    <div className="text-center py-10 text-gray-500">Loading history...</div>
                ) : logs?.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">No maintenance history found.</div>
                ) : (
                    <div className="space-y-4">
                        {logs?.map((log: any) => (
                            <div key={log.id} className="bg-[#0B0E14] border border-[#1F2937] rounded-xl p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-white font-medium">{log.description}</h3>
                                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300",
                                        log.status === 'MAINTENANCE' && "bg-amber-500/10 text-amber-500",
                                        log.status === 'AVAILABLE' && "bg-emerald-500/10 text-emerald-500"
                                    )}>
                                        {log.status}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Cost: ${log.cost}</span>
                                    <span>Reported by: {log.reportedBy?.email}</span>
                                    <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};


const Inventory = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const queryClient = useQueryClient();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [historyItem, setHistoryItem] = useState<string | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const { data: inventoryData, isLoading } = useQuery({
        queryKey: ['inventory', selectedCategory, search, page],
        queryFn: () => inventoryApi.getAll({
            search,
            categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
            page,
            limit: 12
        })
    });

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [selectedCategory, search]);

    const inventory = inventoryData?.data;
    const meta = inventoryData?.meta;

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: inventoryApi.getCategories
    });

    const deleteMutation = useMutation({
        mutationFn: inventoryApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
        }
    });

    const handleEdit = (item: InventoryItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id);
    };

    const handleHistory = (id: string) => {
        setHistoryItem(id);
        setIsHistoryOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <CreateItemModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                itemToEdit={editingItem}
            />
            <CreateCategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} />
            <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} itemId={historyItem} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Inventory Management</h1>
                    <p className="text-gray-400">Manage and track all your equipment</p>
                </div>
                {user?.role !== 'EMPLOYEE' && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="bg-[#1F2937] hover:bg-[#374151] text-gray-300 px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all border border-[#374151]"
                        >
                            <Plus className="w-4 h-4" /> Add Category
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
                        >
                            <Plus className="w-5 h-5" /> Add Equipment
                        </button>
                    </div>
                )}
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search equipment by name, ID, or category..."
                        className="w-full h-12 bg-[#151A21] border border-[#1F2937] rounded-xl pl-12 pr-4 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 items-center overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={cn(
                            "px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors",
                            selectedCategory === 'all'
                                ? "bg-blue-600 text-white"
                                : "bg-[#151A21] text-gray-400 border border-[#1F2937] hover:bg-[#1F2937] hover:text-white"
                        )}
                    >
                        All
                    </button>
                    {categories?.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={cn(
                                "px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors",
                                selectedCategory === cat.id
                                    ? "bg-blue-600 text-white"
                                    : "bg-[#151A21] text-gray-400 border border-[#1F2937] hover:bg-[#1F2937] hover:text-white"
                            )}
                        >
                            {cat.name}
                        </button>
                    ))}

                    <div className="w-px h-8 bg-[#1F2937] mx-2"></div>

                    <button className="px-4 py-2.5 bg-[#151A21] border border-[#1F2937] rounded-xl text-sm font-medium text-gray-300 hover:text-white flex items-center gap-2">
                        All Status <ChevronDown className="w-4 h-4" />
                    </button>
                    <button className="p-2.5 bg-[#151A21] border border-[#1F2937] rounded-xl text-gray-400 hover:text-white">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="text-center py-20 text-gray-500">Loading inventory...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {inventory?.map(item => (
                        <InventoryCard
                            key={item.id}
                            item={item}
                            readOnly={user?.role === 'EMPLOYEE'}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onHistory={handleHistory}
                        />
                    ))}

                    {/* Add New Placeholder Card */}
                    {user?.role !== 'EMPLOYEE' && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="border-2 border-dashed border-[#1F2937] rounded-2xl p-6 flex flex-col items-center justify-center text-gray-500 hover:text-blue-500 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group min-h-[320px]"
                        >
                            <div className="p-4 rounded-full bg-[#151A21] group-hover:bg-blue-500/20 mb-4 transition-colors">
                                <Plus className="w-8 h-8" />
                            </div>
                            <h3 className="text-white font-semibold mb-1">Add Equipment</h3>
                            <p className="text-gray-500 text-sm">Add a new item to inventory</p>
                        </button>
                    )}
                </div>
            )}

            {/* Pagination Controls */}
            {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-[#1F2937] pt-6">
                    <div className="text-sm text-gray-400">
                        Showing <span className="text-white font-medium">{(meta.page - 1) * meta.limit + 1}</span> to <span className="text-white font-medium">{Math.min(meta.page * meta.limit, meta.total)}</span> of <span className="text-white font-medium">{meta.total}</span> results
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg bg-[#151A21] border border-[#1F2937] text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-1 px-4 text-sm font-medium text-gray-300 bg-[#151A21] border border-[#1F2937] rounded-lg">
                            Page {page} of {meta.totalPages}
                        </div>
                        <button
                            onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                            disabled={page === meta.totalPages}
                            className="p-2 rounded-lg bg-[#151A21] border border-[#1F2937] text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
