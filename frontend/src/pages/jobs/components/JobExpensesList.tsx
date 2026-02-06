import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, DollarSign, PieChart, Receipt } from 'lucide-react';
import { JobExpensesService } from '../../../services/job-expenses.service';
import type { CreateJobExpenseDto } from '../../../services/job-expenses.service';
import type { RootState } from '../../../store';

const JobExpensesList = ({ jobId }: { jobId: string }) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const isAdmin = user?.role !== 'EMPLOYEE';
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    const [newExpense, setNewExpense] = useState<Partial<CreateJobExpenseDto>>({
        title: '',
        amount: 0,
        category: 'MISC',
        description: ''
    });

    const { data: expenses, isLoading } = useQuery({
        queryKey: ['job-expenses', jobId],
        queryFn: () => JobExpensesService.getAllByJob(jobId)
    });

    const createMutation = useMutation({
        mutationFn: JobExpensesService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job-expenses', jobId] });
            setIsAdding(false);
            setNewExpense({ title: '', amount: 0, category: 'MISC', description: '' });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: JobExpensesService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job-expenses', jobId] });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newExpense.title || !newExpense.amount) return;

        createMutation.mutate({
            jobId,
            title: newExpense.title,
            amount: Number(newExpense.amount),
            category: newExpense.category || 'MISC',
            description: newExpense.description
        } as CreateJobExpenseDto);
    };

    const totalExpenses = expenses?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;

    const categoryColors: Record<string, string> = {
        TRANSPORT: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
        FOOD: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
        FUEL: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
        EQUIPMENT_RENTAL: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
        MISC: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
    };

    return (
        <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-[#0B0E14] border border-[#1F2937] rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                        <PieChart className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-semibold">Total Expenses</p>
                        <p className="text-xl font-bold text-white">${totalExpenses.toLocaleString()}</p>
                    </div>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="p-2 hover:bg-[#1F2937] text-gray-400 hover:text-white rounded-lg transition-colors"
                    >
                        <Plus className={`w-5 h-5 transition-transform ${isAdding ? 'rotate-45' : ''}`} />
                    </button>
                )}
            </div>

            {/* Add Expense Form */}
            {isAdding && (
                <form onSubmit={handleSubmit} className="bg-[#0B0E14] border border-[#1F2937] rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="text"
                            placeholder="Expense Title"
                            value={newExpense.title}
                            onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                            className="bg-[#151A21] border border-[#1F2937] rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                            autoFocus
                        />
                        <div className="relative">
                            <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="number"
                                placeholder="Amount"
                                value={newExpense.amount || ''}
                                onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                                className="w-full bg-[#151A21] border border-[#1F2937] rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <select
                            value={newExpense.category}
                            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                            className="bg-[#151A21] border border-[#1F2937] rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-blue-500 outline-none"
                        >
                            <option value="MISC">Misc</option>
                            <option value="TRANSPORT">Transport</option>
                            <option value="FOOD">Food</option>
                            <option value="FUEL">Fuel</option>
                            <option value="EQUIPMENT_RENTAL">Equipment Rental</option>
                        </select>
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                        >
                            {createMutation.isPending ? 'Adding...' : 'Add Expense'}
                        </button>
                    </div>
                </form>
            )}

            {/* List */}
            <div className="space-y-3">
                {expenses?.length === 0 && !isLoading && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        No expenses recorded yet.
                    </div>
                )}

                {expenses?.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 rounded-xl bg-[#0B0E14] border border-[#1F2937] group hover:border-gray-600 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg border ${categoryColors[expense.category] || categoryColors.MISC}`}>
                                <Receipt className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">{expense.title}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>{new Date(expense.createdAt).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span className="capitalize">{expense.category.toLowerCase().replace('_', ' ')}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-white">${Number(expense.amount).toFixed(2)}</span>
                            {isAdmin && (
                                <button
                                    onClick={() => deleteMutation.mutate(expense.id)}
                                    className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JobExpensesList;
