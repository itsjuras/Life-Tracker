import { supabase } from '../services/supabase';

export async function signIn(identifier: string, password: string) {
  let email = identifier.trim();

  if (!email.includes('@')) {
    email = await resolveUsernameToEmail(email);
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function resolveUsernameToEmail(username: string): Promise<string> {
  // SECURITY DEFINER function from migration 003 — returns one email without
  // exposing the profiles table to unauthenticated reads.
  const { data, error } = await supabase.rpc('get_email_for_username', {
    p_username: username,
  });
  if (!error) {
    if (!data) throw new Error('No account found with that username.');
    return data as string;
  }

  // PGRST202 = function not deployed yet — fall back to the direct lookup,
  // which works while the pre-003 public-read policy is still in place.
  if (error.code === 'PGRST202') {
    const { data: row, error: queryError } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', username.toLowerCase())
      .maybeSingle();
    if (queryError || !row?.email) throw new Error('No account found with that username.');
    return row.email;
  }

  throw new Error('No account found with that username.');
}

export async function signUp(email: string, password: string, username: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username: username.toLowerCase() } },
  });
  if (error) throw error;

  // Explicitly write the profile row. The DB trigger handles this too,
  // but doing it here ensures the row exists even if the trigger isn't deployed.
  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      email: data.user.email,
      username: username.toLowerCase(),
    });
    if (profileError) throw profileError;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function changePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function deleteAccount() {
  // Server-side edge function — deleting the auth user requires the service
  // role key, which never ships in the app. Cascades delete all user data.
  const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
  if (error) throw new Error('Failed to delete account. Please try again.');

  // The server-side session is already gone; only clear local storage.
  await supabase.auth.signOut({ scope: 'local' });
}
