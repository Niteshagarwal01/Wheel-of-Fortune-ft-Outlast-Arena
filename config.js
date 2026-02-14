const SUPABASE_URL = 'https://dmynyqgemlelaimjfltp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Har9_z6gmjldG3sLkhOtaw_iMrlcIOl';

// Initialize client if SDK is loaded
const sbClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;
