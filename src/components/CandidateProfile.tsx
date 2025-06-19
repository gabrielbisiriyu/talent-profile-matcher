
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { User, Github, Linkedin, Globe, Edit, Save, X, MapPin, Mail, GraduationCap, Briefcase, Award } from "lucide-react";

interface CandidateData {
  bio: string | null;
  skills: string[] | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  address: string | null;
  email_from_cv: string | null;
  phone_number: string | null;
  education: any; // Changed from any[] to any to match database Json type
  work_experience: any; // Changed from any[] to any to match database Json type
  certifications: string[] | null;
  parsed_cv_data: any;
}

export const CandidateProfile = () => {
  const [candidateData, setCandidateData] = useState<CandidateData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchCandidateData();
    }
  }, [user?.id]);

  // Listen for real-time updates to the candidates table
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('candidate-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'candidates',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('Candidate data updated:', payload);
          fetchCandidateData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const fetchCandidateData = async () => {
    if (!user?.id) return;
    
    try {
      console.log('Fetching candidate data for user:', user.id);
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching candidate data:', error);
        return;
      }

      console.log('Fetched candidate data:', data);
      if (data) {
        setCandidateData(data);
        setEditedBio(data.bio || "");
      } else {
        console.log('No candidate data found for user');
        setCandidateData(null);
      }
    } catch (error) {
      console.error('Error:', error);
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

  // Get display values (prioritize CV data, fallback to profile data)
  const displayEmail = candidateData?.email_from_cv || userProfile?.email;
  const displayAddress = candidateData?.address;
  const displayGithub = candidateData?.github_url;
  const displayLinkedin = candidateData?.linkedin_url;

  // Helper function to safely get education data
  const getEducationData = () => {
    if (!candidateData?.education) return [];
    if (Array.isArray(candidateData.education)) return candidateData.education;
    return [];
  };

  // Helper function to safely get work experience data
  const getWorkExperienceData = () => {
    if (!candidateData?.work_experience) return [];
    if (Array.isArray(candidateData.work_experience)) return candidateData.work_experience;
    return [];
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
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
                  <label className="text-sm font-medium">Bio</label>
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
                <label className="text-sm font-medium flex items-center space-x-1">
                  <Mail className="h-3 w-3" />
                  <span>Email</span>
                </label>
                <div className="bg-gray-50 p-2 rounded text-sm">
                  {displayEmail || "No email available"}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>Address</span>
                </label>
                <div className="bg-gray-50 p-2 rounded text-sm">
                  {displayAddress || "No address available"}
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Skills</label>
                <div className="bg-gray-50 p-2 rounded min-h-[40px]">
                  {candidateData?.skills && candidateData.skills.length > 0 ? (
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
                <label className="text-sm font-medium flex items-center space-x-1">
                  <GraduationCap className="h-3 w-3" />
                  <span>Education</span>
                </label>
                <div className="bg-gray-50 p-2 rounded text-sm space-y-2">
                  {getEducationData().length > 0 ? (
                    getEducationData().map((edu: any, index: number) => (
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
                <label className="text-sm font-medium flex items-center space-x-1">
                  <Briefcase className="h-3 w-3" />
                  <span>Work Experience</span>
                </label>
                <div className="bg-gray-50 p-2 rounded text-sm space-y-3">
                  {getWorkExperienceData().length > 0 ? (
                    getWorkExperienceData().map((exp: any, index: number) => (
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
                <label className="text-sm font-medium flex items-center space-x-1">
                  <Award className="h-3 w-3" />
                  <span>Certifications</span>
                </label>
                <div className="bg-gray-50 p-2 rounded text-sm">
                  {candidateData?.certifications && candidateData.certifications.length > 0 ? (
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
                  <label className="text-sm font-medium flex items-center space-x-1">
                    <Github className="h-3 w-3" />
                    <span>GitHub</span>
                  </label>
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
                  <label className="text-sm font-medium flex items-center space-x-1">
                    <Linkedin className="h-3 w-3" />
                    <span>LinkedIn</span>
                  </label>
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
                  <label className="text-sm font-medium flex items-center space-x-1">
                    <Globe className="h-3 w-3" />
                    <span>Portfolio</span>
                  </label>
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
