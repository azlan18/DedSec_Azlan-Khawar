import React, { useState, useEffect } from "react";
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
  UserCog,
  Loader2,
  LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

interface Appointment {
  _id: string;
  doctorId: string;
  date: string;
  time: string;
  facility: string;
  department: string;
  reason: string;
  status: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [appointmentDetailsOpen, setAppointmentDetailsOpen] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [previousAppointments, setPreviousAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchAppointments();
  }, [navigate]);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/appointments/user', {
        headers: {
          'token': token
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch appointments');
      }

      const appointments = await response.json();
      
      // Sort appointments into upcoming and previous
      const now = new Date();
      const upcoming = appointments.filter((apt: Appointment) => new Date(apt.date) >= now);
      const previous = appointments.filter((apt: Appointment) => new Date(apt.date) < now);

      setUpcomingAppointments(upcoming);
      setPreviousAppointments(previous);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to fetch appointments');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentDetailsOpen(true);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    navigate('/');
    toast.success('Logged out successfully');
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
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Logout</span>
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
              onClick={() => handleNavigation('/create-emergency-call')}
            >
              <Calendar className="mr-2 h-4 w-4" /> Schedule Appointment
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleNavigation('/medical-reports')}
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
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : upcomingAppointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No upcoming appointments
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingAppointments.map((appointment) => (
                        <div 
                          key={appointment._id} 
                          className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                          onClick={() => handleAppointmentClick(appointment)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="bg-blue-100 p-2 rounded-full">
                                <Calendar className="h-4 w-4 text-blue-700" />
                              </div>
                              <div>
                                <p className="font-medium">Doctor Appointment</p>
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
                              <Calendar className="mr-1 h-4 w-4" /> {new Date(appointment.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Clock className="mr-1 h-4 w-4" /> {appointment.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="previous" className="space-y-4">
                <ScrollArea className="h-[250px]">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : previousAppointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No previous appointments
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {previousAppointments.map((appointment) => (
                        <div 
                          key={appointment._id} 
                          className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                          onClick={() => handleAppointmentClick(appointment)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="bg-gray-200 p-2 rounded-full">
                                <User className="h-4 w-4 text-gray-600" />
                              </div>
                              <div>
                                <p className="font-medium">Past Appointment</p>
                                <p className="text-sm text-gray-500">{appointment.facility}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-gray-100">
                              {appointment.status}
                            </Badge>
                          </div>
                          <div className="mt-2 flex text-sm text-gray-500 space-x-3">
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-4 w-4" /> {new Date(appointment.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <FileText className="mr-1 h-4 w-4" /> {appointment.reason.substring(0, 20)}...
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Appointment Details Dialog */}
      <Dialog open={appointmentDetailsOpen} onOpenChange={setAppointmentDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              View the details of your medical appointment
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p className="font-medium">
                  {new Date(selectedAppointment.date).toLocaleDateString()} at {selectedAppointment.time}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Doctor</p>
                <p className="font-medium">Doctor Appointment</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Facility</p>
                <p className="font-medium">{selectedAppointment.facility}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{selectedAppointment.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Reason</p>
                <p className="font-medium">{selectedAppointment.reason}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge className={
                  selectedAppointment.status === "Confirmed"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }>
                  {selectedAppointment.status}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;