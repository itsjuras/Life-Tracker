import { supabase } from '../services/supabase';

export async function signIn(identifier: string, password: string) {
  let email = identifier.trim();

  if (!email.includes('@')) {
    // Resolve username → email via profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', email.toLowerCase())
      .single();
    if (error || !data?.email) throw new Error('No account found with that username.');
    email = data.email;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
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
