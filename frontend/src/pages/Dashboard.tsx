import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  FileText,
  PlusCircle,
  User,
  AlertCircle,
  Activity,
  FileUp,
  Heart,
  UserCog
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [appointmentDetailsOpen, setAppointmentDetailsOpen] = useState(false);

  // Previous appointments data (hardcoded for now)
  const previousAppointments = [
    {
      id: 1,
      date: "15 Feb 2024",
      doctor: "Dr. Sarah Johnson",
      facility: "City General Hospital",
      reason: "Chest pain and shortness of breath",
      diagnosis: "Acute bronchitis",
      treatment: "Prescribed antibiotics and bronchodilators",
      followUp: "2 weeks",
      status: "Completed",
    },
    {
      id: 2,
      date: "28 Jan 2024",
      doctor: "Dr. Michael Patel",
      facility: "Community Health Center",
      reason: "Routine health checkup",
      diagnosis: "Healthy, minor vitamin D deficiency",
      treatment: "Vitamin D supplements recommended",
      followUp: "6 months",
      status: "Completed",
    },
    {
      id: 3,
      date: "05 Dec 2023",
      doctor: "Dr. Emily Rodriguez",
      facility: "Urgent Care Clinic",
      reason: "Severe headache and fever",
      diagnosis: "Viral infection",
      treatment: "Rest, fluids, and over-the-counter pain relievers",
      followUp: "As needed",
      status: "Completed",
    },
  ];

  // Upcoming appointments data (hardcoded for now)
  const upcomingAppointments = [
    {
      id: 1,
      date: "20 Mar 2024",
      time: "10:30 AM",
      doctor: "Dr. David Chen",
      facility: "City General Hospital",
      department: "Cardiology",
      reason: "Follow-up on medication effectiveness",
      status: "Confirmed",
    },
    {
      id: 2,
      date: "05 Apr 2024",
      time: "2:15 PM",
      doctor: "Dr. Lisa Wang",
      facility: "Community Health Center",
      department: "General Medicine",
      reason: "Annual physical examination",
      status: "Scheduled",
    },
  ];

  // Critical alerts (hardcoded for now)
  const criticalAlerts = [
    {
      id: 1,
      title: "Medication Reminder",
      description: "Take Lisinopril 10mg daily",
      priority: "Medium",
      date: "Daily at 8:00 AM",
    },
    {
      id: 2,
      title: "Blood Pressure Check",
      description: "Record blood pressure readings",
      priority: "High",
      date: "Every Monday and Thursday",
    },
  ];

  // Health metrics data (hardcoded for now)
  const healthMetrics = {
    bloodPressure: {
      current: "120/80 mmHg",
      status: "Normal",
      lastChecked: "2 days ago",
    },
    heartRate: {
      current: "72 bpm",
      status: "Normal",
      lastChecked: "2 days ago",
    },
    oxygenLevel: {
      current: "98%",
      status: "Normal",
      lastChecked: "2 days ago",
    },
  };

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setAppointmentDetailsOpen(true);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Emergency Medical Response Dashboard</h1>
          <p className="text-gray-500">Manage your healthcare information and appointments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden md:inline">Health Status:</span> 
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Stable</Badge>
          </Button>
          <Button variant="destructive" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="hidden md:inline">Emergency</span>
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Health Metrics Card */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Health Metrics</CardTitle>
            <CardDescription>Your current health indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-blue-700">Blood Pressure</p>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">{healthMetrics.bloodPressure.status}</Badge>
                </div>
                <p className="text-2xl font-bold mt-2">{healthMetrics.bloodPressure.current}</p>
                <p className="text-xs text-gray-500 mt-1">Last checked: {healthMetrics.bloodPressure.lastChecked}</p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-red-700">Heart Rate</p>
                  <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">{healthMetrics.heartRate.status}</Badge>
                </div>
                <p className="text-2xl font-bold mt-2">{healthMetrics.heartRate.current}</p>
                <p className="text-xs text-gray-500 mt-1">Last checked: {healthMetrics.heartRate.lastChecked}</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-purple-700">Oxygen Level</p>
                  <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">{healthMetrics.oxygenLevel.status}</Badge>
                </div>
                <p className="text-2xl font-bold mt-2">{healthMetrics.oxygenLevel.current}</p>
                <p className="text-xs text-gray-500 mt-1">Last checked: {healthMetrics.oxygenLevel.lastChecked}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your healthcare information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full justify-start bg-blue-600 hover:bg-blue-700"
              onClick={() => handleNavigation('/schedule-appointment')}
            >
              <Calendar className="mr-2 h-4 w-4" /> Schedule Appointment
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleNavigation('/add-reports')}
            >
              <FileUp className="mr-2 h-4 w-4" /> Add Medical Reports
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleNavigation('/update-info')}
            >
              <UserCog className="mr-2 h-4 w-4" /> Update Information
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Heart className="mr-2 h-4 w-4" /> Emergency Contacts
            </Button>
          </CardContent>
        </Card>

        {/* Critical Alerts Card */}
        <Card>
          <CardHeader>
            <CardTitle>Critical Alerts</CardTitle>
            <CardDescription>Important health reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[180px]">
              <div className="space-y-4">
                {criticalAlerts.map((alert) => (
                  <div key={alert.id} className="p-3 bg-gray-50 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{alert.title}</p>
                      <Badge 
                        className={
                          alert.priority === "High" 
                            ? "bg-red-100 text-red-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {alert.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{alert.description}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="mr-1 h-3 w-3" /> {alert.date}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Appointments Card */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Appointments</CardTitle>
            <CardDescription>Manage your medical appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="previous">Previous</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-4">
                <ScrollArea className="h-[250px]">
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div 
                        key={appointment.id} 
                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => handleAppointmentClick(appointment)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <Calendar className="h-4 w-4 text-blue-700" />
                            </div>
                            <div>
                              <p className="font-medium">{appointment.doctor}</p>
                              <p className="text-sm text-gray-500">{appointment.facility} - {appointment.department}</p>
                            </div>
                          </div>
                          <Badge className={
                            appointment.status === "Confirmed" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-blue-100 text-blue-800"
                          }>
                            {appointment.status}
                          </Badge>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 space-x-3">
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" /> {appointment.date}
                          </span>
                          <span className="flex items-center">
                            <Clock className="mr-1 h-4 w-4" /> {appointment.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="previous" className="space-y-4">
                <ScrollArea className="h-[250px]">
                  <div className="space-y-4">
                    {previousAppointments.map((appointment) => (
                      <div 
                        key={appointment.id} 
                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => handleAppointmentClick(appointment)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gray-200 p-2 rounded-full">
                              <User className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium">{appointment.doctor}</p>
                              <p className="text-sm text-gray-500">{appointment.facility}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-gray-100">
                            {appointment.status}
                          </Badge>
                        </div>
                        <div className="mt-2 flex text-sm text-gray-500 space-x-3">
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" /> {appointment.date}
                          </span>
                          <span className="flex items-center">
                            <FileText className="mr-1 h-4 w-4" /> {appointment.reason.substring(0, 20)}...
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Appointment Details Dialog */}
      <Dialog open={appointmentDetailsOpen} onOpenChange={setAppointmentDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              {selectedAppointment?.status === "Completed" ? "Previous appointment information" : "Upcoming appointment information"}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Doctor</p>
                  <p className="font-medium">{selectedAppointment.doctor}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Facility</p>
                  <p className="font-medium">{selectedAppointment.facility}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{selectedAppointment.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {selectedAppointment.time ? "Time" : "Status"}
                  </p>
                  <p className="font-medium">
                    {selectedAppointment.time || selectedAppointment.status}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Reason</p>
                <p className="font-medium">{selectedAppointment.reason}</p>
              </div>
              
              {selectedAppointment.status === "Completed" && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Diagnosis</p>
                    <p className="font-medium">{selectedAppointment.diagnosis}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Treatment</p>
                    <p className="font-medium">{selectedAppointment.treatment}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Follow-up</p>
                    <p className="font-medium">{selectedAppointment.followUp}</p>
                  </div>
                </>
              )}
              
              {selectedAppointment.status !== "Completed" && (
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline">Reschedule</Button>
                  <Button variant="destructive">Cancel</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
