
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Target, User, Briefcase, TrendingUp, Star } from "lucide-react";

export const MatchingResults = () => {
  const [cvHash, setCvHash] = useState("");
  const [jobHash, setJobHash] = useState("");
  const [cvMatches, setCvMatches] = useState<any[]>([]);
  const [jobMatches, setJobMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCvToJobsMatch = async () => {
    if (!cvHash.trim()) {
      toast({
        title: "Missing CV hash",
        description: "Please enter a CV hash to find matching jobs",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/match_cv_to_jobs/?cv_hash=${cvHash}&top_n=10`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Matching failed");
      }

      const data = await response.json();
      setCvMatches(data);
      
      toast({
        title: "Matching completed!",
        description: `Found ${data.length} matching jobs`,
      });
    } catch (error) {
      toast({
        title: "Matching failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJobToCvsMatch = async () => {
    if (!jobHash.trim()) {
      toast({
        title: "Missing job hash",
        description: "Please enter a job hash to find matching candidates",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/match_job_to_cvs/?job_hash=${jobHash}&top_n=10`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Matching failed");
      }

      const data = await response.json();
      setJobMatches(data);
      
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
      setIsLoading(false);
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

  return (
    <div className="space-y-6">
      <Tabs defaultValue="cv-to-jobs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-white/60">
          <TabsTrigger value="cv-to-jobs" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Find Jobs for CV</span>
          </TabsTrigger>
          <TabsTrigger value="job-to-cvs" className="flex items-center space-x-2">
            <Briefcase className="h-4 w-4" />
            <span>Find Candidates for Job</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cv-to-jobs" className="space-y-6">
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span>Match CV to Jobs</span>
              </CardTitle>
              <CardDescription>
                Enter a CV hash to find the best matching job opportunities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cv-hash">CV Hash</Label>
                <Input
                  id="cv-hash"
                  placeholder="Enter CV hash from parsing result"
                  value={cvHash}
                  onChange={(e) => setCvHash(e.target.value)}
                  className="bg-white/80"
                />
              </div>
              <Button
                onClick={handleCvToJobsMatch}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isLoading ? "Matching..." : "Find Matching Jobs"}
              </Button>
            </CardContent>
          </Card>

          {cvMatches.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Job Matches</h3>
              {cvMatches.map((match, index) => (
                <Card key={index} className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold">{match.job_title || "Job Position"}</h4>
                        <p className="text-sm text-gray-600">Job ID: {match.job_id}</p>
                        <p className="text-sm text-gray-600">Posted: {new Date(match.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(match.combined_score)}`}>
                          <Star className="h-3 w-3 inline mr-1" />
                          {getScoreLabel(match.combined_score)}
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {(match.combined_score * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Document Similarity</p>
                        <Progress value={match.doc_score * 100} className="h-2" />
                        <p className="text-xs text-gray-600 mt-1">{(match.doc_score * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Skills Match</p>
                        <Progress value={match.skill_score * 100} className="h-2" />
                        <p className="text-xs text-gray-600 mt-1">{(match.skill_score * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Experience Alignment</p>
                        <Progress value={match.exp_score * 100} className="h-2" />
                        <p className="text-xs text-gray-600 mt-1">{(match.exp_score * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="job-to-cvs" className="space-y-6">
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-600" />
                <span>Match Job to Candidates</span>
              </CardTitle>
              <CardDescription>
                Enter a job hash to find the best matching candidates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="job-hash">Job Hash</Label>
                <Input
                  id="job-hash"
                  placeholder="Enter job hash from parsing result"
                  value={jobHash}
                  onChange={(e) => setJobHash(e.target.value)}
                  className="bg-white/80"
                />
              </div>
              <Button
                onClick={handleJobToCvsMatch}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isLoading ? "Matching..." : "Find Matching Candidates"}
              </Button>
            </CardContent>
          </Card>

          {jobMatches.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Candidate Matches</h3>
              {jobMatches.map((match, index) => (
                <Card key={index} className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold">{match.candidate?.name || "Candidate"}</h4>
                        <p className="text-sm text-gray-600">{match.candidate?.email || "Email not available"}</p>
                        <p className="text-sm text-gray-600">CV ID: {match.cv_id}</p>
                      </div>
                      <div className="text-right">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(match.combined_score)}`}>
                          <Star className="h-3 w-3 inline mr-1" />
                          {getScoreLabel(match.combined_score)}
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {(match.combined_score * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Document Similarity</p>
                        <Progress value={match.doc_score * 100} className="h-2" />
                        <p className="text-xs text-gray-600 mt-1">{(match.doc_score * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Skills Match</p>
                        <Progress value={match.skill_score * 100} className="h-2" />
                        <p className="text-xs text-gray-600 mt-1">{(match.skill_score * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Experience Alignment</p>
                        <Progress value={match.exp_score * 100} className="h-2" />
                        <p className="text-xs text-gray-600 mt-1">{(match.exp_score * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
