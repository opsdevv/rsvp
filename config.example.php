<?php
/**
 * Copy this file to config.local.php and fill in values from:
 * Supabase → Project Settings → API
 */
declare(strict_types=1);

return [
    'SUPABASE_URL' => 'https://YOUR_PROJECT_REF.supabase.co',
    'SUPABASE_ANON_KEY' => 'YOUR_ANON_PUBLIC_KEY',
    /** Admin page only (admin.php). Keep secret; never expose in the public RSVP form. */
    'SUPABASE_SERVICE_ROLE_KEY' => 'YOUR_SERVICE_ROLE_KEY',
];
