
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { User, Building, Globe, Save } from "lucide-react";

interface CompanyData {
  id: string;
  company_description?: string;
  website_url?: string;
  company_size?: string;
  industry?: string;
  founded_year?: number;
  logo_url?: string;
}

export const CompanyProfile = () => {
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { user, userProfile } = useAuth();

  const [formData, setFormData] = useState({
    company_description: "",
    website_url: "",
    company_size: "",
    industry: "",
    founded_year: "",
  });

  useEffect(() => {
    if (user && isOpen) {
      fetchCompanyData();
    }
  }, [user, isOpen]);

  const fetchCompanyData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setCompanyData(data);
        setFormData({
          company_description: data.company_description || "",
          website_url: data.website_url || "",
          company_size: data.company_size || "",
          industry: data.industry || "",
          founded_year: data.founded_year?.toString() || "",
        });
      } else {
        // No company data exists, initialize empty form
        setCompanyData(null);
        setFormData({
          company_description: "",
          website_url: "",
          company_size: "",
          industry: "",
          founded_year: "",
        });
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
      toast({
        title: "Error",
        description: "Failed to load company information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const dataToSave = {
        id: user.id,
        company_description: formData.company_description || null,
        website_url: formData.website_url || null,
        company_size: formData.company_size || null,
        industry: formData.industry || null,
        founded_year: formData.founded_year ? parseInt(formData.founded_year) : null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('companies')
        .upsert(dataToSave, { onConflict: 'id' });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Company profile updated successfully",
      });

      setIsOpen(false);
      fetchCompanyData();
    } catch (error) {
      console.error('Error saving company data:', error);
      toast({
        title: "Error",
        description: "Failed to save company information",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 px-3 py-1 bg-blue-100 rounded-full hover:bg-blue-200">
          <Building className="w-4 h-4 text-blue-700" />
          <span className="text-sm font-medium text-blue-700 cursor-pointer">
            {userProfile?.company_name || "Company"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Building className="h-5 w-5 text-blue-600" />
              <span>Company Profile</span>
            </CardTitle>
          </CardHeader>
          <ScrollArea className="h-[400px]">
            <CardContent className="space-y-4 pr-4">
              {isLoading ? (
                <div className="text-center py-4">
                  <p className="text-gray-600">Loading company information...</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Company Name
                    </label>
                    <Input
                      value={userProfile?.company_name || ""}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto-generated from profile</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Company Description
                    </label>
                    <Textarea
                      value={formData.company_description}
                      onChange={(e) => handleInputChange('company_description', e.target.value)}
                      placeholder="Describe your company..."
                      className="min-h-[80px]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Website URL
                    </label>
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <Input
                        value={formData.website_url}
                        onChange={(e) => handleInputChange('website_url', e.target.value)}
                        placeholder="https://yourcompany.com"
                        type="url"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Company Size
                    </label>
                    <Input
                      value={formData.company_size}
                      onChange={(e) => handleInputChange('company_size', e.target.value)}
                      placeholder="e.g., 50-100 employees"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Industry
                    </label>
                    <Input
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      placeholder="e.g., Technology, Healthcare"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Founded Year
                    </label>
                    <Input
                      value={formData.founded_year}
                      onChange={(e) => handleInputChange('founded_year', e.target.value)}
                      placeholder="e.g., 2010"
                      type="number"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? "Saving..." : "Save Profile"}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </ScrollArea>
        </Card>
      </PopoverContent>
    </Popover>
  );
};
