"use client"

import { CardFooter } from "@/components/ui/card"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import axios from "axios"
import { User, Shield, MapPin, Heart, Phone, AlertCircle, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"

// Define the form schema with Zod
const formSchema = z
  .object({
    // Basic Information
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z.string(),
    phone: z.string().min(10, { message: "Please enter a valid phone number." }),
    address: z.string().min(5, { message: "Address must be at least 5 characters." }),
    pincode: z.string().min(6, { message: "Please enter a valid pincode." }),

    // Location (will be filled programmatically)
    locationCoordinates: z
      .object({
        lat: z.number().optional(),
        lng: z.number().optional(),
      })
      .optional(),

    // Medical Information
    age: z.string().transform((val) => Number.parseInt(val, 10)),
    gender: z.enum(["Male", "Female", "Other"]),
    chronicConditions: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    currentMedications: z.array(z.string()).optional(),
    bloodType: z.enum(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]),

    // Emergency Contacts
    emergencyContacts: z
      .array(
        z.object({
          name: z.string().min(2, { message: "Contact name must be at least 2 characters." }),
          phoneNumber: z.string().min(10, { message: "Please enter a valid phone number." }),
          relationship: z.string().min(2, { message: "Relationship must be at least 2 characters." }),
        }),
      )
      .min(1, { message: "At least one emergency contact is required." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export default function Registration() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [chronicConditionInput, setChronicConditionInput] = useState("")
  const [allergyInput, setAllergyInput] = useState("")
  const [medicationInput, setMedicationInput] = useState("")
  const [emergencyContactIndex, setEmergencyContactIndex] = useState(0)
  const navigate = useNavigate()

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      address: "",
      pincode: "",
      locationCoordinates: { lat: undefined, lng: undefined },
      age: "",
      gender: "Male",
      chronicConditions: [],
      allergies: [],
      currentMedications: [],
      bloodType: "O+",
      emergencyContacts: [{ name: "", phoneNumber: "", relationship: "" }],
    },
  })

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setValue("locationCoordinates", {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          toast.success("Location detected", {
            description: "Your current location has been added to the form.",
          })
        },
        (error) => {
          toast.error("Location error", {
            description: "Unable to get your location. Please try again.",
          })
          console.error("Error getting location:", error)
        },
      )
    } else {
      toast.error("Geolocation not supported", {
        description: "Your browser doesn't support geolocation.",
      })
    }
  }

  // Add chronic condition
  const addChronicCondition = () => {
    if (chronicConditionInput.trim() !== "") {
      const currentConditions = form.getValues("chronicConditions") || []
      form.setValue("chronicConditions", [...currentConditions, chronicConditionInput.trim()])
      setChronicConditionInput("")
    }
  }

  // Add allergy
  const addAllergy = () => {
    if (allergyInput.trim() !== "") {
      const currentAllergies = form.getValues("allergies") || []
      form.setValue("allergies", [...currentAllergies, allergyInput.trim()])
      setAllergyInput("")
    }
  }

  // Add medication
  const addMedication = () => {
    if (medicationInput.trim() !== "") {
      const currentMedications = form.getValues("currentMedications") || []
      form.setValue("currentMedications", [...currentMedications, medicationInput.trim()])
      setMedicationInput("")
    }
  }

  // Add emergency contact
  const addEmergencyContact = () => {
    const currentContacts = form.getValues("emergencyContacts")
    form.setValue("emergencyContacts", [...currentContacts, { name: "", phoneNumber: "", relationship: "" }])
    setEmergencyContactIndex(currentContacts.length)
  }

  // Remove item from array
  const removeItem = (array: string[], index: number, fieldName: string) => {
    const newArray = [...array]
    newArray.splice(index, 1)
    form.setValue(fieldName as any, newArray)
  }

  // Remove emergency contact
  const removeEmergencyContact = (index: number) => {
    const currentContacts = form.getValues("emergencyContacts")
    if (currentContacts.length > 1) {
      const newContacts = [...currentContacts]
      newContacts.splice(index, 1)
      form.setValue("emergencyContacts", newContacts)
      if (emergencyContactIndex >= index && emergencyContactIndex > 0) {
        setEmergencyContactIndex(emergencyContactIndex - 1)
      }
    } else {
      toast.info("Cannot remove", {
        description: "At least one emergency contact is required.",
      })
    }
  }

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)

      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registrationData } = values

      // Send registration data to API
      const response = await axios.post("http://localhost:5000/api/users/register", registrationData)

      // Store token in localStorage
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token)

        toast.success("Registration successful!", {
          description: "Your account has been created successfully.",
        })

        // Redirect to dashboard or home page
        navigate("/dashboard")
      }
    } catch (error: any) {
      console.error("Registration error:", error)
      toast.error("Registration failed", {
        description: error.response?.data?.msg || "An error occurred during registration.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Next step handler
  const handleNextStep = async () => {
    let canProceed = false

    if (step === 1) {
      const basicFields = ["name", "email", "password", "confirmPassword", "phone", "address", "pincode"]
      const result = await form.trigger(basicFields as any)
      canProceed = result
    } else if (step === 2) {
      const medicalFields = ["age", "gender", "bloodType"]
      const result = await form.trigger(medicalFields as any)
      canProceed = result
    } else if (step === 3) {
      const emergencyFields = ["emergencyContacts"]
      const result = await form.trigger(emergencyFields as any)
      canProceed = result
    }

    if (canProceed && step < totalSteps) {
      setStep(step + 1)
    }
  }

  // Previous step handler
  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Heart className="h-6 w-6" />
            <CardTitle className="text-2xl font-bold">Medical Emergency Response System</CardTitle>
          </div>
          <CardDescription className="text-blue-100">
            Register to get immediate medical assistance during emergencies
          </CardDescription>
          <Progress value={progress} className="h-2 mt-4 bg-blue-200" />
        </CardHeader>

        <CardContent className="pt-6">
          <Tabs value={`step-${step}`} className="w-full">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger
                value="step-1"
                className={`flex items-center justify-center gap-2 ${step >= 1 ? "data-[state=active]:bg-blue-600 data-[state=active]:text-white" : ""}`}
                disabled
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Basic Info</span>
              </TabsTrigger>
              <TabsTrigger
                value="step-2"
                className={`flex items-center justify-center gap-2 ${step >= 2 ? "data-[state=active]:bg-blue-600 data-[state=active]:text-white" : ""}`}
                disabled
              >
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Medical Info</span>
              </TabsTrigger>
              <TabsTrigger
                value="step-3"
                className={`flex items-center justify-center gap-2 ${step >= 3 ? "data-[state=active]:bg-blue-600 data-[state=active]:text-white" : ""}`}
                disabled
              >
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">Emergency Contacts</span>
              </TabsTrigger>
              <TabsTrigger
                value="step-4"
                className={`flex items-center justify-center gap-2 ${step >= 4 ? "data-[state=active]:bg-blue-600 data-[state=active]:text-white" : ""}`}
                disabled
              >
                <CheckCircle2 className="h-4 w-4" />
                <span className="hidden sm:inline">Review</span>
              </TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Basic Information */}
                <TabsContent value="step-1" className={step === 1 ? "block" : "hidden"}>
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-xl font-semibold text-blue-700 mb-4">
                      <User className="h-5 w-5" />
                      <h2>Basic Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john.doe@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="******" {...field} />
                            </FormControl>
                            <FormDescription>Must be at least 6 characters.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="******" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+91 9876543210" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="123 Main St, Apartment 4B" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="pincode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pincode</FormLabel>
                            <FormControl>
                              <Input placeholder="400001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex items-center gap-2"
                          onClick={getCurrentLocation}
                        >
                          <MapPin className="h-4 w-4" />
                          <span>Get Current Location</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Step 2: Medical Information */}
                <TabsContent value="step-2" className={step === 2 ? "block" : "hidden"}>
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-xl font-semibold text-blue-700 mb-4">
                      <Heart className="h-5 w-5" />
                      <h2>Medical Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="30" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bloodType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Blood Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select blood type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="A+">A+</SelectItem>
                                <SelectItem value="A-">A-</SelectItem>
                                <SelectItem value="B+">B+</SelectItem>
                                <SelectItem value="B-">B-</SelectItem>
                                <SelectItem value="O+">O+</SelectItem>
                                <SelectItem value="O-">O-</SelectItem>
                                <SelectItem value="AB+">AB+</SelectItem>
                                <SelectItem value="AB-">AB-</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormItem>
                        <FormLabel>Chronic Conditions</FormLabel>
                        <div className="flex gap-2">
                          <Input
                            placeholder="E.g., Diabetes"
                            value={chronicConditionInput}
                            onChange={(e) => setChronicConditionInput(e.target.value)}
                          />
                          <Button type="button" onClick={addChronicCondition} variant="outline">
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {form.watch("chronicConditions")?.map((condition, index) => (
                            <div
                              key={index}
                              className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1"
                            >
                              <span>{condition}</span>
                              <button
                                type="button"
                                className="ml-2 text-blue-600 hover:text-blue-800"
                                onClick={() =>
                                  removeItem(form.getValues("chronicConditions") || [], index, "chronicConditions")
                                }
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </FormItem>

                      <FormItem>
                        <FormLabel>Allergies</FormLabel>
                        <div className="flex gap-2">
                          <Input
                            placeholder="E.g., Penicillin"
                            value={allergyInput}
                            onChange={(e) => setAllergyInput(e.target.value)}
                          />
                          <Button type="button" onClick={addAllergy} variant="outline">
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {form.watch("allergies")?.map((allergy, index) => (
                            <div
                              key={index}
                              className="flex items-center bg-red-100 text-red-800 rounded-full px-3 py-1"
                            >
                              <span>{allergy}</span>
                              <button
                                type="button"
                                className="ml-2 text-red-600 hover:text-red-800"
                                onClick={() => removeItem(form.getValues("allergies") || [], index, "allergies")}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </FormItem>

                      <FormItem>
                        <FormLabel>Current Medications</FormLabel>
                        <div className="flex gap-2">
                          <Input
                            placeholder="E.g., Aspirin"
                            value={medicationInput}
                            onChange={(e) => setMedicationInput(e.target.value)}
                          />
                          <Button type="button" onClick={addMedication} variant="outline">
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {form.watch("currentMedications")?.map((medication, index) => (
                            <div
                              key={index}
                              className="flex items-center bg-green-100 text-green-800 rounded-full px-3 py-1"
                            >
                              <span>{medication}</span>
                              <button
                                type="button"
                                className="ml-2 text-green-600 hover:text-green-800"
                                onClick={() =>
                                  removeItem(form.getValues("currentMedications") || [], index, "currentMedications")
                                }
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </FormItem>
                    </div>
                  </div>
                </TabsContent>

                {/* Step 3: Emergency Contacts */}
                <TabsContent value="step-3" className={step === 3 ? "block" : "hidden"}>
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-xl font-semibold text-blue-700 mb-4">
                      <Phone className="h-5 w-5" />
                      <h2>Emergency Contacts</h2>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Contact {emergencyContactIndex + 1}</h3>
                        <div className="flex gap-2">
                          {form.watch("emergencyContacts").length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeEmergencyContact(emergencyContactIndex)}
                            >
                              Remove
                            </Button>
                          )}
                          <Button type="button" variant="outline" size="sm" onClick={addEmergencyContact}>
                            Add New Contact
                          </Button>
                        </div>
                      </div>

                      {form.watch("emergencyContacts").length > 1 && (
                        <div className="flex gap-2 mb-4">
                          {form.watch("emergencyContacts").map((_, index) => (
                            <Button
                              key={index}
                              type="button"
                              variant={index === emergencyContactIndex ? "default" : "outline"}
                              size="sm"
                              onClick={() => setEmergencyContactIndex(index)}
                            >
                              Contact {index + 1}
                            </Button>
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name={`emergencyContacts.${emergencyContactIndex}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Jane Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`emergencyContacts.${emergencyContactIndex}.phoneNumber`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="+91 9876543210" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`emergencyContacts.${emergencyContactIndex}.relationship`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Relationship</FormLabel>
                            <FormControl>
                              <Input placeholder="Spouse, Parent, Friend, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Step 4: Review Information */}
                <TabsContent value="step-4" className={step === 4 ? "block" : "hidden"}>
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-xl font-semibold text-blue-700 mb-4">
                      <CheckCircle2 className="h-5 w-5" />
                      <h2>Review Your Information</h2>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Name:</span> {form.watch("name")}
                          </div>
                          <div>
                            <span className="font-medium">Email:</span> {form.watch("email")}
                          </div>
                          <div>
                            <span className="font-medium">Phone:</span> {form.watch("phone")}
                          </div>
                          <div>
                            <span className="font-medium">Pincode:</span> {form.watch("pincode")}
                          </div>
                          <div className="md:col-span-2">
                            <span className="font-medium">Address:</span> {form.watch("address")}
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                          <Heart className="h-4 w-4" />
                          Medical Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Age:</span> {form.watch("age")}
                          </div>
                          <div>
                            <span className="font-medium">Gender:</span> {form.watch("gender")}
                          </div>
                          <div>
                            <span className="font-medium">Blood Type:</span> {form.watch("bloodType")}
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          <div>
                            <span className="font-medium">Chronic Conditions:</span>
                            {form.watch("chronicConditions")?.length ? (
                              <div className="flex flex-wrap gap-2 mt-1">
                                {form.watch("chronicConditions")?.map((condition, index) => (
                                  <span
                                    key={index}
                                    className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs"
                                  >
                                    {condition}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-500 ml-2">None</span>
                            )}
                          </div>

                          <div>
                            <span className="font-medium">Allergies:</span>
                            {form.watch("allergies")?.length ? (
                              <div className="flex flex-wrap gap-2 mt-1">
                                {form.watch("allergies")?.map((allergy, index) => (
                                  <span key={index} className="bg-red-100 text-red-800 rounded-full px-3 py-1 text-xs">
                                    {allergy}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-500 ml-2">None</span>
                            )}
                          </div>

                          <div>
                            <span className="font-medium">Current Medications:</span>
                            {form.watch("currentMedications")?.length ? (
                              <div className="flex flex-wrap gap-2 mt-1">
                                {form.watch("currentMedications")?.map((medication, index) => (
                                  <span
                                    key={index}
                                    className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-xs"
                                  >
                                    {medication}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-500 ml-2">None</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Emergency Contacts
                        </h3>
                        <div className="space-y-4">
                          {form.watch("emergencyContacts")?.map((contact, index) => (
                            <div key={index} className="p-3 bg-white rounded border border-blue-200">
                              <h4 className="font-medium">Contact {index + 1}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm mt-1">
                                <div>
                                  <span className="font-medium">Name:</span> {contact.name}
                                </div>
                                <div>
                                  <span className="font-medium">Phone:</span> {contact.phoneNumber}
                                </div>
                                <div>
                                  <span className="font-medium">Relationship:</span> {contact.relationship}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center mb-4">
                          <Checkbox id="terms" className="mr-2" />
                          <label htmlFor="terms" className="text-sm">
                            I confirm that all the information provided is accurate and I agree to the terms and
                            conditions.
                          </label>
                        </div>
                        <div className="text-sm text-gray-600">
                          <AlertCircle className="h-4 w-4 inline-block mr-1" />
                          Your information will be used only for emergency medical purposes and will be kept
                          confidential.
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <div className="flex justify-between mt-6">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevStep}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                  )}

                  {step < totalSteps ? (
                    <Button type="button" onClick={handleNextStep} className="flex items-center gap-2 ml-auto">
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="flex items-center gap-2 ml-auto bg-green-600 hover:bg-green-700"
                      disabled={loading}
                    >
                      {loading ? "Registering..." : "Complete Registration"}
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </Tabs>
        </CardContent>

        <CardFooter className="border-t bg-gray-50 flex justify-center p-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Your data is encrypted and secure
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

