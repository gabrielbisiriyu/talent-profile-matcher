
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, Phone, MapPin, Calendar, Award, Briefcase, ExternalLink, Download } from "lucide-react";

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
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', candidate.cv_id)
        .single();

      if (error) {
        console.error('Error fetching candidate details:', error);
      } else {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <span>{candidate?.candidate?.name || "Candidate Profile"}</span>
          </DialogTitle>
          <DialogDescription>
            Detailed candidate information and qualifications
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
                  {candidateDetails.email_from_cv && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{candidateDetails.email_from_cv}</span>
                    </div>
                  )}
                  {candidateDetails.phone_number && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{candidateDetails.phone_number}</span>
                    </div>
                  )}
                  {candidateDetails.address && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{candidateDetails.address}</span>
                    </div>
                  )}
                  {candidateDetails.linkedin_url && (
                    <div className="flex items-center space-x-2">
                      <ExternalLink className="h-4 w-4 text-gray-500" />
                      <a 
                        href={candidateDetails.linkedin_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                  {candidateDetails.github_url && (
                    <div className="flex items-center space-x-2">
                      <ExternalLink className="h-4 w-4 text-gray-500" />
                      <a 
                        href={candidateDetails.github_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        GitHub Profile
                      </a>
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
              {candidateDetails.skills && candidateDetails.skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <Award className="h-5 w-5 text-purple-600" />
                      <span>Skills</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {candidateDetails.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Work Experience */}
              {candidateDetails.work_experience && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <Briefcase className="h-5 w-5 text-orange-600" />
                      <span>Work Experience</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Array.isArray(candidateDetails.work_experience) ? (
                        candidateDetails.work_experience.map((exp: any, index: number) => (
                          <div key={index} className="border-l-2 border-orange-200 pl-4">
                            <h4 className="font-semibold">{exp.position || exp.title}</h4>
                            <p className="text-sm text-gray-600">{exp.company}</p>
                            {exp.duration && (
                              <p className="text-xs text-gray-500">{exp.duration}</p>
                            )}
                            {exp.description && (
                              <p className="text-sm mt-2">{exp.description}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600">Work experience details available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Education */}
              {candidateDetails.education && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <span>Education</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Array.isArray(candidateDetails.education) ? (
                        candidateDetails.education.map((edu: any, index: number) => (
                          <div key={index} className="border-l-2 border-blue-200 pl-4">
                            <h4 className="font-semibold">{edu.degree || edu.qualification}</h4>
                            <p className="text-sm text-gray-600">{edu.institution || edu.school}</p>
                            {edu.year && (
                              <p className="text-xs text-gray-500">{edu.year}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600">Education details available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

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
              <p className="text-gray-600">No candidate details available</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
