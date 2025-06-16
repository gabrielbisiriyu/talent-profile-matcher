
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CVUpload } from "@/components/CVUpload";
import { JobUpload } from "@/components/JobUpload";
import { MatchingResults } from "@/components/MatchingResults";
import { JobManagement } from "@/components/JobManagement";
import { Dashboard } from "@/components/Dashboard";
import { FileText, Briefcase, Target, BarChart3, Brain } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

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
                  TalentMatch AI
                </h1>
                <p className="text-sm text-gray-600">Intelligent CV-Job Matching Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-700">AI Model Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/60 backdrop-blur-sm">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="cv-upload" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Upload CV</span>
            </TabsTrigger>
            <TabsTrigger value="job-upload" className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4" />
              <span>Post Job</span>
            </TabsTrigger>
            <TabsTrigger value="matching" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Matching</span>
            </TabsTrigger>
            <TabsTrigger value="management" className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4" />
              <span>Manage Jobs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard />
          </TabsContent>

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

          <TabsContent value="matching" className="space-y-6">
            <MatchingResults />
          </TabsContent>

          <TabsContent value="management" className="space-y-6">
            <JobManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
