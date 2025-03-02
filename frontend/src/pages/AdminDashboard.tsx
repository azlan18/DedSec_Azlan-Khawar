"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AdminNavbar from "@/components/AdminNavbar"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  UserRound,
  Ambulance,
  HeartPulse,
  TrendingUp,
  TrendingDown,
  Bell,
  Clock,
  AlertCircle,
  AlertTriangle,
  AlertOctagon,
  LogOut,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"

interface Doctor {
  _id: string
  name: string
  department: string
}

interface EmergencyCall {
  _id: string
  description: string
  vitals: any
  medicalReportSummary: string
  severity: any
  triagePriority: string
  aiResponse: string
  createdAt: string
  updatedAt: string
  isAssigned?: boolean
  assignedDoctor?: string
  userId: string
}

interface StatCard {
  title: string
  value: number
  trend: number
  icon: React.ReactNode
}

const AdminDashboard = () => {
  const [greeting, setGreeting] = useState("")
  const [emergencyCalls, setEmergencyCalls] = useState<EmergencyCall[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<StatCard[]>([])
  const [doctors] = useState<Doctor[]>([
    { _id: "507f1f77bcf86cd799439011", name: "Dr. Priya Sharma", department: "Cardiology" },
    { _id: "507f1f77bcf86cd799439012", name: "Dr. Rajesh Patel", department: "Neurology" },
    { _id: "507f1f77bcf86cd799439013", name: "Dr. Anita Desai", department: "Pediatrics" },
    { _id: "507f1f77bcf86cd799439014", name: "Dr. Suresh Kumar", department: "Orthopedics" },
    { _id: "507f1f77bcf86cd799439015", name: "Dr. Meera Reddy", department: "Gynecology" },
  ])
  const [selectedCall, setSelectedCall] = useState<EmergencyCall | null>(null)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [assignmentData, setAssignmentData] = useState({
    doctorId: "",
    date: "",
    time: "",
    facility: "",
    department: "",
  })
  const navigate = useNavigate()

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good Morning")
    else if (hour < 18) setGreeting("Good Afternoon")
    else setGreeting("Good Evening")

    fetchEmergencyCalls()
    fetchStats()
  }, [])

  const fetchEmergencyCalls = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      const response = await fetch("http://localhost:5000/api/emergency", {
        headers: {
          token: token,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setEmergencyCalls(data)
        setIsLoading(false)
      } else {
        toast.error("Failed to fetch emergency calls")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error fetching emergency calls")
      setEmergencyCalls([])
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    // Simulated stats data - replace with actual API calls
    setStats([
      {
        title: "Total Users",
        value: 1250,
        trend: 12.5,
        icon: <Users className="h-6 w-6" />,
      },
      {
        title: "Total Patients",
        value: 850,
        trend: -5.2,
        icon: <UserRound className="h-6 w-6" />,
      },
      {
        title: "Total Drivers",
        value: 45,
        trend: 8.7,
        icon: <Ambulance className="h-6 w-6" />,
      },
      {
        title: "Total EMTs",
        value: 120,
        trend: 15.3,
        icon: <HeartPulse className="h-6 w-6" />,
      },
    ])
  }

  const handleAssignClick = (call: EmergencyCall) => {
    setSelectedCall(call)
    setIsAssignModalOpen(true)
  }

  const handleAssignSubmit = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("http://localhost:5000/api/appointments/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify({
          emergencyCallId: selectedCall?._id,
          ...assignmentData,
        }),
      })

      if (response.ok) {
        toast.success("Doctor assigned successfully")
        setIsAssignModalOpen(false)
        fetchEmergencyCalls() // Refresh the emergency calls
      } else {
        const error = await response.json()
        toast.error(error.msg || "Failed to assign doctor")
      }
    } catch (error) {
      console.error("Error assigning doctor:", error)
      toast.error("Failed to assign doctor")
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "immediate":
        return <AlertOctagon className="h-5 w-5 text-red-500" />
      case "urgent":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case "non-urgent":
        return <AlertCircle className="h-5 w-5 text-blue-500" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "immediate":
        return "bg-red-100 text-red-800 border-red-300"
      case "urgent":
        return "bg-orange-100 text-orange-800 border-orange-300"
      case "non-urgent":
        return "bg-blue-100 text-blue-800 border-blue-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const handleLogout = () => {
    navigate("/")
    toast.success("Logged out successfully")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <AdminNavbar />
      {/* Add padding to account for fixed navbar */}
      <div className="pt-24 px-8">
        {/* Header with Greeting */}
        <div className="flex items-center gap-3 mb-8">
          <Clock className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{greeting}, Admin</h1>
            <p className="text-gray-500">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" className="gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{stat.title}</CardTitle>
                <div className="p-2 bg-blue-50 rounded-full">{stat.icon}</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center mt-1">
                  {stat.trend > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <p className={`text-sm ${stat.trend > 0 ? "text-green-500" : "text-red-500"}`}>
                    {Math.abs(stat.trend)}% since last month
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Emergency Calls Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Emergency Requests</CardTitle>
            <CardDescription>Filter and manage incoming emergency calls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {["Immediate", "Urgent", "Non-urgent"].map((priority) => (
                <div key={priority} className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    {getPriorityIcon(priority)}
                    {priority} Priority Calls
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.isArray(emergencyCalls) &&
                      emergencyCalls
                        .filter((call) => call.triagePriority === priority)
                        .map((call) => (
                          <Card key={call._id} className="hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-start mb-4">
                                <Badge className={getPriorityColor(call.triagePriority)}>{call.triagePriority}</Badge>
                                <p className="text-sm text-gray-500">{new Date(call.createdAt).toLocaleTimeString()}</p>
                              </div>
                              <p className="font-medium mb-2">{call.description}</p>
                              <p className="text-sm text-gray-600 line-clamp-2 mb-4">{call.medicalReportSummary}</p>
                              <div className="flex justify-end">
                                <Button
                                  onClick={() => handleAssignClick(call)}
                                  disabled={call.isAssigned}
                                  variant={call.isAssigned ? "outline" : "default"}
                                >
                                  {call.isAssigned ? "Already Assigned" : "Assign Doctor"}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Assign Doctor Dialog */}
        <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Doctor</DialogTitle>
              <DialogDescription>Assign a doctor to this emergency call</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label>Select Doctor</label>
                <Select
                  onValueChange={(value) =>
                    setAssignmentData({
                      ...assignmentData,
                      doctorId: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor._id} value={doctor._id}>
                        {doctor.name} - {doctor.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label>Date</label>
                <Input
                  type="date"
                  value={assignmentData.date}
                  onChange={(e) =>
                    setAssignmentData({
                      ...assignmentData,
                      date: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label>Time</label>
                <Input
                  type="time"
                  value={assignmentData.time}
                  onChange={(e) =>
                    setAssignmentData({
                      ...assignmentData,
                      time: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label>Facility</label>
                <Input
                  value={assignmentData.facility}
                  onChange={(e) =>
                    setAssignmentData({
                      ...assignmentData,
                      facility: e.target.value,
                    })
                  }
                  placeholder="Enter facility name"
                />
              </div>

              <div className="space-y-2">
                <label>Department</label>
                <Input
                  value={assignmentData.department}
                  onChange={(e) =>
                    setAssignmentData({
                      ...assignmentData,
                      department: e.target.value,
                    })
                  }
                  placeholder="Enter department"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignSubmit}>Assign Doctor</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default AdminDashboard

