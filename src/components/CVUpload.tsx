
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle, User } from "lucide-react";

export const CVUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [userId, setUserId] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parsedData, setParsedData] = useState<any>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(pdf|docx)$/i)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or DOCX file",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      setParsedData(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !userId.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a user ID and select a file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("file", file);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch("http://localhost:8000/parse_cv/", {
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
        title: "CV parsed successfully!",
        description: "Your CV has been processed and embeddings generated",
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
          <Label htmlFor="userId" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>User ID</span>
          </Label>
          <Input
            id="userId"
            type="text"
            placeholder="Enter your unique user ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="bg-white/80"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cv-file" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>CV File (PDF or DOCX)</span>
          </Label>
          <div className="relative">
            <Input
              id="cv-file"
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="bg-white/80 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        {file && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">{file.name}</p>
                  <p className="text-sm text-blue-600">
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
              <span>Processing CV...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || !userId.trim() || isUploading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {isUploading ? (
            "Processing..."
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Parse CV
            </>
          )}
        </Button>
      </div>

      {parsedData && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">CV Parsed Successfully</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-green-900 mb-2">Personal Information</h4>
                <div className="bg-white/60 p-3 rounded-lg">
                  <p className="text-sm"><strong>Name:</strong> {parsedData.parsed_cv?.personalInfo?.name || "N/A"}</p>
                  <p className="text-sm"><strong>Email:</strong> {parsedData.parsed_cv?.personalInfo?.email || "N/A"}</p>
                  <p className="text-sm"><strong>Phone:</strong> {parsedData.parsed_cv?.personalInfo?.phone || "N/A"}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-green-900 mb-2">Skills Extracted</h4>
                <div className="bg-white/60 p-3 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {parsedData.parsed_cv?.skills?.map((skill: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-green-900 mb-2">AI Embeddings Generated</h4>
                <div className="bg-white/60 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    ✅ Document-level embeddings: {parsedData.embeddings?.cv_emb?.length || 0} dimensions<br/>
                    ✅ Skills embeddings: {parsedData.embeddings?.skill_emb?.length || 0} dimensions<br/>
                    ✅ Experience embeddings: {parsedData.embeddings?.exp_emb?.length || 0} dimensions
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
