
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Search, Building, Calendar, FileText } from "lucide-react";

export const JobManagement = () => {
  const [companyId, setCompanyId] = useState("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearchJobs = async () => {
    if (!companyId.trim()) {
      toast({
        title: "Missing company ID",
        description: "Please enter a company ID to search for jobs",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/jobs/company/${companyId}?limit=10&offset=0`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch jobs");
      }

      const data = await response.json();
      setJobs(data.jobs || []);
      
      toast({
        title: "Jobs loaded",
        description: `Found ${data.count} jobs for this company`,
      });
    } catch (error) {
      toast({
        title: "Search failed",
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

  return (
    <div className="space-y-6">
      <Card className="bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-blue-600" />
            <span>Job Management</span>
          </CardTitle>
          <CardDescription>
            Search and manage job postings for your company
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-search">Company ID</Label>
            <Input
              id="company-search"
              placeholder="Enter company ID to search for jobs"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="bg-white/80"
            />
          </div>
          <Button
            onClick={handleSearchJobs}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isLoading ? (
              "Searching..."
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search Jobs
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {jobs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Company Jobs</h3>
          {jobs.map((job) => (
            <Card key={job.id} className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold mb-2">
                      {job.parsed_fields?.jobTitle || "Job Position"}
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

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteJob(job.id)}
                    className="ml-4"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">
                    <strong>Hash:</strong> {job.text_hash}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {jobs.length === 0 && companyId && !isLoading && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6 text-center">
            <p className="text-yellow-800">No jobs found for this company ID.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
