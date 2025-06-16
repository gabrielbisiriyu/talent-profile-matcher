
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Briefcase, Target, TrendingUp, Users, Building } from "lucide-react";

export const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-gray-600">Overview of your talent matching platform</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">CVs Processed</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">1,234</div>
            <p className="text-xs text-blue-600">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Job Postings</CardTitle>
            <Briefcase className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">342</div>
            <p className="text-xs text-green-600">+8% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Matches Made</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">2,847</div>
            <p className="text-xs text-purple-600">+24% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">87.5%</div>
            <p className="text-xs text-orange-600">+3.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>For Candidates</span>
            </CardTitle>
            <CardDescription>
              Upload your CV and get matched with relevant job opportunities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">AI-Powered CV Analysis</h4>
              <p className="text-sm text-gray-600">
                Our advanced NLP models extract skills, experience, and qualifications from your CV
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Smart Job Matching</h4>
              <p className="text-sm text-gray-600">
                Get personalized job recommendations based on semantic similarity scoring
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Detailed Match Scores</h4>
              <p className="text-sm text-gray-600">
                Understand why jobs match your profile with detailed scoring breakdowns
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-green-600" />
              <span>For Employers</span>
            </CardTitle>
            <CardDescription>
              Post jobs and find the perfect candidates with AI-driven matching
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Intelligent Job Parsing</h4>
              <p className="text-sm text-gray-600">
                Automatically extract requirements, responsibilities, and skills from job descriptions
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Candidate Ranking</h4>
              <p className="text-sm text-gray-600">
                Get ranked lists of candidates based on multi-dimensional similarity scores
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Efficient Screening</h4>
              <p className="text-sm text-gray-600">
                Reduce time-to-hire with AI-powered candidate pre-screening
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
