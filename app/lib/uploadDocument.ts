import { supabase } from "./supabase";

export async function uploadDocument(file: File, subcontractorId: string) {
  const filePath = `${subcontractorId}/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("documents")
    .upload(filePath, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("documents")
    .getPublicUrl(filePath);

  return data.publicUrl;
}