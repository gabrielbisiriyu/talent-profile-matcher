
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, FileText, CheckCircle } from "lucide-react";

export const JobUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parsedData, setParsedData] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(pdf|docx|txt)$/i)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOCX, or TXT file",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      setParsedData(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Missing file",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Authentication error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("company_id", user.id);
      formData.append("file", file);

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch("http://localhost:8000/parse_job/", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Upload failed");
      }

      const data = await response.json();
      setParsedData(data);
      
      toast({
        title: "Job posting parsed successfully!",
        description: "Your job description has been processed and embeddings generated",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="job-file" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Job Description (PDF, DOCX, or TXT)</span>
          </Label>
          <Input
            id="job-file"
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            className="bg-white/80 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
        </div>

        {file && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">{file.name}</p>
                  <p className="text-sm text-green-600">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processing job description...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          {isUploading ? (
            "Processing..."
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Parse Job Description
            </>
          )}
        </Button>
      </div>

      {parsedData && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">Job Description Parsed Successfully</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Job Information</h4>
                <div className="bg-white/60 p-3 rounded-lg">
                  <p className="text-sm"><strong>Job ID:</strong> {parsedData.job_id}</p>
                  <p className="text-sm"><strong>Title:</strong> {parsedData.parsed_job?.jobTitle || "N/A"}</p>
                  <p className="text-sm"><strong>Company:</strong> {parsedData.parsed_job?.company || "N/A"}</p>
                  <p className="text-sm"><strong>Location:</strong> {parsedData.parsed_job?.location || "N/A"}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-blue-900 mb-2">Required Skills</h4>
                <div className="bg-white/60 p-3 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {parsedData.parsed_job?.requiredSkills?.map((skill: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-blue-900 mb-2">AI Embeddings Generated</h4>
                <div className="bg-white/60 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    ✅ Job description embeddings: {parsedData.embeddings?.cv_emb?.length || 0} dimensions<br/>
                    ✅ Required skills embeddings: {parsedData.embeddings?.skill_emb?.length || 0} dimensions<br/>
                    ✅ Roles & responsibilities embeddings: {parsedData.embeddings?.exp_emb?.length || 0} dimensions
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
