import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { discussionApi, type JobMessage } from '../../../services/discussion.service';
import { Send, Image as ImageIcon, Trash2, Clock, Info } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import moment from 'moment';
import { cn } from '../../../lib/utils';
import { socketService } from '../../../services/socket.service';

interface JobDiscussionHubProps {
    jobId: string;
    jobTitle?: string;
}

const JobDiscussionHub = ({ jobId, jobTitle }: JobDiscussionHubProps) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const queryClient = useQueryClient();
    const [message, setMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const { data: messages, isLoading } = useQuery({
        queryKey: ['job-messages', jobId],
        queryFn: () => discussionApi.getJobMessages(jobId),
    });

    const sendMutation = useMutation({
        mutationFn: discussionApi.sendMessage,
        onSuccess: () => {
            setMessage('');
            queryClient.invalidateQueries({ queryKey: ['job-messages', jobId] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: discussionApi.deleteMessage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job-messages', jobId] });
        }
    });

    useEffect(() => {
        // Connect to socket
        socketService.connect();
        socketService.joinJob(jobId);

        // Listen for real-time updates
        socketService.onNewMessage((newMsg) => {
            queryClient.setQueryData(['job-messages', jobId], (old: JobMessage[] | undefined) => {
                if (!old) return [newMsg];
                // Check if message already exists to prevent duplicates (since user also invalidates on success)
                if (old.find(m => m.id === newMsg.id)) return old;
                return [...old, newMsg];
            });
        });

        socketService.onMessageDeleted((msgId) => {
            queryClient.setQueryData(['job-messages', jobId], (old: JobMessage[] | undefined) => {
                if (!old) return [];
                return old.filter(m => m.id !== msgId);
            });
        });

        // Cleanup on unmount
        return () => {
            socketService.leaveJob(jobId);
        };
    }, [jobId, queryClient]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        sendMutation.mutate({ jobId, content: message });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();

        reader.onloadend = () => {
            const base64String = reader.result as string;
            sendMutation.mutate({
                jobId,
                content: `Shared a photo from the site`,
                imageUrl: base64String
            });
            setIsUploading(false);
        };

        reader.readAsDataURL(file);
    };

    if (isLoading) return <div className="p-4 text-gray-500 animate-pulse">Loading discussion...</div>;

    return (
        <div className="flex flex-col h-full min-h-0 bg-[#0B0E14] rounded-2xl border border-[#1F2937] overflow-hidden">
            {/* Thread Header */}
            <div className="p-3 bg-blue-600/10 border-b border-blue-600/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                        {jobTitle ? `${jobTitle} Group` : 'Crew Discussion Hub'}
                    </span>
                </div>
                <div className="text-[10px] text-gray-500 font-bold uppercase">
                    {messages?.length || 0} Updates
                </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages?.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <div className="w-12 h-12 rounded-full bg-[#151A21] border border-[#1F2937] flex items-center justify-center mb-4">
                            <Clock className="w-6 h-6 text-gray-600" />
                        </div>
                        <p className="text-gray-400 text-sm font-medium">No messages yet</p>
                        <p className="text-gray-600 text-[10px] uppercase mt-1 tracking-wider">Start the conversation with your crew</p>
                    </div>
                ) : (
                    messages?.map((msg) => (
                        <div className={cn(
                            "flex gap-3 max-w-[85%]",
                            msg.user.email === user?.email ? "ml-auto flex-row-reverse" : "flex-row"
                        )}>
                            {/* Avatar */}
                            <div className={cn(
                                "flex-shrink-0 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-black uppercase tracking-tighter shadow-xl",
                                msg.user.email === user?.email
                                    ? "bg-blue-600/40 text-blue-200"
                                    : "bg-[#1F2937] text-gray-300"
                            )}>
                                {msg.user.email.charAt(0)}
                            </div>

                            <div className={cn(
                                "flex flex-col",
                                msg.user.email === user?.email ? "items-end" : "items-start"
                            )}>
                                <div className="flex items-center gap-2 mb-1 px-1">
                                    <span className="text-[9px] font-bold text-gray-500 uppercase">{msg.user.email.split('@')[0]}</span>
                                    <span className="text-[9px] text-gray-600 font-mono">{moment(msg.createdAt).fromNow()}</span>
                                </div>

                                <div className={cn(
                                    "p-3 rounded-2xl text-sm relative group transition-all hover:ring-1 hover:ring-white/5",
                                    msg.user.email === user?.email
                                        ? "bg-blue-600 text-white rounded-tr-none"
                                        : "bg-[#151A21] border border-[#1F2937] text-gray-200 rounded-tl-none"
                                )}>
                                    {msg.imageUrl && (
                                        <div className="mb-2 overflow-hidden rounded-lg border border-white/10 shadow-2xl bg-[#0B0E14]">
                                            <img
                                                src={msg.imageUrl}
                                                alt="Site clip"
                                                className="max-w-full h-auto max-h-[300px] object-contain cursor-zoom-in hover:scale-[1.02] transition-transform"
                                                onClick={() => window.open(msg.imageUrl, '_blank')}
                                            />
                                        </div>
                                    )}
                                    <p className="leading-relaxed break-words">{msg.content}</p>

                                    {msg.user.email === user?.email && (
                                        <button
                                            onClick={() => deleteMutation.mutate(msg.id)}
                                            className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-600 hover:text-red-500"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#151A21] border-t border-[#1F2937]">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <label className="flex-shrink-0 cursor-pointer p-2 rounded-xl bg-[#0B0E14] border border-[#1F2937] text-gray-500 hover:text-blue-400 transition-colors">
                        <ImageIcon className="w-5 h-5" />
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                    </label>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Type a message or instruction..."
                            className="w-full bg-[#0B0E14] border border-[#1F2937] rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:border-blue-500 outline-none transition-all"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={!message.trim() || sendMutation.isPending}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-500 disabled:bg-gray-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </form>
                {isUploading && <p className="text-[10px] text-blue-400 mt-2 animate-pulse font-bold uppercase tracking-widest text-center">Uploading site photo...</p>}
            </div>
        </div>
    );
};

export default JobDiscussionHub;
