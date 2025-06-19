
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { User, FileText, Github, Linkedin, Globe, Edit, Save, X, MapPin, Mail, GraduationCap, Briefcase, Award } from "lucide-react";

interface ParsedCVData {
  personalInfo: Array<{
    name: string;
    location: string;
    emailAddress: string;
    github: string;
    linkedin: string;
    telephoneNumber: string;
  }>;
  educatipn: Array<{
    school: string;
    degree: string;
    field: string;
  }>;
  experience: Array<{
    company: string;
    jobTitle: string;
    timeWorked: string;
    responsibilities: string;
  }>;
  skills: string[];
  certificates: string[];
}

interface CandidateData {
  bio: string;
  cv_file_url: string;
  cv_file_name: string;
  skills: string[];
  github_url: string;
  linkedin_url: string;
  portfolio_url: string;
  address: string;
  email_from_cv: string;
  phone_number: string;
  education: any;
  work_experience: any;
  certifications: string[];
  cv_hash: string;
}

export const CandidateProfile = () => {
  const [candidateData, setCandidateData] = useState<CandidateData | null>(null);
  const [parsedCVData, setParsedCVData] = useState<ParsedCVData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchCandidateData();
    }
  }, [user?.id]);

  const fetchCandidateData = async () => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching candidate data:', error);
        return;
      }

      if (data) {
        setCandidateData(data);
        setEditedBio(data.bio || "");
        
        // If we have a CV hash, try to fetch parsed CV data
        if (data.cv_hash) {
          await fetchParsedCVData(data.cv_hash);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchParsedCVData = async (cvHash: string) => {
    try {
      // Make a request to your FastAPI backend to get parsed CV data
      const response = await fetch(`http://localhost:8000/get_parsed_cv/${cvHash}`);
      if (response.ok) {
        const data = await response.json();
        setParsedCVData(data.parsed_cv);
      }
    } catch (error) {
      console.error('Error fetching parsed CV data:', error);
      // If the API call fails, we'll use the data stored in the database
    }
  };

  const handleSaveBio = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ bio: editedBio })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setCandidateData(prev => prev ? { ...prev, bio: editedBio } : null);
      setIsEditing(false);
      toast({
        title: "Bio updated",
        description: "Your bio has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update bio",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedBio(candidateData?.bio || "");
    setIsEditing(false);
  };

  // Get the primary personal info (first entry or fallback to database data)
  const personalInfo = parsedCVData?.personalInfo?.[0];
  const displayEmail = personalInfo?.emailAddress !== "null" ? personalInfo?.emailAddress : userProfile?.email;
  const displayAddress = personalInfo?.location !== "null" ? personalInfo?.location : candidateData?.address;
  const displayGithub = personalInfo?.github !== "null" ? personalInfo?.github : candidateData?.github_url;
  const displayLinkedin = personalInfo?.linkedin !== "null" ? personalInfo?.linkedin : candidateData?.linkedin_url;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 px-3 py-1 bg-blue-100 rounded-full hover:bg-blue-200">
          <User className="w-4 h-4 text-blue-700" />
          <span className="text-sm font-medium text-blue-700">
            {userProfile?.first_name} {userProfile?.last_name}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 max-h-[80vh]" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <span>Candidate Profile</span>
            </CardTitle>
          </CardHeader>
          <ScrollArea className="h-[60vh]">
            <CardContent className="space-y-4 pr-6">
              {/* Bio Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Bio</Label>
                  {!isEditing ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  ) : (
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSaveBio}
                        disabled={loading}
                        className="h-6 w-6 p-0"
                      >
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                {isEditing ? (
                  <Textarea
                    value={editedBio}
                    onChange={(e) => setEditedBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="min-h-[60px] text-sm"
                  />
                ) : (
                  <div className="bg-gray-50 p-2 rounded text-sm min-h-[60px]">
                    {candidateData?.bio || "No bio added yet"}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center space-x-1">
                  <Mail className="h-3 w-3" />
                  <span>Email</span>
                </Label>
                <div className="bg-gray-50 p-2 rounded text-sm">
                  {displayEmail || "No email available"}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>Address</span>
                </Label>
                <div className="bg-gray-50 p-2 rounded text-sm">
                  {displayAddress || "No address available"}
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Skills</Label>
                <div className="bg-gray-50 p-2 rounded min-h-[40px]">
                  {parsedCVData?.skills && parsedCVData.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {parsedCVData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : candidateData?.skills && candidateData.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {candidateData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No skills available</div>
                  )}
                </div>
              </div>

              {/* Education */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center space-x-1">
                  <GraduationCap className="h-3 w-3" />
                  <span>Education</span>
                </Label>
                <div className="bg-gray-50 p-2 rounded text-sm space-y-2">
                  {parsedCVData?.educatipn && parsedCVData.educatipn.length > 0 ? (
                    parsedCVData.educatipn.map((edu, index) => (
                      <div key={index} className="border-b border-gray-200 last:border-b-0 pb-2 last:pb-0">
                        <div className="font-medium">{edu.degree} in {edu.field}</div>
                        <div className="text-xs text-gray-600">{edu.school}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No education information available</div>
                  )}
                </div>
              </div>

              {/* Work Experience */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center space-x-1">
                  <Briefcase className="h-3 w-3" />
                  <span>Work Experience</span>
                </Label>
                <div className="bg-gray-50 p-2 rounded text-sm space-y-3">
                  {parsedCVData?.experience && parsedCVData.experience.length > 0 ? (
                    parsedCVData.experience.map((exp, index) => (
                      <div key={index} className="border-b border-gray-200 last:border-b-0 pb-3 last:pb-0">
                        <div className="font-medium">{exp.jobTitle}</div>
                        <div className="text-xs text-blue-600 font-medium">{exp.company}</div>
                        <div className="text-xs text-gray-600 mb-1">{exp.timeWorked}</div>
                        {exp.responsibilities && exp.responsibilities !== "null" && (
                          <div className="text-xs text-gray-700 mt-1">{exp.responsibilities}</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No work experience available</div>
                  )}
                </div>
              </div>

              {/* Certifications */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center space-x-1">
                  <Award className="h-3 w-3" />
                  <span>Certifications</span>
                </Label>
                <div className="bg-gray-50 p-2 rounded text-sm">
                  {parsedCVData?.certificates && parsedCVData.certificates.length > 0 ? (
                    <div className="space-y-1">
                      {parsedCVData.certificates.map((cert, index) => (
                        <div key={index} className="text-sm">{cert}</div>
                      ))}
                    </div>
                  ) : candidateData?.certifications && candidateData.certifications.length > 0 ? (
                    <div className="space-y-1">
                      {candidateData.certifications.map((cert, index) => (
                        <div key={index} className="text-sm">{cert}</div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No certifications available</div>
                  )}
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-3">
                {/* GitHub */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium flex items-center space-x-1">
                    <Github className="h-3 w-3" />
                    <span>GitHub</span>
                  </Label>
                  {displayGithub && displayGithub !== "null" ? (
                    <a
                      href={displayGithub.startsWith('http') ? displayGithub : `https://${displayGithub}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-blue-600 hover:text-blue-800 underline p-2 bg-gray-50 rounded break-all"
                    >
                      {displayGithub}
                    </a>
                  ) : (
                    <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded">
                      No GitHub URL
                    </div>
                  )}
                </div>

                {/* LinkedIn */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium flex items-center space-x-1">
                    <Linkedin className="h-3 w-3" />
                    <span>LinkedIn</span>
                  </Label>
                  {displayLinkedin && displayLinkedin !== "null" ? (
                    <a
                      href={displayLinkedin.startsWith('http') ? displayLinkedin : `https://${displayLinkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-blue-600 hover:text-blue-800 underline p-2 bg-gray-50 rounded break-all"
                    >
                      {displayLinkedin}
                    </a>
                  ) : (
                    <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded">
                      No LinkedIn URL
                    </div>
                  )}
                </div>

                {/* Portfolio */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium flex items-center space-x-1">
                    <Globe className="h-3 w-3" />
                    <span>Portfolio</span>
                  </Label>
                  {candidateData?.portfolio_url ? (
                    <a
                      href={candidateData.portfolio_url.startsWith('http') ? candidateData.portfolio_url : `https://${candidateData.portfolio_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-blue-600 hover:text-blue-800 underline p-2 bg-gray-50 rounded break-all"
                    >
                      {candidateData.portfolio_url}
                    </a>
                  ) : (
                    <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded">
                      No Portfolio URL
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </ScrollArea>
        </Card>
      </PopoverContent>
    </Popover>
  );
};
