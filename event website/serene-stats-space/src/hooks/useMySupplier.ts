import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useMySupplier() {
  const { session } = useAuth();
  const uid = session?.user.id;
  return useQuery({
    queryKey: ["my-supplier", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supplier_profiles")
        .select("*, supplier_types(code, name_he, name_ar)")
        .eq("user_id", uid!)
        .order("created_at")
        .limit(1);
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
}
