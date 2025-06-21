import { supabase } from "@/integrations/supabase/client";

export const fetchCandidateData = async (userId: string) => {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching candidate data:", error);
    return null;
  }

  return data;
};
