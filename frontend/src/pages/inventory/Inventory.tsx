import { Plus, Filter, PenSquare, History, Box, ChevronDown, X, Loader2, ChevronLeft, ChevronRight, Wrench, CheckCircle2, Clock } from 'lucide-react';
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
import { CardSkeleton } from '../../components/ui';
import moment from 'moment';

import { API_URL } from '../../services/api';

const InventoryCard = ({ item, readOnly, onEdit, onDelete, onHistory, onMaintenance }: { item: InventoryItem; readOnly?: boolean; onEdit: (item: InventoryItem) => void; onDelete: (id: string) => void; onHistory: (id: string) => void; onMaintenance: (item: InventoryItem) => void }) => {
    return (
        <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl p-4 group hover:border-gray-600 transition-all flex flex-col h-full relative overflow-hidden">
            {/* Status Badge - Now shows Availability */}
            <div className="absolute top-4 right-4 z-10">
                {(() => {
                    if (item.status === 'MAINTENANCE') {
                        return (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 backdrop-blur-md transition-all bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-lg shadow-amber-500/5">
                                <span className={cn("w-1.5 h-1.5 rounded-full bg-current animate-pulse")}></span>
                                MAINTENANCE
                            </span>
                        );
                    }
                    if (item.status === 'DAMAGED' || item.status === 'RETIRED') {
                        return (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 backdrop-blur-md transition-all bg-red-500/10 text-red-500 border-red-500/20">
                                <span className={cn("w-1.5 h-1.5 rounded-full bg-current")}></span>
                                {item.status}
                            </span>
                        );
                    }

                    const available = item.quantity - (item.checkedOutQuantity || 0);
                    const isFullyAvailable = available === item.quantity;
                    const isPartiallyAvailable = available > 0 && available < item.quantity;

                    return (
                        <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 backdrop-blur-md transition-all",
                            isFullyAvailable ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                isPartiallyAvailable ? "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-lg shadow-blue-500/5" :
                                    "bg-red-500/10 text-red-400 border-red-500/20"
                        )}>
                            <span className={cn("w-1.5 h-1.5 rounded-full bg-current animate-pulse")}></span>
                            {available}/{item.quantity} AVAILABLE
                        </span>
                    );
                })()}
            </div>

            {/* Image Placeholder */}
            <div className="h-40 bg-[#0B0E14] rounded-xl mb-4 flex items-center justify-center relative group-hover:bg-[#111419] transition-colors overflow-hidden">
                {item.imageUrl ? (
                    <img
                        src={item.imageUrl.startsWith('/') ? `${API_URL}${item.imageUrl}` : item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <Box className={cn("w-12 h-12 opacity-20 transition-transform duration-500 group-hover:scale-110",
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
            {/* Actions */}
            <div className="flex gap-2 mt-auto">
                {!readOnly && (
                    <button
                        onClick={() => onEdit(item)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-[#1F2937] hover:bg-[#374151] text-gray-300 text-xs font-medium transition-colors"
                    >
                        <PenSquare className="w-3.5 h-3.5" /> Edit
                    </button>
                )}

                <div className={cn("flex gap-2", readOnly && "w-full")}>
                    {/* Maintenance Button - Available to everyone */}
                    <button
                        onClick={() => onMaintenance(item)}
                        disabled={item.status === 'MAINTENANCE' || item.status === 'DAMAGED' || item.status === 'RETIRED'}
                        className={cn(
                            "p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                            readOnly ? "flex-1 flex items-center justify-center gap-2" : ""
                        )}
                        title={item.status === 'MAINTENANCE' ? 'Already in maintenance' : "Report Maintenance"}
                    >
                        <Wrench className="w-4 h-4" />
                        {readOnly && <span className="text-xs font-medium">Report Issue</span>}
                    </button>

                    {/* History Button - Available to everyone */}
                    <button
                        onClick={() => onHistory(item.id)}
                        className={cn(
                            "p-2 rounded-lg bg-[#1F2937] hover:bg-[#374151] text-gray-300 transition-colors",
                            readOnly ? "flex-1 flex items-center justify-center gap-2" : ""
                        )}
                        title="View History"
                    >
                        <History className="w-4 h-4" />
                        {readOnly && <span className="text-xs font-medium">History</span>}
                    </button>

                    {!readOnly && (
                        <button
                            onClick={() => onDelete(item.id)}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-colors"
                            title="Delete Item"
                        >
                            <X className="w-4 h-4" />
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
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <CreateItemModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                itemToEdit={editingItem}
            />
            <CreateCategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} />
            <MaintenanceHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} itemId={historyItem} />
            <ReportMaintenanceModal isOpen={!!reportingMaintenanceItem} onClose={() => setReportingMaintenanceItem(null)} item={reportingMaintenanceItem} />


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
            {
                isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <CardSkeleton key={i} />
                        ))}
                    </div>
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
                                onMaintenance={handleMaintenance}
                            />
                        ))}

                        {/* Add New Placeholder Card - Restricted to non-employees */}
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
                )
            }

            {/* Pagination Controls */}
            {
                meta && meta.totalPages > 1 && (
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
                )
            }
        </div >
    );
};

export default Inventory;
