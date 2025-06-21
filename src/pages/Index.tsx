import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CVUpload } from "@/components/CVUpload";
import { JobUpload } from "@/components/JobUpload";
import { MatchingResults } from "@/components/MatchingResults";
import { JobManagement } from "@/components/JobManagement";
import { Dashboard } from "@/components/Dashboard";
import { CandidateProfile } from "@/components/CandidateProfile";
import { CompanyProfile } from "@/components/CompanyProfile";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Briefcase, Target, BarChart3, Brain, LogOut, User } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, userProfile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  const isCandidate = userProfile?.user_type === 'candidate';
  const isCompany = userProfile?.user_type === 'company';

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  TalentMatch 
                </h1>
                <p className="text-sm text-gray-600">Intelligent CV-Job Matching Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isCandidate ? (
                <CandidateProfile />
              ) : (
                <CompanyProfile />
              )}
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full bg-white/60 backdrop-blur-sm" 
            style={{ gridTemplateColumns: `repeat(${isCandidate ? 3 : isCompany ? 4 : 5}, 1fr)` }}>
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            {isCandidate && (
              <TabsTrigger value="cv-upload" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Upload CV</span>
              </TabsTrigger>
            )}
            {isCompany && (
              <TabsTrigger value="job-upload" className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4" />
                <span>Post Job</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="matching" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Matching</span>
            </TabsTrigger>
            {isCompany && (
              <TabsTrigger value="management" className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4" />
                <span>Manage Jobs</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard />
          </TabsContent>

          {isCandidate && (
            <TabsContent value="cv-upload" className="space-y-6">
              <Card className="bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span>Upload & Parse CV</span>
                  </CardTitle>
                  <CardDescription>
                    Upload your CV to extract skills, experience, and generate AI embeddings for matching
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CVUpload />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {isCompany && (
            <TabsContent value="job-upload" className="space-y-6">
              <Card className="bg-white/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    <span>Post Job Opening</span>
                  </CardTitle>
                  <CardDescription>
                    Upload job descriptions to extract requirements and generate matching profiles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <JobUpload />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="matching" className="space-y-6">
            <MatchingResults />
          </TabsContent>

          {isCompany && (
            <TabsContent value="management" className="space-y-6">
              <JobManagement />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
