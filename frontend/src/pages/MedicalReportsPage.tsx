import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, FileText, Download, Eye, Loader2, Trash2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Report {
  _id: string;
  reportId: string;
  fileName: string;
  patientName: string;
  uploadDate: string;
  hasSummary: boolean;
}

const MedicalReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [patientName, setPatientName] = useState('');
  const [reportType, setReportType] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.log(localStorage.getItem('token'));
        // navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/reports', {
        headers: {
          'token': token
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();
      setReports(data.reports || []);
    } catch (error) {
      toast.error("Failed to fetch reports. Please try again.");
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadReport = async () => {
    if (!selectedFile || !patientName || !reportType) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsUploading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('patientName', patientName);
      formData.append('reportType', reportType);
      
      const response = await fetch('http://localhost:5000/api/reports/upload', {
        method: 'POST',
        headers: {
          'token': token
        },
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload report');
      }
      
      toast.success("Report uploaded successfully");
      
      fetchReports();
      setSelectedFile(null);
      setPatientName('');
      setReportType('');
      
    } catch (error: any) {
      toast.error(error.message || "Failed to upload report");
    } finally {
      setIsUploading(false);
    }
  };

  const generateSummary = async (reportId: string) => {
    setIsGeneratingSummary(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/reports/${reportId}/generate-summary`, {
        method: 'POST',
        headers: {
          'token': token
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate summary');
      }
      
      toast.success("Summary generated successfully");
      
      fetchReports();
      
    } catch (error: any) {
      toast.error(error.message || "Failed to generate summary");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const downloadFile = async (reportId: string, type: 'report' | 'summary') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/reports/${reportId}/download?type=${type}`, {
        headers: {
          'token': token
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      // Create a blob from the response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and click it to download
      const a = document.createElement('a');
      a.href = url;
      a.download = type === 'report' ? 'report.pdf' : 'summary.txt';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      toast.error("Failed to download file. Please try again.");
    }
  };

  const viewFile = async (reportId: string, type: 'report' | 'summary') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Create a new window/tab
      const newWindow = window.open('', '_blank');
      
      if (!newWindow) {
        toast.error("Pop-up was blocked. Please allow pop-ups and try again.");
        return;
      }

      newWindow.document.write('Loading...');

      const response = await fetch(`http://localhost:5000/api/reports/${reportId}/view?type=${type}`, {
        headers: {
          'token': token
        }
      });

      if (!response.ok) {
        throw new Error('Failed to view file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Redirect the new window to the blob URL
      newWindow.location.href = url;

    } catch (error) {
      toast.error("Failed to view file. Please try again.");
    }
  };

  const deleteReport = async (report: Report) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      setIsDeleting(true);
      
      const response = await fetch(`http://localhost:5000/api/reports/${report.reportId}`, {
        method: 'DELETE',
        headers: {
          'token': token
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete report');
      }

      toast.success("Report deleted successfully");
      fetchReports();
      
    } catch (error) {
      toast.error("Failed to delete report. Please try again.");
    } finally {
      setIsDeleting(false);
      setReportToDelete(null);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Toaster position="top-right" richColors />
      
      <AlertDialog open={!!reportToDelete} onOpenChange={() => setReportToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the report and its summary if one exists.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => reportToDelete && deleteReport(reportToDelete)}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Report'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Medical Reports</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Add Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Medical Report</DialogTitle>
              <DialogDescription>
                Upload a PDF file to add a new medical report.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="patientName" className="text-right">
                  Patient Name
                </label>
                <Input
                  id="patientName"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="reportType" className="text-right">
                  Report Type
                </label>
                <Input
                  id="reportType"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  placeholder="e.g., Blood Test, X-Ray, MRI"
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="file" className="text-right">
                  Report File
                </label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="col-span-3"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={uploadReport} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Report'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-lg text-gray-500">Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium">No reports found</h3>
          <p className="mt-1 text-gray-500">Get started by uploading a new report.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Card key={report._id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{report.patientName}</CardTitle>
                    <CardDescription>{new Date(report.uploadDate).toLocaleDateString()}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                    onClick={() => setReportToDelete(report)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-gray-700 truncate">{report.fileName}</p>
              </CardContent>
              
              <CardFooter className="flex justify-between pt-2">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => viewFile(report._id, 'report')}
                    className="flex items-center gap-1"
                  >
                    <Eye size={14} />
                    View
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => downloadFile(report._id, 'report')}
                  >
                    <Download size={14} />
                    Download
                  </Button>
                </div>
                
                {report.hasSummary ? (
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => viewFile(report._id, 'summary')}
                      className="flex items-center gap-1"
                    >
                      <Eye size={14} />
                      View Summary
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => downloadFile(report._id, 'summary')}
                    >
                      <Download size={14} />
                      Download Summary
                    </Button>
                  </div>
                ) : (
                  <Button 
                    size="sm"
                    onClick={() => generateSummary(report._id)}
                    disabled={isGeneratingSummary}
                    className="flex items-center gap-1"
                  >
                    {isGeneratingSummary ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Summary'
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalReportsPage;