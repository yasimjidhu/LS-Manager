
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Plus, Tag, Loader2, AlertCircle } from 'lucide-react';
import { inventoryApi } from '../../../services/inventory.service';
import { useAlert } from '../../../components/ui/AlertProvider';

const InventorySettings = () => {
    const queryClient = useQueryClient();
    const { success, error } = useAlert();
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const { data: categories, isLoading, isError } = useQuery({
        queryKey: ['categories'],
        queryFn: inventoryApi.getCategories
    });

    const createMutation = useMutation({
        mutationFn: (name: string) => inventoryApi.createCategory({ name }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setNewCategoryName('');
            setIsAdding(false);
            success('Success', 'Category created successfully');
        },
        onError: (err: any) => {
            error('Error', err?.response?.data?.message || 'Failed to create category');
        }
    });

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategoryName.trim()) {
            createMutation.mutate(newCategoryName);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-400"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />Loading categories...</div>;
    }

    if (isError) {
        return (
            <div className="p-8 text-center text-red-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                Failed to load categories.
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h3 className="text-xl font-bold text-white mb-1">Inventory Configuration</h3>
                <p className="text-gray-400 text-sm">Manage item categories and asset classification</p>
            </div>

            <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-500" />
                        Item Categories
                    </h4>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Category
                    </button>
                </div>

                {isAdding && (
                    <form onSubmit={handleAddCategory} className="mb-6 bg-[#0B0E14] p-4 rounded-lg border border-[#1F2937] animate-in slide-in-from-top-2">
                        <div className="flex gap-4 items-center">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Category Name (e.g. Lighting, Audio)"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="flex-1 bg-[#151A21] border border-[#1F2937] rounded-lg px-4 py-2 text-white text-sm focus:border-blue-500 outline-none"
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={!newCategoryName.trim() || createMutation.isPending}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    {createMutation.isPending ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="bg-[#1F2937] hover:bg-[#374151] text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categories?.map((category: any) => (
                        <div key={category.id} className="bg-[#0B0E14] border border-[#1F2937] rounded-lg p-4 flex items-center justify-between group hover:border-gray-600 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                    <Tag className="w-4 h-4" />
                                </div>
                                <span className="text-white font-medium">{category.name}</span>
                            </div>

                            {/* Delete could be added here if API supported it */}
                            {/* <button className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                <Trash2 className="w-4 h-4" />
                            </button> */}
                        </div>
                    ))}

                    {(!categories || categories.length === 0) && (
                        <div className="col-span-full text-center py-8 text-gray-500 border border-dashed border-[#1F2937] rounded-lg">
                            No categories found. Add one to get started.
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-6 opacity-60 pointer-events-none">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Tag className="w-5 h-5 text-purple-500" />
                        Asset Tag Settings (Coming Soon)
                    </h4>
                </div>
                <p className="text-sm text-gray-400">Configure automated QR code generation and asset tag numbering formats.</p>
            </div>
        </div>
    );
};

export default InventorySettings;
