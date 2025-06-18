
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
import { User, FileText, Github, Linkedin, Globe, Edit, Save, X } from "lucide-react";

interface CandidateData {
  bio: string;
  cv_file_url: string;
  cv_file_name: string;
  skills: string[];
  github_url: string;
  linkedin_url: string;
  portfolio_url: string;
}

export const CandidateProfile = () => {
  const [candidateData, setCandidateData] = useState<CandidateData | null>(null);
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

              {/* CV File */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center space-x-1">
                  <FileText className="h-3 w-3" />
                  <span>CV File</span>
                </Label>
                {candidateData?.cv_file_url ? (
                  <a
                    href={candidateData.cv_file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-blue-600 hover:text-blue-800 underline p-2 bg-blue-50 rounded"
                  >
                    {candidateData.cv_file_name || "View CV"}
                  </a>
                ) : (
                  <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded">
                    {candidateData ? "No CV uploaded" : "Loading CV information..."}
                  </div>
                )}
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Skills</Label>
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
                    <div className="text-sm text-gray-500">No skills extracted</div>
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
                  {candidateData?.github_url ? (
                    <a
                      href={candidateData.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-blue-600 hover:text-blue-800 underline p-2 bg-gray-50 rounded break-all"
                    >
                      {candidateData.github_url}
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
                  {candidateData?.linkedin_url ? (
                    <a
                      href={candidateData.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-blue-600 hover:text-blue-800 underline p-2 bg-gray-50 rounded break-all"
                    >
                      {candidateData.linkedin_url}
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
                      href={candidateData.portfolio_url}
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
