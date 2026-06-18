import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Database } from "@/integrations/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

/** الحقول المطلوبة لاكتمال ملف الطالب */
const REQUIRED_FIELDS: (keyof Profile)[] = [
  "full_name",
  "phone",
  "whatsapp",
  "parent_phone",
  "birthdate",
];

export function profileCompletion(p: Profile | null | undefined) {
  if (!p) return { percent: 0, complete: false, missing: REQUIRED_FIELDS as string[] };
  const missing = REQUIRED_FIELDS.filter((f) => {
    const v = p[f];
    return v === null || v === undefined || String(v).trim() === "";
  });
  const filled = REQUIRED_FIELDS.length - missing.length;
  const percent = Math.round((filled / REQUIRED_FIELDS.length) * 100);
  return { percent, complete: missing.length === 0, missing: missing as string[] };
}

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    },
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProfileUpdate) => {
      if (!user) throw new Error("not_authenticated");
      const { error } = await supabase
        .from("profiles")
        .update(input)
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

/** رفع صورة شخصية إلى bucket خاص + إرجاع رابط موقّع طويل المدى */
export function useUploadAvatar() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      if (!user) throw new Error("not_authenticated");
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      // رابط موقّع طويل (10 سنوات)
      const { data, error: signErr } = await supabase.storage
        .from("avatars")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (signErr) throw signErr;
      const url = data.signedUrl;
      const { error: updErr } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", user.id);
      if (updErr) throw updErr;
      return url;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}
