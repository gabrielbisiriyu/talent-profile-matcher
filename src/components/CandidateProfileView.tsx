
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, Phone, MapPin, Calendar, Award, Briefcase, ExternalLink, Download, Github, Linkedin, Globe, GraduationCap } from "lucide-react";

interface CandidateProfileViewProps {
  candidate: any;
  isOpen: boolean;
  onClose: () => void;
}

export const CandidateProfileView = ({ candidate, isOpen, onClose }: CandidateProfileViewProps) => {
  const [candidateDetails, setCandidateDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && candidate?.cv_id) {
      fetchCandidateDetails();
    }
  }, [isOpen, candidate]);

  const fetchCandidateDetails = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching candidate details for cv_id:', candidate.cv_id);
      
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', candidate.cv_id)
        .single();

      if (error) {
        console.error('Error fetching candidate details:', error);
      } else {
        console.log('Fetched candidate details:', data);
        setCandidateDetails(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCV = () => {
    if (candidateDetails?.cv_file_url) {
      window.open(candidateDetails.cv_file_url, '_blank');
    }
  };

  // Helper function to safely get education data
  const getEducationData = () => {
    if (!candidateDetails?.education) return [];
    if (Array.isArray(candidateDetails.education)) return candidateDetails.education;
    return [];
  };

  // Helper function to safely get work experience data
  const getWorkExperienceData = () => {
    if (!candidateDetails?.work_experience) return [];
    if (Array.isArray(candidateDetails.work_experience)) return candidateDetails.work_experience;
    return [];
  };

  const displayEmail = candidateDetails?.email_from_cv || candidate?.candidate?.email || "No email available";
  const displayAddress = candidateDetails?.address;
  const displayGithub = candidateDetails?.github_url;
  const displayLinkedin = candidateDetails?.linkedin_url;
  const displayName = candidate?.candidate?.name || "Candidate";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <span>{displayName} - Candidate Profile</span>
          </DialogTitle>
          <DialogDescription>
            Complete candidate profile and qualifications
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh]">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading candidate details...</p>
            </div>
          ) : candidateDetails ? (
            <div className="space-y-6 pr-4">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <User className="h-5 w-5 text-blue-600" />
                    <span>Contact Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{displayEmail}</span>
                  </div>
                  {candidateDetails.phone_number && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{candidateDetails.phone_number}</span>
                    </div>
                  )}
                  {displayAddress && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{displayAddress}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Bio */}
              {candidateDetails.bio && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <User className="h-5 w-5 text-green-600" />
                      <span>Professional Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{candidateDetails.bio}</p>
                  </CardContent>
                </Card>
              )}

              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Award className="h-5 w-5 text-purple-600" />
                    <span>Skills</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {candidateDetails.skills && candidateDetails.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {candidateDetails.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No skills available</div>
                  )}
                </CardContent>
              </Card>

              {/* Education */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    <span>Education</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getEducationData().length > 0 ? (
                    <div className="space-y-4">
                      {getEducationData().map((edu: any, index: number) => (
                        <div key={index} className="border-l-2 border-blue-200 pl-4">
                          <h4 className="font-semibold">{edu.degree} in {edu.field}</h4>
                          <p className="text-sm text-gray-600">{edu.school}</p>
                          {edu.year && (
                            <p className="text-xs text-gray-500">{edu.year}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No education information available</div>
                  )}
                </CardContent>
              </Card>

              {/* Work Experience */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Briefcase className="h-5 w-5 text-orange-600" />
                    <span>Work Experience</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getWorkExperienceData().length > 0 ? (
                    <div className="space-y-4">
                      {getWorkExperienceData().map((exp: any, index: number) => (
                        <div key={index} className="border-l-2 border-orange-200 pl-4">
                          <h4 className="font-semibold">{exp.jobTitle}</h4>
                          <p className="text-sm text-blue-600 font-medium">{exp.company}</p>
                          <p className="text-xs text-gray-500 mb-2">{exp.timeWorked}</p>
                          {exp.responsibilities && exp.responsibilities !== "null" && (
                            <p className="text-sm text-gray-700">{exp.responsibilities}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No work experience available</div>
                  )}
                </CardContent>
              </Card>

              {/* Certifications */}
              {candidateDetails.certifications && candidateDetails.certifications.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <Award className="h-5 w-5 text-red-600" />
                      <span>Certifications</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {candidateDetails.certifications.map((cert: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Social Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <ExternalLink className="h-5 w-5 text-gray-600" />
                    <span>Professional Links</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    {candidateDetails.portfolio_url ? (
                      <a
                        href={candidateDetails.portfolio_url.startsWith('http') ? candidateDetails.portfolio_url : `https://${candidateDetails.portfolio_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-blue-600 hover:text-blue-800 underline p-2 bg-gray-50 rounded break-all"
                      >
                        {candidateDetails.portfolio_url}
                      </a>
                    ) : (
                      <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded">
                        No Portfolio URL
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* CV Download */}
              {candidateDetails.cv_file_url && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <Download className="h-5 w-5 text-gray-600" />
                      <span>CV Document</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={downloadCV} variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download CV ({candidateDetails.cv_file_name || 'CV.pdf'})
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No candidate details found. This candidate may not have uploaded their CV yet.</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
