import React, { ChangeEvent, useState, useEffect, useRef } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { toast } from "sonner";

interface ReportComponentProps {
    onReportConfirmation: (data: string) => void;
}

const ReportComponent = ({ onReportConfirmation }: ReportComponentProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [base64String, setBase64String] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [reportData, setReportData] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Check for pending report from DoctorDashboard
        const pendingReport = localStorage.getItem('pendingReport');
        if (pendingReport) {
            try {
                const reportData = JSON.parse(pendingReport);
                if (!reportData.base64Data) {
                    throw new Error('No report data found');
                }

                // Handle both raw base64 and data URL formats
                let base64String = reportData.base64Data;
                if (!base64String.startsWith('data:')) {
                    base64String = `data:application/pdf;base64,${base64String}`;
                }
                
                setBase64String(base64String);
                setSelectedFile(new File(
                    [base64String],
                    reportData.fileName || 'report.pdf',
                    { type: 'application/pdf' }
                ));
                
                // Clear the pending report
                localStorage.removeItem('pendingReport');
                
                // Notify user
                toast.info('Report loaded. Click "Upload File" to proceed with analysis.');

                // Automatically trigger file upload
                handleUpload();
            } catch (error) {
                console.error('Error processing pending report:', error);
                toast.error('Error loading the report. Please try uploading manually.');
            }
        }
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validImages = ['image/jpeg', 'image/png', 'image/webp'];
        const validDocs = ['application/pdf'];
        const isValidImage = validImages.includes(file.type);
        const isValidDoc = validDocs.includes(file.type);

        if (!(isValidImage || isValidDoc)) {
            toast.error("Filetype not supported!");
            return;
        }

        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setBase64String(reader.result as string);
        };
        
        if (isValidImage) {
            reader.readAsDataURL(file);
        } else {
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = () => {
        if (!base64String) {
            toast.error('Please select a file first');
            return;
        }
        extractDetails();
    };

    async function extractDetails() {
        if (!base64String) {
            toast.error("Upload a valid report!");
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/extractreportgemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ base64: base64String }),
            });
            const data = await response.json();
            
            if (response.ok) {
                if (data.text) {
                    setReportData(data.text);
                    toast.success("Report extracted successfully");
                } else {
                    toast.error("No text was extracted from the report");
                }
            } else {
                const errorMessage = data.details || data.error || "Failed to extract report details";
                toast.error(errorMessage);
                console.error("API Error:", data);
            }
        } catch (error) {
            console.error("Error extracting report details:", error);
            toast.error("An error occurred while processing the report");
        }
        setIsLoading(false);
    }

    return (
        <div className="grid w-full items-start gap-6 overflow-auto p-4 pt-0">
            <fieldset className='relative grid gap-6 rounded-lg border p-4'>
                <legend className="text-sm font-medium">Report</legend>
                {isLoading && <div className="absolute z-10 h-full w-full bg-card/90 rounded-lg flex items-center justify-center">Extracting...</div>}
                <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-muted/50">
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="w-full"
                    >
                        {selectedFile ? selectedFile.name : 'Choose File'}
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <Button
                        onClick={handleUpload}
                        className="w-full"
                        disabled={!base64String}
                    >
                        1. Upload File
                    </Button>
                </div>
                <Label>Report Summary</Label>
                <Textarea value={reportData} onChange={(e) => setReportData(e.target.value)}
                    placeholder="Extracted data from the report will appear here. Get better recommendations by providing additional patient history and symptoms..."
                    className="min-h-72 resize-none border-0 p-3 shadow-none focus-visible:ring-0" />
                <Button variant="destructive" className="bg-[#D90013]" onClick={() => onReportConfirmation(reportData)}>2. Looks Good</Button>
            </fieldset>
        </div>
    );
};

export default ReportComponent;
