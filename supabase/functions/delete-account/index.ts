// Deletes the calling user's account and all associated data.
//
// The client cannot delete its own auth.users row (that requires the service
// role key, which must never ship in the app), so this runs server-side.
// All app tables reference auth.users with ON DELETE CASCADE, so deleting the
// auth user removes profiles, habits, tasks, stats, and reflections. Storage
// objects (avatars) do not cascade and are removed explicitly first.
//
// Deploy: npx supabase functions deploy delete-account --project-ref <ref>

import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Resolve the caller from their JWT — the user can only delete themselves.
  const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);

  // Remove avatar files (storage does not cascade with the auth user).
  const { data: avatarFiles } = await admin.storage.from('avatars').list(user.id);
  if (avatarFiles && avatarFiles.length > 0) {
    await admin.storage
      .from('avatars')
      .remove(avatarFiles.map((f) => `${user.id}/${f.name}`));
  }

  // Delete the auth user — cascades to all app tables.
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    return new Response(JSON.stringify({ error: 'Failed to delete account' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
