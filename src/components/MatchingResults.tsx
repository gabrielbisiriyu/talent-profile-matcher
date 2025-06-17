
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Target, User, Briefcase, Star } from "lucide-react";

export const MatchingResults = () => {
  const [cvHash, setCvHash] = useState("");
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { userProfile } = useAuth();

  const isCandidate = userProfile?.user_type === 'candidate';

  const handleMatching = async () => {
    if (!cvHash.trim()) {
      toast({
        title: isCandidate ? "Missing CV hash" : "Missing job hash",
        description: isCandidate 
          ? "Please enter a CV hash to find matching jobs"
          : "Please enter a job hash to find matching candidates",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = isCandidate 
        ? `http://localhost:8000/match_cv_to_jobs/?cv_hash=${cvHash}&top_n=10`
        : `http://localhost:8000/match_job_to_cvs/?job_hash=${cvHash}&top_n=10`;

      const response = await fetch(endpoint, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Matching failed");
      }

      const data = await response.json();
      setMatches(data);
      
      toast({
        title: "Matching completed!",
        description: `Found ${data.length} matching ${isCandidate ? 'jobs' : 'candidates'}`,
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
      <Card className="bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>
              {isCandidate ? "Find Jobs for Your CV" : "Find Candidates for Job"}
            </span>
          </CardTitle>
          <CardDescription>
            {isCandidate 
              ? "Enter a CV hash to find the best matching job opportunities"
              : "Enter a job hash to find the best matching candidates"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hash-input">
              {isCandidate ? "CV Hash" : "Job Hash"}
            </Label>
            <Input
              id="hash-input"
              placeholder={`Enter ${isCandidate ? 'CV' : 'job'} hash from parsing result`}
              value={cvHash}
              onChange={(e) => setCvHash(e.target.value)}
              className="bg-white/80"
            />
          </div>
          <Button
            onClick={handleMatching}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isLoading 
              ? "Matching..." 
              : `Find Matching ${isCandidate ? 'Jobs' : 'Candidates'}`
            }
          </Button>
        </CardContent>
      </Card>

      {matches.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {isCandidate ? "Job Matches" : "Candidate Matches"}
          </h3>
          {matches.map((match, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold">
                      {isCandidate 
                        ? (match.job_title || "Job Position")
                        : (match.candidate?.name || "Candidate")
                      }
                    </h4>
                    <p className="text-sm text-gray-600">
                      {isCandidate 
                        ? `Job ID: ${match.job_id}`
                        : `CV ID: ${match.cv_id}`
                      }
                    </p>
                    {isCandidate ? (
                      <p className="text-sm text-gray-600">
                        Posted: {new Date(match.created_at).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">
                        {match.candidate?.email || "Email not available"}
                      </p>
                    )}
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
    </div>
  );
};
