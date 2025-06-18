
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Trash2, Building, Calendar, FileText, Users, Star } from "lucide-react";

export const JobManagement = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [matchingJobId, setMatchingJobId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<{ [jobId: string]: any[] }>({});
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCompanyJobs();
    }
  }, [user]);

  const fetchCompanyJobs = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/jobs/company/${user.id}?limit=10&offset=0`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch jobs");
      }

      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      toast({
        title: "Failed to load jobs",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/delete_job/${jobId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to delete job");
      }

      setJobs(jobs.filter(job => job.id !== jobId));
      
      toast({
        title: "Job deleted",
        description: "The job posting has been successfully removed",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleFindCandidates = async (jobId: string, jobHash: string) => {
    setMatchingJobId(jobId);
    try {
      const response = await fetch(`http://localhost:8000/match_job_to_cvs/?job_hash=${jobHash}&top_n=10`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Matching failed");
      }

      const data = await response.json();
      setCandidates(prev => ({ ...prev, [jobId]: data }));
      
      toast({
        title: "Matching completed!",
        description: `Found ${data.length} matching candidates`,
      });
    } catch (error) {
      toast({
        title: "Matching failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setMatchingJobId(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600 bg-green-100";
    if (score >= 0.6) return "text-blue-600 bg-blue-100";
    if (score >= 0.4) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return "Excellent";
    if (score >= 0.6) return "Good";
    if (score >= 0.4) return "Fair";
    return "Poor";
  };

  if (isLoading) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Loading your jobs...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-blue-600" />
            <span>Your Job Postings</span>
          </CardTitle>
          <CardDescription>
            Manage your company's job postings and find matching candidates
          </CardDescription>
        </CardHeader>
      </Card>

      {jobs.length === 0 ? (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6 text-center">
            <p className="text-yellow-800">No jobs posted yet. Go to the "Post Job" tab to create your first job posting.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {jobs.map((job) => (
            <div key={job.id} className="space-y-4">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-2">
                        {job.parsed_fields?.jobTitle || job.title || "Job Position"}
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>Job ID: {job.id}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Created: {new Date(job.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4" />
                          <span>Company: {job.parsed_fields?.company || "N/A"}</span>
                        </div>
                      </div>

                      {job.parsed_fields?.requiredSkills && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Required Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {job.parsed_fields.requiredSkills.slice(0, 8).map((skill: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {job.parsed_fields.requiredSkills.length > 8 && (
                              <Badge variant="outline" className="text-xs">
                                +{job.parsed_fields.requiredSkills.length - 8} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <Button
                        onClick={() => handleFindCandidates(job.id, job.text_hash)}
                        disabled={matchingJobId === job.id}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        {matchingJobId === job.id ? (
                          "Finding..."
                        ) : (
                          <>
                            <Users className="h-4 w-4 mr-2" />
                            Find Candidates
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteJob(job.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600">
                      <strong>Hash:</strong> {job.text_hash}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Show matching candidates for this job */}
              {candidates[job.id] && candidates[job.id].length > 0 && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <span>Matching Candidates ({candidates[job.id].length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {candidates[job.id].map((candidate, index) => (
                    <Card key={index} className="bg-white/80">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h5 className="font-semibold">
                              {candidate.candidate?.name || "Candidate"}
                            </h5>
                            <p className="text-sm text-gray-600">
                              {candidate.candidate?.email || "Email not available"}
                            </p>
                            <p className="text-sm text-gray-600">
                              CV ID: {candidate.cv_id}
                            </p>
                          </div>
                          <div className="text-right">
                            <div
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(
                                candidate.combined_score
                              )}`}
                            >
                              <Star className="h-3 w-3 inline mr-1" />
                              {getScoreLabel(candidate.combined_score)}
                            </div>
                            <p className="text-lg font-bold text-gray-900 mt-1">
                              {candidate.combined_score.toFixed(1)}%
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">Overall Score</p>
                          <Progress
                            value={candidate.combined_score}
                            className="h-1.5"
                          />
                          <p className="text-xs text-gray-600 mt-1">
                            {candidate.combined_score.toFixed(1)}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
