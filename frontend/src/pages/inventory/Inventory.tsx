import { Plus, Search, PenSquare, History, Box, ChevronDown, X, Loader2, Wrench, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import type { RootState } from '../../store';
import { inventoryApi, type InventoryItem } from '../../services/inventory.service';
import { maintenanceApi } from '../../services/maintenance.service';
import { useConfirm } from '../../components/ui/ConfirmProvider';
import { useAlert } from '../../components/ui/AlertProvider';
import { CardSkeleton, Pagination } from '../../components/ui';
import moment from 'moment';

import { API_URL } from '../../services/api';

const InventoryCard = ({ item, readOnly, onEdit, onDelete, onHistory, onMaintenance }: { item: InventoryItem; readOnly?: boolean; onEdit: (item: InventoryItem) => void; onDelete: (id: string) => void; onHistory: (id: string) => void; onMaintenance: (item: InventoryItem) => void }) => {
    return (
        <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-3 md:p-4 group hover:border-gray-600 transition-all flex flex-col h-full relative overflow-hidden">
            {/* Status Badge - Now shows Availability */}
            <div className="absolute top-2 right-2 z-10">
                {(() => {
                    if (item.status === 'MAINTENANCE') {
                        return (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 backdrop-blur-md transition-all bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-lg shadow-amber-500/5">
                                <span className={cn("w-1 h-1 rounded-full bg-current animate-pulse")}></span>
                                MAINTENANCE
                            </span>
                        );
                    }
                    if (item.status === 'DAMAGED' || item.status === 'RETIRED') {
                        return (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 backdrop-blur-md transition-all bg-red-500/10 text-red-500 border-red-500/20">
                                <span className={cn("w-1 h-1 rounded-full bg-current")}></span>
                                {item.status}
                            </span>
                        );
                    }

                    const available = item.quantity - (item.checkedOutQuantity || 0);
                    const isFullyAvailable = available === item.quantity;
                    const isPartiallyAvailable = available > 0 && available < item.quantity;

                    return (
                        <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 backdrop-blur-md transition-all",
                            isFullyAvailable ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                isPartiallyAvailable ? "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-lg shadow-blue-500/5" :
                                    "bg-red-500/10 text-red-400 border-red-500/20"
                        )}>
                            <span className={cn("w-1 h-1 rounded-full bg-current animate-pulse")}></span>
                            {available}/{item.quantity} AVAILABLE
                        </span>
                    );
                })()}
            </div>

            {/* Image Placeholder */}
            <div className="h-28 md:h-36 bg-[#0B0E14] rounded-lg mb-3 flex items-center justify-center relative group-hover:bg-[#111419] transition-colors overflow-hidden">
                {item.imageUrl ? (
                    <img
                        src={item.imageUrl.startsWith('/') ? `${API_URL}${item.imageUrl}` : item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <Box className={cn("w-8 h-8 md:w-12 md:h-12 opacity-20 transition-transform duration-500 group-hover:scale-110",
                        item.category?.name === 'Lighting' ? "text-cyan-400" :
                            item.category?.name === 'Audio' ? "text-purple-400" :
                                item.category?.name === 'Rigging' ? "text-amber-400" :
                                    "text-gray-400"
                    )} />
                )}
            </div>

            {/* Content */}
            <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-white font-bold text-xs md:text-sm line-clamp-1">{item.name}</h3>
                </div>
                <p className="text-gray-400 text-[10px] md:text-xs mb-3 line-clamp-2 min-h-[2.5em]">{item.description || 'No description'}</p>

                <div className="grid grid-cols-2 gap-y-1 text-[10px] md:text-xs text-gray-500 mb-4">
                    <div>ID: <span className="text-gray-300">{item.qrCode}</span></div>
                    <div className="text-right">Type: <span className="text-gray-300">{item.category?.name}</span></div>
                    <div>Avail: <span className="text-gray-300">{item.quantity - (item.checkedOutQuantity || 0)}/{item.quantity}</span></div>
                    <div className="text-right">Rate: <span className="text-gray-300">${item.price}</span></div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-1.5 mt-auto">
                {!readOnly && (
                    <button
                        onClick={() => onEdit(item)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#1F2937] hover:bg-[#374151] text-gray-300 text-[10px] md:text-xs font-medium transition-colors"
                    >
                        <PenSquare className="w-3.5 h-3.5" /> Edit
                    </button>
                )}

                <div className={cn("flex gap-1.5", readOnly && "w-full")}>
                    {/* Maintenance Button - Available to everyone */}
                    <button
                        onClick={() => onMaintenance(item)}
                        disabled={item.status === 'MAINTENANCE' || item.status === 'DAMAGED' || item.status === 'RETIRED'}
                        className={cn(
                            "p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                            readOnly ? "flex-1 flex items-center justify-center gap-2" : ""
                        )}
                        title={item.status === 'MAINTENANCE' ? 'Already in maintenance' : "Report Maintenance"}
                    >
                        <Wrench className="w-3.5 h-3.5" />
                        {readOnly && <span className="text-[10px] font-medium">Report Issue</span>}
                    </button>

                    {/* History Button - Available to everyone */}
                    <button
                        onClick={() => onHistory(item.id)}
                        className={cn(
                            "p-1.5 rounded-lg bg-[#1F2937] hover:bg-[#374151] text-gray-300 transition-colors",
                            readOnly ? "flex-1 flex items-center justify-center gap-2" : ""
                        )}
                        title="View History"
                    >
                        <History className="w-3.5 h-3.5" />
                        {readOnly && <span className="text-[10px] font-medium">History</span>}
                    </button>

                    {!readOnly && (
                        <button
                            onClick={() => onDelete(item.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-colors"
                            title="Delete Item"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const CreateItemModal = ({ isOpen, onClose, itemToEdit }: { isOpen: boolean; onClose: () => void; itemToEdit?: InventoryItem | null }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<{
        name: string;
        description: string;
        file: File | null;
        quantity: number;
        price: number;
        categoryId: string;
        status: string;
    }>({
        name: '',
        description: '',
        file: null,
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
                file: null,
                quantity: itemToEdit.quantity,
                price: parseFloat(String(itemToEdit.price)),
                categoryId: itemToEdit.categoryId,
                status: itemToEdit.status
            });
        } else {
            setFormData({ name: '', description: '', file: null, quantity: 1, price: 0, categoryId: '', status: 'AVAILABLE' });
        }
    }, [itemToEdit, isOpen]);

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: inventoryApi.getCategories
    });

    const mutation = useMutation({
        mutationFn: (data: any) => {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('description', data.description);
            formData.append('quantity', String(data.quantity));
            formData.append('price', String(data.price));
            formData.append('categoryId', data.categoryId);
            formData.append('status', data.status);
            if (data.file) {
                formData.append('file', data.file);
            }

            if (itemToEdit) {
                return inventoryApi.update(itemToEdit.id, formData);
            }
            return inventoryApi.create(formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            onClose();
            if (!itemToEdit) {
                setFormData({ name: '', description: '', file: null, quantity: 1, price: 0, categoryId: '', status: 'AVAILABLE' });
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
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Item Name</label>
                            <input
                                type="text"
                                className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-blue-500 outline-none file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                                onChange={e => {
                                    if (e.target.files && e.target.files[0]) {
                                        setFormData({ ...formData, file: e.target.files[0] });
                                    }
                                }}
                            />
                        </div>
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
};

const ReportMaintenanceModal = ({ isOpen, onClose, item }: { isOpen: boolean; onClose: () => void; item: InventoryItem | null }) => {
    const queryClient = useQueryClient();
    const { success, error } = useAlert();
    const [formData, setFormData] = useState({
        description: '',
        cost: 0,
        status: 'MAINTENANCE' as const
    });

    const mutation = useMutation({
        mutationFn: (data: any) => maintenanceApi.create({ ...data, itemId: item?.id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['maintenance-logs'] });
            success("Reported", "Equipment marked for maintenance");
            onClose();
            setFormData({ description: '', cost: 0, status: 'MAINTENANCE' });
        },
        onError: () => error("Error", "Failed to report maintenance")
    });

    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Wrench className="w-5 h-5 text-amber-500" />
                        Report Maintenance
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-4">
                    <div className="p-3 bg-[#0B0E14] rounded-xl border border-[#1F2937] mb-2">
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Equipment</p>
                        <p className="text-white font-bold">{item.name}</p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{item.qrCode}</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Issue Description</label>
                        <textarea
                            rows={4}
                            placeholder="What's wrong with the equipment?"
                            className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-xl px-4 py-3 text-gray-200 text-sm focus:border-amber-500/50 outline-none transition-all resize-none"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Est. Cost (₹)</label>
                            <input
                                type="number"
                                className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-xl px-4 py-3 text-gray-200 text-sm focus:border-amber-500/50 outline-none transition-all"
                                value={formData.cost}
                                onChange={e => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">New Status</label>
                            <select
                                className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-xl px-4 py-3 text-gray-200 text-sm focus:border-amber-500/50 outline-none appearance-none cursor-pointer"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                            >
                                <option value="MAINTENANCE">Maintenance</option>
                                <option value="DAMAGED">Damaged</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-[#1F2937] hover:bg-[#374151] text-gray-300 font-bold rounded-xl transition-all">
                        Cancel
                    </button>
                    <button
                        onClick={() => mutation.mutate(formData)}
                        disabled={mutation.isPending || !formData.description}
                        className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-900/20 disabled:opacity-50"
                    >
                        {mutation.isPending ? 'Submitting...' : 'Report Issue'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const MaintenanceHistoryModal = ({ isOpen, onClose, itemId }: { isOpen: boolean; onClose: () => void; itemId: string | null }) => {
    const { data: history = [], isLoading } = useQuery({
        queryKey: ['maintenance-history', itemId],
        queryFn: () => itemId ? inventoryApi.getMaintenanceHistory(itemId) : Promise.resolve([]),
        enabled: !!itemId && isOpen
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#151A21] border border-[#1F2937] rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200 shadow-2xl flex flex-col">
                <div className="p-6 border-b border-[#1F2937] flex justify-between items-center bg-gradient-to-r from-amber-500/5 to-transparent rounded-t-3xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <History className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Maintenance History</h2>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Complete audit trail for this asset</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"><X className="w-5 h-5" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-[#0B0E14]/30 rounded-2xl border border-[#1F2937]/50 border-dashed">
                            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
                            <p className="text-gray-500 font-medium">Fetching historical logs...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-[#0B0E14]/30 rounded-2xl border border-[#1F2937]/50 border-dashed">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500/10 mb-4" />
                            <p className="text-gray-500 font-medium">No prior maintenance recorded for this item</p>
                            <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-tighter">Mint condition asset</p>
                        </div>
                    ) : (
                        history.map((log: any, idx: number) => (
                            <div key={log.id} className="relative pl-8 pb-4">
                                {/* Timeline Line */}
                                {idx !== history.length - 1 && <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-[#1F2937]" />}

                                <div className={cn(
                                    "absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10",
                                    log.resolvedAt ? "bg-[#0B0E14] border-emerald-500/30 text-emerald-500" : "bg-[#0B0E14] border-amber-500/30 text-amber-500"
                                )}>
                                    {log.resolvedAt ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                </div>

                                <div className="bg-[#1C232B] border border-[#1F2937] rounded-2xl p-4 transition-all hover:bg-[#232B35]">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                                                {moment(log.createdAt).format('MMMM DD, YYYY • hh:mm A')}
                                            </span>
                                            <h4 className="text-white font-bold leading-tight">{log.description}</h4>
                                        </div>
                                        <div className="text-right">
                                            {log.cost > 0 && <span className="text-xs font-black text-amber-400/80">₹{Number(log.cost).toLocaleString()}</span>}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#1F2937]/50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center text-[8px] font-bold text-blue-400">
                                                {log.reportedBy?.email?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <span className="text-[10px] text-gray-400 font-medium">Logged by {log.reportedBy?.email}</span>
                                        </div>
                                        {log.resolvedAt ? (
                                            <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 tracking-tighter uppercase">
                                                Resolved {moment(log.resolvedAt).fromNow()}
                                            </span>
                                        ) : (
                                            <span className="text-[9px] font-black bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-full border border-amber-500/20 tracking-tighter uppercase">
                                                Still in Repair
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 bg-[#0B0E14]/40 rounded-b-3xl">
                    <button onClick={onClose} className="w-full py-3.5 bg-[#1F2937] hover:bg-[#374151] text-gray-300 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all">
                        Dismiss History
                    </button>
                </div>
            </div>
        </div>
    );
};

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







const Inventory = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const { confirm } = useConfirm();
    const { success, error } = useAlert();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [page, setPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [historyItem, setHistoryItem] = useState<string | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [reportingMaintenanceItem, setReportingMaintenanceItem] = useState<InventoryItem | null>(null);

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

    const handleDelete = async (id: string) => {
        const item = inventory?.find(i => i.id === id);
        const confirmed = await confirm({
            title: 'Delete Equipment',
            message: `Are you sure you want to delete "${item?.name || 'this item'}"? This will remove it from all records.`,
            confirmText: 'Delete',
            type: 'danger'
        });

        if (confirmed) {
            deleteMutation.mutate(id, {
                onSuccess: () => success('Deleted', 'Equipment removed successfully'),
                onError: () => error('Error', 'Failed to delete equipment')
            });
        }
    };

    const handleHistory = (id: string) => {
        setHistoryItem(id);
        setIsHistoryOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleMaintenance = (item: InventoryItem) => {
        setReportingMaintenanceItem(item);
    };

    return (
        <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 pb-20 p-4 md:p-6 lg:p-8 max-w-screen-2xl mx-auto">
            <CreateItemModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                itemToEdit={editingItem}
            />
            <CreateCategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} />
            <MaintenanceHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} itemId={historyItem} />
            <ReportMaintenanceModal isOpen={!!reportingMaintenanceItem} onClose={() => setReportingMaintenanceItem(null)} item={reportingMaintenanceItem} />


            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1">Inventory</h1>
                    <p className="text-gray-400 text-xs md:text-sm">Manage and track all your equipment</p>
                </div>
                {user?.role !== 'EMPLOYEE' && (
                    <div className="flex items-center gap-2 md:gap-3">
                        <button
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="flex-1 sm:flex-none bg-[#1F2937] hover:bg-[#374151] text-gray-300 px-3 py-2 md:px-4 md:py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-[#374151] text-xs md:text-sm"
                        >
                            <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> Category
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all text-xs md:text-sm"
                        >
                            <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> Add Item
                        </button>
                    </div>
                )}
            </div>

            {/* Filters & Search */}
            <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search equipment by name or ID..."
                        className="w-full h-10 md:h-12 bg-[#151A21] border border-[#1F2937] rounded-xl pl-10 md:pl-12 pr-4 text-xs md:text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={cn(
                            "px-4 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border",
                            selectedCategory === 'all'
                                ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/20"
                                : "bg-[#111315] text-gray-500 border-[#1F2937] hover:border-gray-600 hover:text-gray-300"
                        )}
                    >
                        All Gear
                    </button>
                    {categories?.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border",
                                selectedCategory === cat.id
                                    ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/20"
                                    : "bg-[#111315] text-gray-500 border-[#1F2937] hover:border-gray-600 hover:text-gray-300"
                            )}
                        >
                            {cat.name}
                        </button>
                    ))}

                    <div className="w-px h-6 bg-[#1F2937] mx-1 md:mx-2 shrink-0"></div>

                    <button className="px-4 py-2 bg-[#111315] border border-[#1F2937] rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider text-gray-500 hover:text-gray-300 flex items-center gap-2 transition-all">
                        Status <ChevronDown className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Grid */}
            {
                isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <CardSkeleton key={i} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
                        {inventory?.map(item => (
                            <InventoryCard
                                key={item.id}
                                item={item}
                                readOnly={user?.role === 'EMPLOYEE'}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onHistory={handleHistory}
                                onMaintenance={handleMaintenance}
                            />
                        ))}

                        {/* Add New Placeholder Card - Restricted to non-employees */}
                        {user?.role !== 'EMPLOYEE' && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="border-2 border-dashed border-[#1F2937] rounded-2xl p-4 flex flex-col items-center justify-center text-gray-500 hover:text-blue-500 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group min-h-[220px]"
                            >
                                <div className="p-3 rounded-full bg-[#151A21] group-hover:bg-blue-500/20 mb-3 transition-colors">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <h3 className="text-white font-semibold mb-1 text-sm">Add Equipment</h3>
                                <p className="text-gray-500 text-xs">Add a new item to inventory</p>
                            </button>
                        )}
                    </div>
                )
            }

            {/* Pagination Controls */}
            <div className="mt-8 flex justify-center pb-10">
                <Pagination
                    currentPage={page}
                    totalPages={meta?.totalPages || 0}
                    onPageChange={(p) => {
                        setPage(p);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                />
            </div>
        </div >
    );
};

export default Inventory;
