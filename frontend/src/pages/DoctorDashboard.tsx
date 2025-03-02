import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from "@/components/AdminNavbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Report {
  _id: string;
  patientName: string;
  reportType: string;
  date: string;
  base64Data: string;
}

const DoctorDashboard = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        toast.error('Authentication required');
        return;
      }

      const response = await fetch('http://localhost:5000/api/reports/all', {
        headers: {
          'token': token
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      const data = await response.json();
      console.log('Fetched reports:', data);
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
    }
  };

  const handleReportClick = (report: Report) => {
    console.log('Clicked report:', report);
    
    // Store the report data in localStorage with more details
    if (!report.base64Data) {
        console.error('Report missing base64Data:', report);
        toast.error('This report is corrupted or missing data. Please try re-uploading it.');
        return;
    }

    const reportData = {
        base64Data: report.base64Data,
        fileName: `${report.patientName}_${report.reportType || 'Report'}.pdf`,
        patientName: report.patientName,
        reportType: report.reportType || 'Medical Report',
        date: report.date
    };

    try {
        console.log('Storing report data:', { ...reportData, base64Data: 'TRUNCATED' });
        localStorage.setItem('pendingReport', JSON.stringify(reportData));
        // Navigate to MediChat page
        navigate('/medi-chat');
    } catch (error) {
        console.error('Error storing report data:', error);
        toast.error('Failed to load report');
    }
  };

  const filteredReports = reports.filter(report =>
    report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reportType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <AdminNavbar />
      <div className="container mx-auto p-6 pt-24">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Patient Reports Dashboard</h1>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient Name</TableHead>
                <TableHead>Report Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report._id}>
                  <TableCell>{report.patientName}</TableCell>
                  <TableCell>{report.reportType}</TableCell>
                  <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReportClick(report)}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      View in MediChat
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default DoctorDashboard; 