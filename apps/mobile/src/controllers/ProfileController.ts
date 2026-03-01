import { supabase } from '../services/supabase';
import { Profile } from '../models/Profile';

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!error) return data;

  // Profile missing (trigger may have failed) — create it on the fly
  if (error.code === 'PGRST116') {
    const { data: upserted } = await supabase
      .from('profiles')
      .upsert({ id: userId }, { onConflict: 'id' })
      .select()
      .single();
    return upserted ?? null;
  }

  return null;
}

export async function updateUsername(userId: string, username: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ username })
    .eq('id', userId);
  if (error) throw error;
}

export async function uploadAvatar(userId: string, localUri: string): Promise<void> {
  const ext = localUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${userId}/avatar.${ext}`;

  const response = await fetch(localUri);
  const arrayBuffer = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, arrayBuffer, { upsert: true, contentType: `image/${ext}` });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(path);

  // Append timestamp so Image component treats each upload as a new URL
  const avatarUrl = `${publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId);

  if (updateError) throw updateError;
}
