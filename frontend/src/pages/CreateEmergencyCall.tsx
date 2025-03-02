"use client"

// src/pages/CreateEmergencyCall.tsx
import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Loader2,
  AlertCircle,
  FileText,
  Heart,
  Activity,
  Thermometer,
  Droplets,
  TreesIcon as Lungs,
  Brain,
  Upload,
  Stethoscope,
  AlertTriangle,
  BadgeAlert,
  Ambulance,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import axios from "axios"

interface Vitals {
  deviceType: string
  heartRate: number
  bloodPressure: string
  spO2: number
  temperature: number
}

interface EmergencyFormData {
  description: string
  vitals: Vitals
  medicalReportSummary: string
  painLevel: number
  breathingDifficulty: number
  distressLevel: string
  consciousness: string
}

interface AIResponse {
  summary: string
  triagePriority: string
  recommendations: string
}

const WEARABLE_DEVICES = [
  { name: "Apple Watch Series 8", id: "apple-watch-8" },
  { name: "Fitbit Sense 2", id: "fitbit-sense-2" },
  { name: "Samsung Galaxy Watch 5", id: "samsung-watch-5" },
  { name: "Garmin Venu 2 Plus", id: "garmin-venu-2" },
  { name: "Oura Ring Gen 3", id: "oura-ring-3" },
]

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const CreateEmergencyCall: React.FC = () => {
  const [formData, setFormData] = useState<EmergencyFormData>({
    description: "",
    vitals: {
      deviceType: "",
      heartRate: 0,
      bloodPressure: "",
      spO2: 0,
      temperature: 0,
    },
    medicalReportSummary: "",
    painLevel: 0,
    breathingDifficulty: 1,
    distressLevel: "Mildly Concerned",
    consciousness: "Alert and Oriented",
  })

  const [file, setFile] = useState<File | null>(null)
  const [isLoadingVitals, setIsLoadingVitals] = useState(false)
  const [isLoadingReport, setIsLoadingReport] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("description")
  const [formProgress, setFormProgress] = useState(25)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSliderChange = (name: string, value: number[]) => {
    setFormData((prev) => ({ ...prev, [name]: value[0] }))
  }

  const handleDeviceSelect = (deviceType: string) => {
    setFormData((prev) => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        deviceType,
      },
    }))
  }

  const fetchVitals = () => {
    if (!formData.vitals.deviceType) {
      setError("Please select a wearable device first")
      return
    }

    setIsLoadingVitals(true)
    setError(null)

    // Simulate API call with timeout
    setTimeout(() => {
      // Generate random but realistic vitals
      const mockVitals = {
        heartRate: Math.floor(Math.random() * (120 - 60) + 60),
        bloodPressure: `${Math.floor(Math.random() * (140 - 110) + 110)}/${Math.floor(Math.random() * (90 - 70) + 70)}`,
        spO2: Math.floor(Math.random() * (100 - 94) + 94),
        temperature: Number((Math.random() * (37.8 - 36.5) + 36.5).toFixed(1)),
      }

      setFormData((prev) => ({
        ...prev,
        vitals: {
          ...prev.vitals,
          ...mockVitals,
        },
      }))

      setIsLoadingVitals(false)
      updateFormProgress()
    }, 1500)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      analyzeReport(e.target.files[0])
    }
  }

  const analyzeReport = async (file: File) => {
    setIsLoadingReport(true)
    setError(null)

    // In a real app, we would upload and process the PDF here
    // For now, we'll simulate this with a timeout
    try {
      // Simulated API response
      setTimeout(() => {
        const mockSummary =
          "Patient has a history of hypertension and type 2 diabetes. " +
          "Recent lab work shows elevated HbA1c (7.8%) and cholesterol levels. " +
          "Currently taking Metformin 1000mg BID, Lisinopril 20mg daily, and Atorvastatin 40mg at night. " +
          "Recent ECG showed normal sinus rhythm with occasional PVCs. " +
          "Known allergen to penicillin and sulfa drugs."

        setFormData((prev) => ({
          ...prev,
          medicalReportSummary: mockSummary,
        }))

        setIsLoadingReport(false)
        updateFormProgress()
      }, 2000)
    } catch (error) {
      setError("Error analyzing medical report")
      setIsLoadingReport(false)
    }
  }

  const updateFormProgress = () => {
    let progress = 25 // Start with 25% for opening the form

    if (formData.description) progress += 15
    if (formData.vitals.heartRate > 0) progress += 20
    if (formData.medicalReportSummary) progress += 20
    if (formData.painLevel > 0 || formData.breathingDifficulty > 1) progress += 20

    setFormProgress(Math.min(progress, 100))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      // Get token from localStorage
      const token = localStorage.getItem("token")

      if (!token) {
        setError("No authentication token found. Please login again.")
        setIsSubmitting(false)
        return
      }

      // Configure axios with auth header
      axios.defaults.headers.common["token"] = token

      // Make real API call to backend
      const response = await axios.post('http://localhost:5000/api/emergency', 
        {
          description: formData.description,
          vitals: formData.vitals,
          medicalReportSummary: formData.medicalReportSummary,
          painLevel: formData.painLevel,
          breathingDifficulty: formData.breathingDifficulty,
          distressLevel: formData.distressLevel,
          consciousness: formData.consciousness
        }
      );

      setAiResponse(response.data.aiResponse);
      setIsSubmitting(false)
      setFormProgress(100)
    } catch (error: any) {
      console.error("Error details:", error)
      setError(error.response?.data?.msg || "Error submitting emergency call")
      setIsSubmitting(false)
    }
  }

  const determineTriagePriority = () => {
    // Simple logic to determine triage priority
    const { painLevel, breathingDifficulty, distressLevel, consciousness } = formData

    if (breathingDifficulty >= 4 || consciousness === "Unresponsive") {
      return "Immediate"
    } else if (painLevel >= 8 || distressLevel === "Panicked" || consciousness === "Drowsy") {
      return "Urgent"
    } else if (painLevel >= 5 || breathingDifficulty >= 3 || distressLevel === "Very Concerned") {
      return "Delayed"
    } else {
      return "Minimal"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Immediate":
        return "bg-red-600"
      case "Urgent":
        return "bg-orange-500"
      case "Delayed":
        return "bg-yellow-500"
      case "Minimal":
        return "bg-green-500"
      default:
        return "bg-blue-500"
    }
  }

  const getPriorityGradient = (priority: string) => {
    switch (priority) {
      case "Immediate":
        return "from-red-600 to-red-800"
      case "Urgent":
        return "from-orange-500 to-orange-700"
      case "Delayed":
        return "from-yellow-500 to-yellow-700"
      case "Minimal":
        return "from-green-500 to-green-700"
      default:
        return "from-blue-500 to-blue-700"
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    updateFormProgress()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <BadgeAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
            Emergency Medical Call
          </h1>
          <p className="text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            Create an emergency call with vital information to help medical professionals respond quickly and
            effectively.
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500 dark:text-slate-400">Form completion</span>
            <span className="font-medium">{formProgress}%</span>
          </div>
          <Progress value={formProgress} className="h-2" />
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="mb-6"
          >
            <Alert variant="destructive" className="border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger
                value="description"
                className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700 dark:data-[state=active]:bg-red-900/30 dark:data-[state=active]:text-red-400"
              >
                <div className="flex flex-col items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs">Description</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="vitals"
                className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-400"
              >
                <div className="flex flex-col items-center gap-1">
                  <Activity className="h-4 w-4" />
                  <span className="text-xs">Vitals</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="medical"
                className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:text-purple-400"
              >
                <div className="flex flex-col items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span className="text-xs">Medical</span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="severity"
                className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700 dark:data-[state=active]:bg-amber-900/30 dark:data-[state=active]:text-amber-400"
              >
                <div className="flex flex-col items-center gap-1">
                  <Stethoscope className="h-4 w-4" />
                  <span className="text-xs">Severity</span>
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description">
              <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                <Card className="border-red-200 dark:border-red-800/50 shadow-lg shadow-red-100/20 dark:shadow-red-900/10">
                  <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30 border-b border-red-200 dark:border-red-800/50">
                    <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                      <AlertTriangle className="h-5 w-5" />
                      Emergency Description
                    </CardTitle>
                    <CardDescription>Provide a detailed description of the medical emergency</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Textarea
                      name="description"
                      placeholder="Describe the medical emergency in detail..."
                      className="min-h-32 border-red-200 dark:border-red-800/50 focus-visible:ring-red-500"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </CardContent>
                  <CardFooter className="flex justify-end border-t border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-950/30">
                    <Button
                      type="button"
                      onClick={() => setActiveTab("vitals")}
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                    >
                      Next: Patient Vitals
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="vitals">
              <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                <Card className="border-blue-200 dark:border-blue-800/50 shadow-lg shadow-blue-100/20 dark:shadow-blue-900/10">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-b border-blue-200 dark:border-blue-800/50">
                    <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                      <Activity className="h-5 w-5" />
                      Patient Vitals
                    </CardTitle>
                    <CardDescription>Connect to wearable device to fetch current vital signs</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <Select onValueChange={(value) => handleDeviceSelect(value)}>
                          <SelectTrigger className="w-full sm:w-64 border-blue-200 dark:border-blue-800/50">
                            <SelectValue placeholder="Select wearable device" />
                          </SelectTrigger>
                          <SelectContent>
                            {WEARABLE_DEVICES.map((device) => (
                              <SelectItem key={device.id} value={device.id}>
                                {device.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          onClick={fetchVitals}
                          disabled={isLoadingVitals || !formData.vitals.deviceType}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        >
                          {isLoadingVitals ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Fetching Vitals
                            </>
                          ) : (
                            <>
                              <Heart className="mr-2 h-4 w-4" />
                              Get Vitals
                            </>
                          )}
                        </Button>
                      </div>

                      <AnimatePresence>
                        {formData.vitals.heartRate > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="mt-6"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                              >
                                <Card className="overflow-hidden border-red-200 dark:border-red-800/50 h-full">
                                  <div className="h-2 bg-gradient-to-r from-red-500 to-red-600" />
                                  <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                      <Heart className="h-4 w-4 text-red-500" />
                                      Heart Rate
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="p-4 pt-0">
                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                      {formData.vitals.heartRate}{" "}
                                      <span className="text-sm font-normal text-red-400 dark:text-red-500">bpm</span>
                                    </p>
                                  </CardContent>
                                </Card>
                              </motion.div>

                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                              >
                                <Card className="overflow-hidden border-blue-200 dark:border-blue-800/50 h-full">
                                  <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600" />
                                  <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                      <Droplets className="h-4 w-4 text-blue-500" />
                                      Blood Pressure
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="p-4 pt-0">
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                      {formData.vitals.bloodPressure}
                                    </p>
                                  </CardContent>
                                </Card>
                              </motion.div>

                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                              >
                                <Card className="overflow-hidden border-cyan-200 dark:border-cyan-800/50 h-full">
                                  <div className="h-2 bg-gradient-to-r from-cyan-500 to-cyan-600" />
                                  <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                      <Lungs className="h-4 w-4 text-cyan-500" />
                                      SpO2
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="p-4 pt-0">
                                    <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                                      {formData.vitals.spO2}
                                      <span className="text-sm font-normal text-cyan-400 dark:text-cyan-500">%</span>
                                    </p>
                                  </CardContent>
                                </Card>
                              </motion.div>

                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                              >
                                <Card className="overflow-hidden border-amber-200 dark:border-amber-800/50 h-full">
                                  <div className="h-2 bg-gradient-to-r from-amber-500 to-amber-600" />
                                  <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                      <Thermometer className="h-4 w-4 text-amber-500" />
                                      Temperature
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="p-4 pt-0">
                                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                      {formData.vitals.temperature}
                                      <span className="text-sm font-normal text-amber-400 dark:text-amber-500">°C</span>
                                    </p>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/30">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("description")}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/50"
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setActiveTab("medical")}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    >
                      Next: Medical Report
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="medical">
              <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                <Card className="border-purple-200 dark:border-purple-800/50 shadow-lg shadow-purple-100/20 dark:shadow-purple-900/10">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 border-b border-purple-200 dark:border-purple-800/50">
                    <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                      <FileText className="h-5 w-5" />
                      Medical Report
                    </CardTitle>
                    <CardDescription>Upload the patient's most recent medical report (PDF)</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="relative w-full sm:w-auto">
                        <Input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileUpload}
                          className="border-purple-200 dark:border-purple-800/50 focus-visible:ring-purple-500 file:bg-purple-100 file:text-purple-700 file:border-purple-200 dark:file:bg-purple-900/30 dark:file:text-purple-400 dark:file:border-purple-800/50"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <Upload className="h-4 w-4 text-purple-500" />
                        </div>
                      </div>
                      {file && (
                        <Badge
                          variant="outline"
                          className="text-xs border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800/50 dark:bg-purple-900/20 dark:text-purple-400"
                        >
                          {file.name}
                        </Badge>
                      )}
                    </div>

                    <AnimatePresence>
                      {isLoadingReport && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center space-x-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md border border-purple-200 dark:border-purple-800/50"
                        >
                          <Loader2 className="h-4 w-4 animate-spin text-purple-600 dark:text-purple-400" />
                          <span className="text-sm text-purple-700 dark:text-purple-400">
                            Analyzing medical report...
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {formData.medicalReportSummary && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        >
                          <Card className="bg-purple-50/50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/50">
                            <CardHeader className="p-4 pb-2">
                              <CardTitle className="text-sm font-medium flex items-center text-purple-700 dark:text-purple-400">
                                <FileText className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                                Report Summary
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <ScrollArea className="h-[120px] rounded-md">
                                <p className="text-sm text-purple-800 dark:text-purple-300">
                                  {formData.medicalReportSummary}
                                </p>
                              </ScrollArea>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-purple-200 dark:border-purple-800/50 bg-purple-50/50 dark:bg-purple-950/30">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("vitals")}
                      className="border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950/50"
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setActiveTab("severity")}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                    >
                      Next: Severity Assessment
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="severity">
              <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                <Card className="border-amber-200 dark:border-amber-800/50 shadow-lg shadow-amber-100/20 dark:shadow-amber-900/10">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/30 border-b border-amber-200 dark:border-amber-800/50">
                    <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                      <Stethoscope className="h-5 w-5" />
                      Severity Assessment
                    </CardTitle>
                    <CardDescription>Evaluate the patient's current condition</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    {/* Pain Level */}
                    <motion.div variants={fadeIn} className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <AlertCircle className="h-4 w-4" />
                        Pain Level: <span className="font-bold">{formData.painLevel}/10</span>
                      </label>
                      <div className="bg-gradient-to-r from-green-100 via-yellow-100 to-red-100 dark:from-green-900/30 dark:via-yellow-900/30 dark:to-red-900/30 p-4 rounded-lg">
                        <Slider
                          min={0}
                          max={10}
                          step={1}
                          value={[formData.painLevel]}
                          onValueChange={(value) => handleSliderChange("painLevel", value)}
                          className="[&>span:first-child]:h-3"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                          <span>No Pain</span>
                          <span>Moderate</span>
                          <span>Worst Pain</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Breathing Difficulty */}
                    <motion.div variants={fadeIn} className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <Lungs className="h-4 w-4" />
                        Breathing Difficulty: <span className="font-bold">{formData.breathingDifficulty}/5</span>
                      </label>
                      <div className="bg-gradient-to-r from-green-100 to-red-100 dark:from-green-900/30 dark:to-red-900/30 p-4 rounded-lg">
                        <Slider
                          min={1}
                          max={5}
                          step={1}
                          value={[formData.breathingDifficulty]}
                          onValueChange={(value) => handleSliderChange("breathingDifficulty", value)}
                          className="[&>span:first-child]:h-3"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                          <span>No Difficulty</span>
                          <span>Unable to Breathe</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Distress Level */}
                    <motion.div variants={fadeIn} className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="h-4 w-4" />
                        Distress Level
                      </label>
                      <Select
                        value={formData.distressLevel}
                        onValueChange={(value) => handleSelectChange("distressLevel", value)}
                      >
                        <SelectTrigger className="border-amber-200 dark:border-amber-800/50">
                          <SelectValue placeholder="Select distress level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mildly Concerned">Mildly Concerned</SelectItem>
                          <SelectItem value="Moderately Concerned">Moderately Concerned</SelectItem>
                          <SelectItem value="Very Concerned">Very Concerned</SelectItem>
                          <SelectItem value="Panicked">Panicked</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>

                    {/* Consciousness */}
                    <motion.div variants={fadeIn} className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <Brain className="h-4 w-4" />
                        Level of Consciousness
                      </label>
                      <Select
                        value={formData.consciousness}
                        onValueChange={(value) => handleSelectChange("consciousness", value)}
                      >
                        <SelectTrigger className="border-amber-200 dark:border-amber-800/50">
                          <SelectValue placeholder="Select consciousness level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Alert and Oriented">Alert and Oriented</SelectItem>
                          <SelectItem value="Confused">Confused</SelectItem>
                          <SelectItem value="Drowsy">Drowsy</SelectItem>
                          <SelectItem value="Unresponsive">Unresponsive</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/30">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("medical")}
                      className="border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/50"
                    >
                      Previous
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing Emergency Call
                        </>
                      ) : (
                        "Submit Emergency Call"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </form>

        {/* AI Response */}
        <AnimatePresence>
          {aiResponse && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="mt-8"
            >
              <Card className="border-2 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${getPriorityGradient(aiResponse.triagePriority)}`} />
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ambulance
                        className={`h-5 w-5 ${
                          aiResponse.triagePriority === "Immediate"
                            ? "text-red-600 dark:text-red-400"
                            : aiResponse.triagePriority === "Urgent"
                            ? "text-orange-600 dark:text-orange-400"
                            : aiResponse.triagePriority === "Delayed"
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-green-600 dark:text-green-400"
                        }`}
                      />
                      AI-Generated Emergency Assessment
                    </div>
                    <Badge className={`${getPriorityColor(aiResponse.triagePriority)} text-white`}>
                      {aiResponse.triagePriority} Priority
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-slate-500" />
                      Emergency Summary
                    </h3>
                    <div className="space-y-4">
                      <p className="text-sm bg-slate-50 dark:bg-slate-800/50 p-3 rounded-md border border-slate-200 dark:border-slate-700">
                        {aiResponse.summary}
                      </p>
                    </div>
                  </motion.div>

                  <Separator />

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-slate-500" />
                      Medical Recommendations
                    </h3>
                    <div className="space-y-2">
                      <p className="text-sm bg-slate-50 dark:bg-slate-800/50 p-3 rounded-md border border-slate-200 dark:border-slate-700">
                        {aiResponse.recommendations}
                      </p>
                    </div>
                  </motion.div>
                </CardContent>
                <CardFooter className="border-t bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                  <Button className={`w-full bg-gradient-to-r ${getPriorityGradient(aiResponse.triagePriority)}`}>
                    <Ambulance className="mr-2 h-4 w-4" />
                    Route to Emergency Services
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default CreateEmergencyCall

