import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, CheckCircle } from "lucide-react";
import { fetchCandidateData } from "@/lib/fetchCandidateData";



export const CVUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parsedData, setParsedData] = useState<any>(null);
  const [wasDuplicate, setWasDuplicate] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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
      setWasDuplicate(false);
    }
  };

  const storeParsedDataInDatabase = async (data: any) => {
    if (!user?.id || !data.parsed_cv) return;

    try {
      const personalInfo = data.parsed_cv.personalInfo?.[0] || {};
      
      // Prepare the data for insertion/update
      const candidateData = {
        id: user.id,
        address: personalInfo.location !== "null" ? personalInfo.location : null,
        email_from_cv: personalInfo.emailAddress !== "null" ? personalInfo.emailAddress : null,
        phone_number: personalInfo.telephoneNumber !== "null" ? personalInfo.telephoneNumber : null,
        github_url: personalInfo.github !== "null" ? personalInfo.github : null,
        linkedin_url: personalInfo.linkedin !== "null" ? personalInfo.linkedin : null,
        skills: data.parsed_cv.skills || [],
        education: data.parsed_cv.educatipn || [], // Note: keeping the typo from API
        work_experience: data.parsed_cv.experience || [],
        certifications: data.parsed_cv.certificates || [],
        cv_hash: data.hash,
        cv_id: data.cv_id || null, // <-- add this line
        parsed_cv_data: data.parsed_cv,
        cv_embeddings: data.embeddings,
        updated_at: new Date().toISOString()
      };

      // Use upsert to insert or update
      const { error } = await supabase
        .from('candidates')
        .upsert(candidateData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('Error storing candidate data:', error);
        throw error;
      }

      console.log('Successfully stored parsed CV data in database');
    } catch (error) {
      console.error('Error storing parsed data:', error);
      toast({
        title: "Warning",
        description: "CV parsed successfully but failed to save profile data",
        variant: "destructive",
      });
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
      formData.append("user_id", user.id);
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

      if (data.is_duplicate) {
        setWasDuplicate(true);
        toast({
          title: "CV already exists",
          description: "This CV was uploaded before. Showing the existing parsed result.",
        });
      } else {
        setWasDuplicate(false);
        toast({
          title: "CV parsed successfully!",
          description: "Your CV has been processed and profile updated.",
        });
      }
      
      setParsedData(data);
      
      // Store the parsed data in the database
      await storeParsedDataInDatabase(data);
      
      // ✅ MANUAL REFRESH
      const updatedCandidate = await fetchCandidateData(user.id);
      console.log("🔁 Manually fetched latest profile after CV upload:", updatedCandidate);
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
          disabled={!file || isUploading}
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
                  {parsedData.parsed_cv?.personalInfo?.length > 0 ? (
                    <>
                      <p className="text-sm"><strong>Name:</strong> {parsedData.parsed_cv.personalInfo[0].name || "N/A"}</p>
                      <p className="text-sm"><strong>Email:</strong> {parsedData.parsed_cv.personalInfo[0].emailAddress || "N/A"}</p>
                      <p className="text-sm"><strong>Phone:</strong> {parsedData.parsed_cv.personalInfo[0].telephoneNumber || "N/A"}</p>
                      <p className="text-sm"><strong>GitHub:</strong> {parsedData.parsed_cv.personalInfo[0].github || "N/A"}</p>
                      <p className="text-sm"><strong>LinkedIn:</strong> {parsedData.parsed_cv.personalInfo[0].linkedin || "N/A"}</p>
                    </>
                  ) : (
                    <p className="text-sm text-red-600">No personal information found.</p>
                  )}
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
