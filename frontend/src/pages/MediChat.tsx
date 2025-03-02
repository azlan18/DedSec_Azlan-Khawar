'use client';

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Settings, FileText, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import ReportComponent from "../components/ReportComponent";
import { toast, Toaster } from "sonner";
import ChatComponent from "@/components/chatcomponent";

const MediChat = () => {
  const [reportData, setReportData] = useState<string | undefined>();

  useEffect(() => {
    // Check for pending report from DoctorDashboard
    const pendingReport = localStorage.getItem('pendingReport');
    if (pendingReport) {
      try {
        const reportData = JSON.parse(pendingReport);
        setReportData(reportData.base64Data);
      } catch (error) {
        console.error('Error processing pending report:', error);
        toast.error('Error loading the report');
      }
    }
  }, []);

  const handleReportConfirmation = (data: string) => {
    setReportData(data);
    toast.success("Report updated successfully");
  };

  return (
    <div className="container mx-auto p-6 h-screen flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">MediChat</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        <div className="order-2 md:order-1">
          <ChatComponent reportData={reportData} />
        </div>
        <div className="order-1 md:order-2">
          <ReportComponent onReportConfirmation={handleReportConfirmation} />
        </div>
      </div>
    </div>
  );
};

export default MediChat;
