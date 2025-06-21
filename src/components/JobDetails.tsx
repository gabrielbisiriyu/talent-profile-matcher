
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FileText, Building, MapPin, Users, Globe } from "lucide-react";

interface JobDetailsProps {
  jobId: string;
  jobHash: string;
  jobTitle?: string;
}

interface ParsedJob {
  companyInfo?: Array<{
    companyName?: string;
    location?: string;
    website?: string;
    telephoneNumber?: string;
  }>;
  jobTitle?: string;
  requiredSkills?: string[];
  roles_or_responsibilities?: string[];
}

interface JobResponse {
  job_id: string;
  hash: string;
  is_duplicate: boolean;
  parsed_job: ParsedJob;
  job_text: string;
}

export const JobDetails = ({ jobId, jobHash, jobTitle }: JobDetailsProps) => {
  const [jobDetails, setJobDetails] = useState<JobResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const fetchJobDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/parse_job?job_hash=${jobHash}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch job details');
      }

      const data: JobResponse = await response.json();
      setJobDetails(data);
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast({
        title: "Error",
        description: "Failed to load job details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !jobDetails) {
      fetchJobDetails();
    }
  };

  const formatJobText = (text: string) => {
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          View Full Job Post
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>{jobTitle || "Job Details"}</span>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading job details...</p>
          </div>
        ) : jobDetails ? (
          <div className="space-y-6">
            {/* Company Information */}
            {jobDetails.parsed_job.companyInfo && jobDetails.parsed_job.companyInfo.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Building className="h-5 w-5 text-blue-600" />
                    <span>Company Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {jobDetails.parsed_job.companyInfo.map((company, index) => (
                    <div key={index} className="space-y-2">
                      {company.companyName && (
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{company.companyName}</span>
                        </div>
                      )}
                      {company.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{company.location}</span>
                        </div>
                      )}
                      {company.website && company.website !== "Not provided" && (
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-gray-500" />
                          <a href={company.website} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-600 hover:underline">
                            {company.website}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Required Skills */}
            {jobDetails.parsed_job.requiredSkills && jobDetails.parsed_job.requiredSkills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Users className="h-5 w-5 text-green-600" />
                    <span>Required Skills</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {jobDetails.parsed_job.requiredSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Roles and Responsibilities */}
            {jobDetails.parsed_job.roles_or_responsibilities && jobDetails.parsed_job.roles_or_responsibilities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <span>Roles & Responsibilities</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {jobDetails.parsed_job.roles_or_responsibilities.map((role, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span>{role}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Full Job Text */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <FileText className="h-5 w-5 text-orange-600" />
                  <span>Full Job Description</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                  {formatJobText(jobDetails.job_text)}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No job details available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
