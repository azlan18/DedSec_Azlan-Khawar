'use client';

import { useState, useEffect } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CornerDownLeft, Loader2, FileText, ChevronDown } from 'lucide-react';
import Messages from '@/components/messages';
import { Message } from 'ai';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Markdown from '@/components/ui/markdown';
import { toast } from "sonner";

interface ChatComponentProps {
    reportData?: string;
}

const ChatComponent = ({ reportData }: ChatComponentProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [retrievals, setRetrievals] = useState<string>('');

    useEffect(() => {
        if (reportData) {
            setMessages([]);
            setRetrievals('');
        }
    }, [reportData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        if (!reportData) {
            toast.error('Please upload and process a report first');
            return;
        }

        setIsLoading(true);

        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            createdAt: new Date()
        };

        const newMessages = [...messages, newMessage];
        setMessages(newMessages);
        setInput('');

        try {
            const response = await fetch('http://localhost:5000/api/chat/medichatgemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages, data: { reportData } }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response from server');
            }

            const data = await response.json();
            
            if (data.error) {
                toast.error(data.error);
                return;
            }

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.text,
                createdAt: new Date()
            };

            setMessages([...newMessages, assistantMessage]);
            
            if (data.retrievals) {
                setRetrievals(data.retrievals);
            }
        } catch (error) {
            console.error('Error fetching chat response:', error);
            toast.error('Failed to get response from AI');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Chat Session</h2>
                <Badge 
                    variant={reportData ? "default" : "secondary"}
                    className={`px-3 py-1 ${reportData ? 'bg-green-500 hover:bg-green-600' : ''}`}
                >
                    {reportData ? "Report Loaded" : "No Report"}
                </Badge>
            </div>
            <div className="flex-1 overflow-auto rounded-lg border bg-background p-4">
                <Messages messages={messages} isLoading={isLoading} />
            </div>
            {retrievals && (
                <Collapsible className="bg-muted/50 rounded-lg">
                    <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/70 transition-colors">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span>Relevant Information</span>
                        </div>
                        <ChevronDown className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 pb-4">
                        <div className="pt-2 text-sm">
                            <Markdown text={retrievals} />
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <Textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder={reportData ? "Ask about the medical report..." : "Please upload and process a report first"}
                    className="min-h-[100px] p-4 rounded-lg resize-none"
                    disabled={!reportData}
                />
                <Button 
                    type="submit"
                    disabled={isLoading || !reportData}
                    className="ml-auto"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            Send Message
                            <CornerDownLeft className="w-4 h-4 ml-2" />
                        </>
                    )}
                </Button>
            </form>
        </div>
    );
};

export default ChatComponent;
