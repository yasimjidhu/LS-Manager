import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { JobsService } from '../../services/jobs.service';
import { useAlert } from '../../components/ui/AlertProvider';
import { useConfirm } from '../../components/ui/ConfirmProvider';
import { CalendarSkeleton, Skeleton } from '../../components/ui';

import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import '../../styles/calendar.css';

// Setup the localizer by providing the moment (or globalize, or Luxon) Object
// to the correct localizer.
const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

import { Plus, Calendar as CalendarIcon, MapPin, Users, AlertCircle, TrendingDown, LayoutDashboard, X, Package, Wallet, MessageSquare, Printer } from 'lucide-react';
import { cn } from '../../lib/utils';
import JobExpensesList from './components/JobExpensesList';
import JobDiscussionHub from './components/JobDiscussionHub';
import { settingsApi } from '../../services/settings.service';
import { API_URL } from '../../services/api';

const JobDetailsPanel = ({ job, isLoading, onClose, onEdit, onClone, onDelete }: { job: any; isLoading?: boolean; onClose: () => void; onEdit: () => void; onClone: () => void; onDelete: () => void }) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const isAdmin = user?.role !== 'EMPLOYEE';
    const { data: companyProfile } = useQuery({
        queryKey: ['company-profile'],
        queryFn: async () => {
            const data = await settingsApi.getCompanyProfile();
            return data;
        },
        staleTime: Infinity,
        retry: false
    });
    const [activeTab, setActiveTab] = useState<'details' | 'expenses' | 'workers' | 'items' | 'discussion'>('details');

    if (!job) return null;

    if (isLoading) {
        return (
            <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl p-6 h-full flex flex-col space-y-4">
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                </div>
                <Skeleton className="h-10 w-full rounded-xl" />
                <div className="space-y-4">
                    <Skeleton className="h-32 w-full rounded-xl" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl p-6 h-full animate-in slide-in-from-right duration-300 flex flex-col shadow-2xl overflow-hidden">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-lg font-bold text-white leading-tight">Job Insights</h2>
                    <p className="text-gray-400 text-sm mt-1 truncate max-w-[200px]">{job.title}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            const printWindow = window.open('', '_blank');
                            if (printWindow) {
                                const logoSrc = companyProfile?.logoUrl
                                    ? (companyProfile.logoUrl.startsWith('http') || companyProfile.logoUrl.startsWith('data:image')
                                        ? companyProfile.logoUrl
                                        : `${API_URL}${companyProfile.logoUrl}`)
                                    : '';

                                printWindow.document.write(`
                            <html>
                            <head>
                            <style>
                                body {
                                font-family: system-ui, -apple-system, sans-serif;
                                color: #1a1a1a;
                                line-height: 1.5;
                                padding: 40px;
                                max-width: 900px;
                                margin: 0 auto;
                                }

                                /* ===== HEADER ===== */
                                .header {
                                display: grid;
                                grid-template-columns: 1fr 2fr 1fr;
                                align-items: center;
                                padding-bottom: 16px;
                                }

                                .header-left {
                                text-align: left;
                                }

                                .header-center {
                                text-align: center;
                                }

                                .header-right {
                                text-align: right;
                                }

                                /* LOGO */
                                .company-logo {
                                max-height: 80px;
                                max-width: 200px;
                                object-fit: contain;
                                }

                                /* COMPANY NAME */
                                .company-name {
                                font-size: 22px;
                                font-weight: 900;
                                text-transform: uppercase;
                                letter-spacing: 1.5px;
                                margin: 0;
                                }

                                .company-location {
                                font-size: 12px;
                                color: #555;
                                }

                                /* DATE STYLE (PRODUCTION STYLE BIG DAY) */
                                .date-day {
                                font-size: 36px;
                                font-weight: 900;
                                line-height: 1;
                                }

                                .date-month {
                                font-size: 11px;
                                font-weight: 700;
                                text-transform: uppercase;
                                color: #666;
                                }


                                .divider {
                                border-bottom: 3px solid #000;
                                margin: 20px 0 30px;
                                }


                                /* ===== EVENT INFO ===== */
                                .event-block {
                                margin-bottom: 36px;
                                }

                                .event-title {
                                font-size: 22px;
                                font-weight: 900;
                                text-transform: uppercase;
                                margin-bottom: 6px;
                                }

                                .event-location {
                                font-size: 14px;
                                color: #555;
                                }

                                /* ===== CONTENT ===== */
                                .grid {
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 56px;
                                margin-bottom: 36px;
                                }

                                .section-title {
                                font-size: 12px;
                                font-weight: 800;
                                text-transform: uppercase;
                                color: #333;
                                border-bottom: 1px solid #ddd;
                                padding-bottom: 8px;
                                margin-bottom: 14px;
                                }

                                .info-row {
                                display: flex;
                                justify-content: space-between;
                                margin-bottom: 10px;
                                font-size: 14px;
                                }

                                .info-label {
                                font-weight: 600;
                                color: #555;
                                }

                                .info-value {
                                text-align: right;
                                font-weight: 500;
                                }

                                /* ===== TABLES ===== */
                                table {
                                width: 100%;
                                border-collapse: collapse;
                                font-size: 13px;
                                }

                                th {
                                text-align: left;
                                font-size: 11px;
                                text-transform: uppercase;
                                font-weight: 800;
                                padding-bottom: 8px;
                                border-bottom: 1px solid #000;
                                }

                                td {
                                padding: 8px 0;
                                border-bottom: 1px solid #eee;
                                }

                                .equipment {
                                margin-top: 36px;
                                }

                                .checkbox {
                                width: 16px;
                                height: 16px;
                                border: 1.5px solid #aaa;
                                border-radius: 3px;
                                display: inline-block;
                                }

                                @media print {
                                    @page { margin: 0; }
                                    body { padding: 40px; margin: 0; }
                                }
                            </style>
                            </head>

                            <body>
                            <!-- HEADER -->
                            <div class="header">
  <!-- LEFT: LOGO -->
  <div class="header-left">
    ${logoSrc ? `<img src="${logoSrc}" class="company-logo" />` : ''}
  </div>

  <!-- CENTER: COMPANY NAME -->
  <div class="header-center">
    <div class="company-name">${companyProfile?.companyName || 'LS EVENT MANAGER'}</div>
    <div class="company-location">
      ${companyProfile?.city || ''}${companyProfile?.state ? ', ' + companyProfile.state : ''}
      ${companyProfile?.postalCode ? '<br>' + companyProfile.postalCode : ''}
    </div>
  </div>

  <!-- RIGHT: DATE -->
  <div class="header-right">
    <div class="date-day">${new Date(job.date).toLocaleDateString('en-GB', { day: '2-digit' })}</div>
    <div class="date-month">
      ${new Date(job.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
    </div>
  </div>
</div>


                            <div class="divider"></div>

                            <!-- EVENT INFO -->
                            <div class="event-block" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                                <div>
                                    <div style="font-size: 14px; margin-bottom: 8px;">
                                        <span style="font-weight: 600; min-width: 80px; display: inline-block;">Event:</span> 
                                        <span>${job.title}</span>
                                    </div>
                                    <div style="font-size: 14px;">
                                        <span style="font-weight: 600; min-width: 80px; display: inline-block;">Customer:</span> 
                                        <span>${job.client || 'N/A'}</span>
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 14px; margin-bottom: 8px;">
                                        <span style="font-weight: 600; margin-right: 8px;">Date:</span> 
                                        <span>${new Date(job.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                    <div style="font-size: 14px;">
                                        <span style="font-weight: 600; margin-right: 8px;">Place:</span> 
                                        <span>${job.location}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="equipment">
                                <div class="section-title">Equipment Packing List</div>
                                <table>
                                <thead>
                                    <tr><th width="40">Chk</th><th>Item</th><th width="80">Qty</th><th width="100">Status</th></tr>
                                </thead>
                                <tbody>
                                    ${(job.checkouts || []).map((c: any) => `
                                    <tr>
                                        <td><span class="checkbox"></span></td>
                                        <td><strong>${c.item?.name}</strong></td>
                                        <td>${c.quantity}</td>
                                        <td>${c.status === 'CHECKED_OUT' ? 'Packed' : c.status}</td>
                                    </tr>
                                    `).join('') || `
                                    <tr><td colspan="4" style="text-align:center; color:#999; padding:16px;">No equipment listed</td></tr>
                                    `}
                                </tbody>
                                </table>
                            </div>

                            <script>window.print();</script>
                            </body>
                            </html>
                            `);


                                printWindow.document.close();
                            }
                        }}
                        className="text-gray-400 hover:text-white transition-colors bg-[#0B0E14] px-3 py-1 rounded-lg text-xs font-medium border border-[#1F2937] flex items-center gap-2 group"
                    >
                        <Printer className="w-3.5 h-3.5 group-hover:text-blue-400 transition-colors" />
                        Print Call Sheet
                    </button>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-[#0B0E14] px-3 py-1 rounded-lg text-xs font-medium border border-[#1F2937]">
                        Close
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-[#0B0E14] rounded-xl border border-[#1F2937] mb-6 shrink-0 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setActiveTab('details')}
                    className={cn(
                        "flex-1 min-w-[80px] py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all flex flex-col items-center justify-center gap-1",
                        activeTab === 'details' ? "bg-blue-600/20 text-blue-400 shadow-sm border border-blue-600/20" : "text-gray-500 hover:text-gray-300"
                    )}
                >
                    <LayoutDashboard className="w-4 h-4" /> Details
                </button>
                <button
                    onClick={() => setActiveTab('workers')}
                    className={cn(
                        "flex-1 min-w-[80px] py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all flex flex-col items-center justify-center gap-1",
                        activeTab === 'workers' ? "bg-emerald-600/20 text-emerald-400 shadow-sm border border-emerald-600/20" : "text-gray-500 hover:text-gray-300"
                    )}
                >
                    <Users className="w-4 h-4" /> Workers
                </button>
                <button
                    onClick={() => setActiveTab('items')}
                    className={cn(
                        "flex-1 min-w-[80px] py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all flex flex-col items-center justify-center gap-1",
                        activeTab === 'items' ? "bg-purple-600/20 text-purple-400 shadow-sm border border-purple-600/20" : "text-gray-500 hover:text-gray-300"
                    )}
                >
                    <Package className="w-4 h-4" /> Items
                </button>
                <button
                    onClick={() => setActiveTab('expenses')}
                    className={cn(
                        "flex-1 min-w-[80px] py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all flex flex-col items-center justify-center gap-1",
                        activeTab === 'expenses' ? "bg-amber-600/20 text-amber-400 shadow-sm border border-amber-600/20" : "text-gray-500 hover:text-gray-300"
                    )}
                >
                    <TrendingDown className="w-4 h-4" /> Costs
                </button>
                <button
                    onClick={() => setActiveTab('discussion')}
                    className={cn(
                        "flex-1 min-w-[80px] py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all flex flex-col items-center justify-center gap-1",
                        activeTab === 'discussion' ? "bg-blue-500/20 text-blue-400 shadow-sm border border-blue-500/20" : "text-gray-500 hover:text-gray-300"
                    )}
                >
                    <MessageSquare className="w-4 h-4" /> Hub
                </button>
            </div>

            <div className={cn(
                "flex-1 pr-1 custom-scrollbar flex flex-col min-h-0",
                activeTab !== 'discussion' ? "overflow-y-auto" : "overflow-hidden"
            )}>
                {activeTab === 'details' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className={`p-4 rounded-xl ${job.color || 'bg-blue-600/20'} border border-white/10`}>
                            <h3 className="text-xl font-bold text-white mb-1">{job.title}</h3>
                            <p className="text-sm opacity-80">{job.client}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-3 bg-[#0B0E14] border border-[#1F2937] rounded-xl hover:border-gray-700 transition-colors">
                                <div className="p-2.5 bg-[#151A21] border border-[#1F2937] rounded-lg text-gray-400">
                                    <CalendarIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Timeframe</p>
                                    <p className="text-gray-200 text-sm font-medium">{job.date}</p>
                                    <p className="text-gray-400 text-xs mt-0.5">{job.duration}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-3 bg-[#0B0E14] border border-[#1F2937] rounded-xl hover:border-gray-700 transition-colors">
                                <div className="p-2.5 bg-[#151A21] border border-[#1F2937] rounded-lg text-gray-400">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Location</p>
                                    <p className="text-gray-200 text-sm font-medium">{job.location}</p>
                                </div>
                            </div>

                            {job.description && (
                                <div className="flex items-start gap-4 p-3 bg-[#0B0E14] border border-[#1F2937] rounded-xl hover:border-gray-700 transition-colors">
                                    <div className="p-2.5 bg-[#151A21] border border-[#1F2937] rounded-lg text-gray-400">
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Notes</p>
                                        <p className="text-gray-200 text-sm italic">"{job.description}"</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-[#1F2937]">
                            {job.status === 'COMPLETED' && (
                                <div className="mb-6 space-y-3">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Job Financials</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="p-3 bg-[#0B0E14] border border-[#1F2937] rounded-xl">
                                            <p className="text-[9px] text-gray-500 font-bold uppercase mb-1">Revenue</p>
                                            <p className="text-sm font-bold text-blue-400">₹{Number(job.invoice?.totalAmount || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="p-3 bg-[#0B0E14] border border-[#1F2937] rounded-xl">
                                            <p className="text-[9px] text-gray-500 font-bold uppercase mb-1">Direct Costs</p>
                                            <p className="text-sm font-bold text-red-400">₹{(
                                                (job.wages || []).reduce((sum: number, w: any) => sum + Number(w.amount), 0) +
                                                (job.expenses || []).reduce((sum: number, e: any) => sum + Number(e.amount), 0)
                                            ).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex justify-between items-center">
                                        <div>
                                            <p className="text-[9px] text-gray-500 font-bold uppercase">Net Margin</p>
                                            <p className="text-lg font-black text-emerald-400 font-mono">
                                                ₹{(
                                                    Number(job.invoice?.totalAmount || 0) -
                                                    ((job.wages || []).reduce((sum: number, w: any) => sum + Number(w.amount), 0) +
                                                        (job.expenses || []).reduce((sum: number, e: any) => sum + Number(e.amount), 0))
                                                ).toLocaleString()}
                                            </p>
                                        </div>
                                        <TrendingDown className="w-5 h-5 text-emerald-500 opacity-20 rotate-180" />
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between mb-4">
                                <span className={cn("px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border",
                                    job.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" :
                                        job.status === 'CONFIRMED' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                            job.status === 'ONGOING' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                job.status === 'CANCELLED' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                    "bg-gray-500/10 text-gray-500 border-gray-500/20"
                                )}>
                                    Status: {job.status}
                                </span>
                            </div>
                            {isAdmin && (
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={onEdit} className="py-2.5 rounded-xl bg-[#1F2937] hover:bg-[#374151] text-gray-300 text-sm font-medium transition-colors border border-[#374151]">
                                        Edit Schedule
                                    </button>
                                    <button onClick={onClone} className="py-2.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/20 text-sm font-bold transition-colors">
                                        Clone Job
                                    </button>
                                    <button
                                        onClick={onDelete}
                                        className="col-span-2 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-sm font-bold transition-colors"
                                    >
                                        Remove Job
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'workers' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Team Composition</h3>
                            <span className="text-xs text-blue-400 font-mono">{(job.requests || []).length} Assigned</span>
                        </div>

                        <div className="space-y-3">
                            {(job.requests || []).length === 0 ? (
                                <div className="p-8 text-center bg-[#0B0E14] border border-dashed border-[#1F2937] rounded-2xl">
                                    <Users className="w-8 h-8 text-gray-600 mx-auto mb-3 opacity-20" />
                                    <p className="text-gray-500 text-xs">No workers assigned to this job yet.</p>
                                </div>
                            ) : (
                                job.requests.map((request: any) => {
                                    // Find wage for this employee if available
                                    const wage = (job.wages || []).find((w: any) => w.employeeId === request.employee.id);

                                    return (
                                        <div key={request.id} className="p-4 bg-[#0B0E14] border border-[#1F2937] rounded-2xl hover:border-emerald-500/30 transition-all group">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                                                        {request.employee.firstName[0]}{request.employee.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-white text-sm font-bold">{request.employee.firstName} {request.employee.lastName}</p>
                                                        <p className="text-gray-500 text-[10px] uppercase font-bold">{request.employee.phone || 'No phone'}</p>
                                                    </div>
                                                </div>
                                                {wage ? (
                                                    <div className="text-right">
                                                        <p className="text-emerald-400 font-bold font-mono text-sm leading-tight">₹{Number(wage.amount).toLocaleString()}</p>
                                                        <p className="text-[9px] text-gray-500 uppercase font-bold">{wage.status}</p>
                                                    </div>
                                                ) : (
                                                    <div className="px-2 py-1 rounded-md bg-gray-500/10 text-gray-500 text-[9px] font-bold">Unpaid</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {job.status === 'COMPLETED' && (job.wages || []).length > 0 && (
                            <div className="mt-6 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                                <div className="flex items-center gap-2 text-emerald-400 mb-1">
                                    <Wallet className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Labor Summary</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-gray-400 text-xs">Total Direct Labor Costs:</span>
                                    <span className="text-lg font-bold text-white font-mono">
                                        ₹{(job.wages || []).reduce((sum: number, w: any) => sum + Number(w.amount), 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'items' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Equipment Log</h3>
                            <span className="text-xs text-purple-400 font-mono">{(job.checkouts || []).length} Items</span>
                        </div>

                        <div className="space-y-2">
                            {(job.checkouts || []).length === 0 ? (
                                <div className="p-8 text-center bg-[#0B0E14] border border-dashed border-[#1F2937] rounded-2xl">
                                    <Package className="w-8 h-8 text-gray-600 mx-auto mb-3 opacity-20" />
                                    <p className="text-gray-500 text-xs">No equipment recorded for this job.</p>
                                </div>
                            ) : (
                                job.checkouts.map((checkout: any) => (
                                    <div key={checkout.id} className="flex items-center justify-between p-3 bg-[#0B0E14] border border-[#1F2937] rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400">
                                                <Package className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-gray-200 text-sm font-medium">{checkout.item.name}</p>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase">{checkout.quantity} Units • {checkout.status}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'expenses' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Financial Records</h3>
                        </div>
                        <JobExpensesList jobId={job.id} />
                    </div>
                )}
                {activeTab === 'discussion' && (
                    <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <JobDiscussionHub jobId={job.id} jobTitle={job.title} />
                    </div>
                )}
            </div>
        </div >
    );
};

const CreateJobModal = ({ isOpen, onClose, initialData, isEditing }: { isOpen: boolean; onClose: () => void; initialData?: any; isEditing: boolean }) => {
    const queryClient = useQueryClient();
    const { user } = useSelector((state: RootState) => state.auth);
    const { error: alertError } = useAlert();
    const [formData, setFormData] = useState(initialData || {
        title: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        duration: '',
        location: '',
        client: '',
        status: 'PENDING',
        description: '',
        requiredWorkers: 5,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        includeSelfAsWorker: false
    });

    const calculateDuration = (startDate: string, endDate: string) => {
        if (!startDate || !endDate) return '';
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffMs = end.getTime() - start.getTime();
        if (diffMs < 0) return 'Invalid';
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Same day';
        if (diffDays === 1) return '1 day';
        return `${diffDays} days`;
    };

    const handleDateChange = (field: string, value: string) => {
        const updated = { ...formData, [field]: value };
        const duration = calculateDuration(
            updated.startDate || formData.startDate,
            updated.endDate || formData.endDate
        );
        setFormData({
            ...updated,
            duration,
            date: updated.startDate || formData.startDate
        });
    };

    const mutation = useMutation({
        mutationFn: isEditing
            ? (data: any) => JobsService.update(initialData.id, data)
            : JobsService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            onClose();
        },
        onError: (error: any) => {
            console.error("Failed to save job:", error);
            alertError("Error", error.response?.data?.message || "Failed to save job. Please try again.");
        }
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Sanitize data - only send fields that are in the CreateJobDto/UpdateJobDto
        // Remove internal fields like id, createdAt, updatedAt and relations like requests, checkouts
        // Also remove calendar-specific fields like start, end, allDay
        const {
            id, createdAt, updatedAt, requests, checkouts, wages, invoice, expenses, messages,
            start, end, allDay, // Calendar fields
            time, startDate, endDate, // UI helper fields
            ...sanitizedData
        } = formData;

        mutation.mutate(sanitizedData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in duration-200 h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">{isEditing ? 'Edit Job' : 'Schedule New Job'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-[#1F2937] rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-400 uppercase">Title</label>
                            <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-cyan-500 outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-400 uppercase">Client</label>
                            <input required type="text" value={formData.client} onChange={e => setFormData({ ...formData, client: e.target.value })} className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-cyan-500 outline-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-400 uppercase">Start Date</label>
                            <input required type="date" value={formData.startDate} onChange={e => handleDateChange('startDate', e.target.value)} className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-cyan-500 outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-400 uppercase">End Date</label>
                            <input required type="date" value={formData.endDate} onChange={e => handleDateChange('endDate', e.target.value)} className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-cyan-500 outline-none" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase">Duration</label>
                        <input type="text" value={formData.duration} readOnly className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-400 text-sm cursor-not-allowed" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase">Location</label>
                        <input required type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-cyan-500 outline-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-400 uppercase">Status</label>
                            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-cyan-500 outline-none">
                                <option value="PENDING">Pending</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-400 uppercase">Required Workers</label>
                            <input type="number" min="1" value={formData.requiredWorkers} onChange={e => setFormData({ ...formData, requiredWorkers: parseInt(e.target.value) || 0 })} className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-cyan-500 outline-none" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase">Description</label>
                        <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-lg px-4 py-2.5 text-gray-200 text-sm focus:border-cyan-500 outline-none" />
                    </div>

                    {!isEditing && (user?.role === 'SUPERVISOR' || user?.role === 'ADMIN') && (
                        <div className="p-4 bg-blue-600/5 border border-blue-600/20 rounded-xl space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-600/10 rounded-lg">
                                    <Users className="w-4 h-4 text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-white mb-1">On-Site Participation</h4>
                                    <p className="text-[11px] text-gray-400 leading-relaxed">
                                        Would you like to be counted as a working member of the crew?
                                        This will include you in the workforce headcount and automate your wage calculations for this session.
                                    </p>
                                </div>
                                <div className="pt-1">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.includeSelfAsWorker}
                                            onChange={(e) => setFormData({ ...formData, includeSelfAsWorker: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-[#0B0E14] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gray-500 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white border border-[#1F2937]"></div>
                                    </label>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-blue-400/60 font-medium">
                                <AlertCircle className="w-3 h-3" />
                                <span>You can always adjust your assignment later from the crew roster.</span>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-[#1F2937] mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-[#1F2937] hover:bg-[#374151] text-gray-300 text-sm font-medium transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold transition-colors">{isEditing ? 'Save Changes' : 'Schedule Job'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Jobs = () => {
    const queryClient = useQueryClient();
    const { success: alertSuccess, error: alertError } = useAlert();
    const { confirm } = useConfirm();
    const { user } = useSelector((state: RootState) => state.auth);
    const isAdmin = user?.role !== 'EMPLOYEE';
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Calendar State
    const [view, setView] = useState(Views.MONTH);
    const [date, setDate] = useState(new Date());

    const { data: jobsData, isLoading } = useQuery({
        queryKey: ['jobs'],
        queryFn: () => JobsService.getAll({ limit: 1000 })
    });

    // Extract array from paginated response
    const jobs = jobsData?.data || [];

    const { data: fullJobDetails, isLoading: isLoadingDetails } = useQuery({
        queryKey: ['job-details', selectedJob?.id],
        queryFn: () => JobsService.getOne(selectedJob.id),
        enabled: !!selectedJob?.id,
    });

    const updateJobMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => JobsService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
        },
        onError: (error: any) => {
            console.error("Failed to update job:", error);
            alertError("Update Failed", "Failed to move job. Please try again.");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: JobsService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            setSelectedJob(null);
        }
    });

    const cloneMutation = useMutation({
        mutationFn: JobsService.clone,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            alertSuccess("Success", "Job cloned successfully!");
        },
        onError: () => {
            alertError("Error", "Failed to clone job. Please try again.");
        }
    });

    const handleDelete = async () => {
        if (!selectedJob) return;

        const confirmed = await confirm({
            title: 'Delete Job',
            message: `Are you sure you want to delete "${selectedJob.title}"? This action cannot be undone.`,
            confirmText: 'Delete',
            type: 'danger'
        });

        if (confirmed) {
            deleteMutation.mutate(selectedJob.id);
        }
    };

    const handleClone = async () => {
        if (!selectedJob) return;

        const confirmed = await confirm({
            title: 'Clone Job',
            message: `Do you want to create a duplicate of "${selectedJob.title}"?`,
            confirmText: 'Clone',
            type: 'info'
        });

        if (confirmed) {
            cloneMutation.mutate(selectedJob.id);
        }
    };


    const handleEventDrop = useCallback(
        (args: any) => {
            const { event, start } = args;
            const updatedJob = { ...event };
            const startDate = moment(start).format('YYYY-MM-DD');

            // Maintain approximate duration logic from modal if needed, or just blindly update
            updateJobMutation.mutate({
                id: updatedJob.id,
                data: {
                    date: startDate
                }
            });
        },
        [updateJobMutation]
    );

    const handleSelectEvent = useCallback((event: any) => {
        setSelectedJob(event);
    }, []);

    const handleNavigate = useCallback((newDate: Date) => {
        setDate(newDate);
    }, []);

    const handleViewChange = useCallback((newView: any) => {
        setView(newView);
    }, []);

    const events = React.useMemo(() => (jobs || []).map((job: any) => {
        // Fallback or use existing start/end
        // Events need Date objects
        const start = new Date(job.startDate || job.date);
        const end = new Date(job.endDate || job.date);

        return {
            ...job,
            start,
            end,
            title: job.title,
            allDay: true
        };
    }), [jobs]);

    if (isLoading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500 pb-10 h-[calc(100vh-8rem)]">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                    <div className="lg:col-span-2">
                        <CalendarSkeleton />
                    </div>
                    <div className="lg:col-span-1">
                        <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl p-6 h-full flex flex-col space-y-4">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                            <Skeleton className="flex-1 w-full rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-6 lg:p-8 max-w-[1600px] mx-auto h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Job Scheduling</h1>
                    <p className="text-gray-400">Plan and manage your event schedule</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-cyan-500 hover:bg-cyan-400 text-black px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
                    >
                        <Plus className="w-5 h-5" /> Schedule Job
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Calendar Section */}
                <div className="lg:col-span-2 bg-[#151A21] border border-[#1F2937] rounded-2xl p-6 flex flex-col h-full overflow-hidden">
                    <DnDCalendar
                        localizer={localizer}
                        events={events} // Use memoized events
                        startAccessor={(e: any) => new Date(e.start)}
                        endAccessor={(e: any) => new Date(e.end)}
                        onEventDrop={isAdmin ? (handleEventDrop as any) : undefined}
                        onSelectEvent={handleSelectEvent}
                        draggableAccessor={() => isAdmin}
                        resizable={isAdmin}

                        // Controlled props
                        date={date}
                        view={view}
                        onNavigate={handleNavigate}
                        onView={handleViewChange}

                        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                        className="text-gray-300 flex-1"
                        eventPropGetter={() => ({
                            className: `!bg-blue-600/20 !border-blue-600/30 !text-blue-400 !rounded-md !text-xs !px-2 !py-1`,
                            style: {
                                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                                borderColor: 'rgba(37, 99, 235, 0.3)',
                                color: '#60A5FA'
                            }
                        })}
                    />
                </div>

                {/* Sidebar / Details */}
                <div className="lg:col-span-1 h-full flex flex-col min-h-0">
                    {selectedJob ? (
                        <JobDetailsPanel
                            job={fullJobDetails || selectedJob}
                            isLoading={isLoadingDetails}
                            onClose={() => setSelectedJob(null)}
                            onEdit={() => setIsEditModalOpen(true)}
                            onClone={handleClone}
                            onDelete={handleDelete}
                        />
                    ) : (
                        <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl p-6 h-full flex flex-col">
                            <h2 className="text-lg font-bold text-white mb-4">Upcoming Jobs</h2>
                            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                {(jobs || []).length === 0 && <p className="text-gray-500 text-sm">No upcoming jobs found.</p>}
                                {(jobs || []).map((job: any) => (
                                    <div
                                        key={job.id}
                                        onClick={() => setSelectedJob(job)}
                                        className="p-4 rounded-xl bg-[#0B0E14] border border-[#1F2937] hover:border-gray-600 transition-all cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-gray-200 group-hover:text-cyan-400 transition-colors">{job.title}</h3>
                                            <span className={cn("text-[10px] px-3 py-1 border rounded-md text-xs font-semibold uppercase tracking-wide",
                                                job.status === 'COMPLETED' ? "border-emerald-600 text-emerald-600 bg-emerald-600/10" :
                                                    job.status === 'CONFIRMED' ? "border-blue-600 text-blue-600 bg-blue-600/10" :
                                                        job.status === 'ONGOING' ? "border-amber-600 text-amber-600 bg-amber-600/10" :
                                                            job.status === 'CANCELLED' ? "border-red-600 text-red-600 bg-red-600/10" :
                                                                "border-gray-600 text-gray-600 bg-gray-600/10"
                                            )}>
                                                {job.status}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 flex flex-col gap-1">
                                            <span>{job.date}</span>
                                            <span>{job.location}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {isCreateModalOpen && (
                <CreateJobModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    isEditing={false}
                />
            )}

            {isEditModalOpen && selectedJob && (
                <CreateJobModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    initialData={selectedJob}
                    isEditing={true}
                />
            )}
        </div>
    );
};

export default Jobs;
