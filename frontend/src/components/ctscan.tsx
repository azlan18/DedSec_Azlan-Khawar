import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Brain, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Prediction {
  [key: string]: number;
}

const CTScanAnalysis: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction | null>(null);
  const [predictedClass, setPredictedClass] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const handleFileChange = (uploadedFile: File | null) => {
    setFile(uploadedFile);
    setError(null);
    
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(uploadedFile);
    } else {
      setImagePreview(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload a CT scan image first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const apiUrl = "http://127.0.0.1:4001";
      
      const response = await fetch(`${apiUrl}/analyzectscan`, {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'same-origin'
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to analyze CT scan");
        } else {
          const text = await response.text();
          throw new Error(`Server error: ${response.status} - ${text.substring(0, 100)}...`);
        }
      }

      const data = await response.json();
      setPredictions(data.predictions);
      setPredictedClass(data.predicted_class);
      setConfidence(data.confidence);
      setAiAnalysis(data.ai_analysis);
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err instanceof Error ? 
        `Error: ${err.message}. Make sure the Flask server is running on port 5001.` : 
        "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!predictions) return;
    
    const csv = "Finding,Probability\n" + 
      Object.entries(predictions)
        .map(([label, prob]) => `${label},${(prob * 100).toFixed(2)}%`)
        .join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ct_scan_findings.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-primary">
          CT Scan Analysis Assistant
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Upload a CT scan image for automated disease detection and AI-assisted analysis using advanced machine learning
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Upload CT Scan Image</CardTitle>
            <CardDescription className="text-base">
              Supported formats: JPG, JPEG, PNG
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="w-full">
                <div className="border-2 border-dashed border-primary/20 rounded-lg p-6 hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center justify-center w-full"
                  >
                    {imagePreview ? (
                      <div className="relative w-full aspect-square max-h-80 overflow-hidden rounded-lg">
                        <img
                          src={imagePreview}
                          alt="CT Scan preview"
                          className="object-contain w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Brain className="h-12 w-12 text-primary mb-4" />
                        <p className="text-lg text-muted-foreground">Click to upload or drag and drop</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              <Button 
                onClick={handleAnalyze} 
                disabled={loading || !file}
                className="w-full max-w-md text-lg py-6"
                size="lg"
              >
                {loading ? "Analyzing..." : "Analyze CT Scan"}
              </Button>
              
              {error && (
                <Alert variant="destructive" className="w-full">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Analysis Results</CardTitle>
            <CardDescription className="text-base">
              Model predictions and AI-assisted interpretation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : predictions ? (
              <Tabs defaultValue="predictions" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="predictions">Predictions</TabsTrigger>
                  <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                </TabsList>
                <TabsContent value="predictions" className="space-y-6">
                  {predictedClass && confidence && (
                    <div className="mb-6 p-4 bg-primary/10 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Primary Detection</h3>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xl font-bold text-primary">{predictedClass}</span>
                        <span className="text-lg font-medium bg-primary/20 px-3 py-1 rounded-full">
                          {(confidence * 100).toFixed(1)}% confidence
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleDownloadCSV}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download as CSV
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-base font-medium">All Detected Conditions</h3>
                    {Object.entries(predictions).map(([disease, probability]) => (
                      <div key={disease} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{disease}</span>
                          <span className="text-sm text-primary font-medium">
                            {(probability * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={probability * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="analysis">
                  <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
                    {aiAnalysis ? (
                      <div className="text-base space-y-4">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
                            p: ({ node, ...props }) => <p className="text-base leading-7 mb-4" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                            li: ({ node, ...props }) => <li className="text-base" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-bold text-primary" {...props} />,
                            em: ({ node, ...props }) => <em className="italic text-primary/80" {...props} />,
                            blockquote: ({ node, ...props }) => (
                              <blockquote className="border-l-4 border-primary pl-4 italic my-4" {...props} />
                            ),
                            code: ({ node, inline, ...props }) => 
                              inline ? (
                                <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props} />
                              ) : (
                                <code className="block bg-muted p-4 rounded-lg text-sm my-4" {...props} />
                              ),
                          }}
                        >
                          {aiAnalysis}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-muted-foreground italic text-base">
                        No AI analysis available. Please analyze a CT scan image first.
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 text-center">
                <Brain className="h-12 w-12 text-primary/50 mb-4" />
                <p className="text-lg text-muted-foreground">
                  Upload and analyze a CT scan to see the results
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">About this tool</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-muted-foreground">
            This CT scan analysis tool uses a deep learning model trained to detect three major conditions: aneurysms, cancer, and tumors.
            The AI analysis is generated using Google's Gemini 1.5 Pro model to provide radiologist-like interpretations.
            This tool is for educational purposes only and should not replace professional medical advice.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CTScanAnalysis;