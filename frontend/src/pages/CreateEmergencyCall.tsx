// src/pages/CreateEmergencyCall.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, FileText, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import axios from 'axios';

interface Vitals {
  deviceType: string;
  heartRate: number;
  bloodPressure: string;
  spO2: number;
  temperature: number;
}

interface EmergencyFormData {
  description: string;
  vitals: Vitals;
  medicalReportSummary: string;
  painLevel: number;
  breathingDifficulty: number;
  distressLevel: string;
  consciousness: string;
}

interface AIResponse {
  summary: string;
  triagePriority: string;
  recommendations: string;
}

const WEARABLE_DEVICES = [
  { name: 'Apple Watch Series 8', id: 'apple-watch-8' },
  { name: 'Fitbit Sense 2', id: 'fitbit-sense-2' },
  { name: 'Samsung Galaxy Watch 5', id: 'samsung-watch-5' },
  { name: 'Garmin Venu 2 Plus', id: 'garmin-venu-2' },
  { name: 'Oura Ring Gen 3', id: 'oura-ring-3' },
];

const CreateEmergencyCall: React.FC = () => {
  const [formData, setFormData] = useState<EmergencyFormData>({
    description: '',
    vitals: {
      deviceType: '',
      heartRate: 0,
      bloodPressure: '',
      spO2: 0,
      temperature: 0
    },
    medicalReportSummary: '',
    painLevel: 0,
    breathingDifficulty: 1,
    distressLevel: 'Mildly Concerned',
    consciousness: 'Alert and Oriented'
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [isLoadingVitals, setIsLoadingVitals] = useState(false);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSliderChange = (name: string, value: number[]) => {
    setFormData(prev => ({ ...prev, [name]: value[0] }));
  };

  const handleDeviceSelect = (deviceType: string) => {
    setFormData(prev => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        deviceType
      }
    }));
  };

  const fetchVitals = () => {
    if (!formData.vitals.deviceType) {
      setError('Please select a wearable device first');
      return;
    }
    
    setIsLoadingVitals(true);
    setError(null);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Generate random but realistic vitals
      const mockVitals = {
        heartRate: Math.floor(Math.random() * (120 - 60) + 60),
        bloodPressure: `${Math.floor(Math.random() * (140 - 110) + 110)}/${Math.floor(Math.random() * (90 - 70) + 70)}`,
        spO2: Math.floor(Math.random() * (100 - 94) + 94),
        temperature: Number(((Math.random() * (37.8 - 36.5) + 36.5)).toFixed(1))
      };
      
      setFormData(prev => ({
        ...prev,
        vitals: {
          ...prev.vitals,
          ...mockVitals
        }
      }));
      
      setIsLoadingVitals(false);
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      analyzeReport(e.target.files[0]);
    }
  };

  const analyzeReport = async (file: File) => {
    setIsLoadingReport(true);
    setError(null);
    
    // In a real app, we would upload and process the PDF here
    // For now, we'll simulate this with a timeout
    try {
      // Simulated API response
      setTimeout(() => {
        const mockSummary = "Patient has a history of hypertension and type 2 diabetes. " +
          "Recent lab work shows elevated HbA1c (7.8%) and cholesterol levels. " +
          "Currently taking Metformin 1000mg BID, Lisinopril 20mg daily, and Atorvastatin 40mg at night. " +
          "Recent ECG showed normal sinus rhythm with occasional PVCs. " +
          "Known allergen to penicillin and sulfa drugs.";
        
        setFormData(prev => ({
          ...prev,
          medicalReportSummary: mockSummary
        }));
        
        setIsLoadingReport(false);
      }, 2000);
      
      // In a real implementation:
      /*
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post('/api/emergency/analyze-report', formData);
      
      setFormData(prev => ({
        ...prev,
        medicalReportSummary: response.data.summary
      }));
      
      setIsLoadingReport(false);
      */
    } catch (error) {
      setError('Error analyzing medical report');
      setIsLoadingReport(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        setIsSubmitting(false);
        return;
      }

      // Configure axios with auth header
      axios.defaults.headers.common['token'] = token;

      // Real API call to backend using the correct endpoint
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

      setAiResponse({
        summary: response.data.aiResponse.summary,
        triagePriority: response.data.aiResponse.triagePriority,
        recommendations: response.data.aiResponse.recommendations
      });
      setIsSubmitting(false);
    } catch (error: any) {
      console.error('Error details:', error);
      setError(error.response?.data?.msg || 'Error submitting emergency call');
      setIsSubmitting(false);
    }
  };
  
  const determineTriagePriority = () => {
    // Simple logic to determine triage priority
    const { painLevel, breathingDifficulty, distressLevel, consciousness } = formData;
    
    if (breathingDifficulty >= 4 || consciousness === 'Unresponsive') {
      return 'Immediate';
    } else if (painLevel >= 8 || distressLevel === 'Panicked' || consciousness === 'Drowsy') {
      return 'Urgent';
    } else if (painLevel >= 5 || breathingDifficulty >= 3 || distressLevel === 'Very Concerned') {
      return 'Delayed';
    } else {
      return 'Minimal';
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Immediate': return 'bg-red-600';
      case 'Urgent': return 'bg-orange-500';
      case 'Delayed': return 'bg-yellow-500';
      case 'Minimal': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Create Emergency Medical Call</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          {/* Description Section */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Description</CardTitle>
              <CardDescription>Provide a detailed description of the medical emergency</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                name="description"
                placeholder="Describe the medical emergency in detail..."
                className="min-h-32"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </CardContent>
          </Card>
          
          {/* Vitals Section */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Vitals</CardTitle>
              <CardDescription>Connect to wearable device to fetch current vital signs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Select onValueChange={(value) => handleDeviceSelect(value)}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Select wearable device" />
                    </SelectTrigger>
                    <SelectContent>
                      {WEARABLE_DEVICES.map(device => (
                        <SelectItem key={device.id} value={device.id}>{device.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    onClick={fetchVitals} 
                    disabled={isLoadingVitals || !formData.vitals.deviceType}
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
                
                {formData.vitals.heartRate > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-2xl font-bold">{formData.vitals.heartRate} <span className="text-sm font-normal">bpm</span></p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-2xl font-bold">{formData.vitals.bloodPressure}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium">SpO2</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-2xl font-bold">{formData.vitals.spO2}<span className="text-sm font-normal">%</span></p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-medium">Temperature</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-2xl font-bold">{formData.vitals.temperature}<span className="text-sm font-normal">°C</span></p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Medical Report Section */}
          <Card>
            <CardHeader>
              <CardTitle>Medical Report</CardTitle>
              <CardDescription>Upload the patient's most recent medical report (PDF)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Input 
                  type="file" 
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="max-w-sm"
                />
                {file && <Badge variant="outline" className="text-xs">{file.name}</Badge>}
              </div>
              
              {isLoadingReport && (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Analyzing medical report...</span>
                </div>
              )}
              
              {formData.medicalReportSummary && (
                <Card className="bg-muted/50">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Report Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm">{formData.medicalReportSummary}</p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
          
          {/* Severity Assessment Section */}
          <Card>
            <CardHeader>
              <CardTitle>Severity Assessment</CardTitle>
              <CardDescription>Evaluate the patient's current condition</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pain Level */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Pain Level: {formData.painLevel}/10
                </label>
                <Slider
                  min={0}
                  max={10}
                  step={1}
                  value={[formData.painLevel]}
                  onValueChange={(value) => handleSliderChange('painLevel', value)}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>No Pain</span>
                  <span>Worst Pain</span>
                </div>
              </div>
              
              {/* Breathing Difficulty */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Breathing Difficulty: {formData.breathingDifficulty}/5
                </label>
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={[formData.breathingDifficulty]}
                  onValueChange={(value) => handleSliderChange('breathingDifficulty', value)}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>No Difficulty</span>
                  <span>Unable to Breathe</span>
                </div>
              </div>
              
              {/* Distress Level */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Distress Level</label>
                <Select 
                  value={formData.distressLevel} 
                  onValueChange={(value) => handleSelectChange('distressLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select distress level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mildly Concerned">Mildly Concerned</SelectItem>
                    <SelectItem value="Moderately Concerned">Moderately Concerned</SelectItem>
                    <SelectItem value="Very Concerned">Very Concerned</SelectItem>
                    <SelectItem value="Panicked">Panicked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Consciousness */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Level of Consciousness</label>
                <Select 
                  value={formData.consciousness} 
                  onValueChange={(value) => handleSelectChange('consciousness', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select consciousness level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alert and Oriented">Alert and Oriented</SelectItem>
                    <SelectItem value="Confused">Confused</SelectItem>
                    <SelectItem value="Drowsy">Drowsy</SelectItem>
                    <SelectItem value="Unresponsive">Unresponsive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          {/* Submit Button */}
          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Emergency Call
              </>
            ) : (
              "Submit Emergency Call"
            )}
          </Button>
        </div>
      </form>
      
      {/* AI Response */}
      {aiResponse && (
        <Card className="mt-8 border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              AI-Generated Emergency Assessment
              <Badge className={`${getPriorityColor(aiResponse.triagePriority)} text-white`}>
                {aiResponse.triagePriority} Priority
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Summary</h3>
              <p className="text-sm">{aiResponse.summary}</p>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-semibold mb-2">Recommendations</h3>
              <p className="text-sm">{aiResponse.recommendations}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Route to Emergency Services
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default CreateEmergencyCall;
