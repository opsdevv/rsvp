<?php
declare(strict_types=1);

$configPath = dirname(__DIR__) . '/config.local.php';
$config = file_exists($configPath) ? require $configPath : [];

$url = $config['SUPABASE_URL'] ?? '';
$serviceKey = $config['SUPABASE_SERVICE_ROLE_KEY'] ?? '';

header('Content-Type: text/html; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('X-Robots-Tag: noindex, nofollow');
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>RSVP Admin</title>
  <link rel="stylesheet" href="rsvp-page.css" />
  <link rel="stylesheet" href="admin-page.css" />
</head>
<body>
  <main class="admin-main">
    <header class="admin-header">
      <div>
        <h1>RSVP Admin</h1>
        <p class="lede">All responses update in real time.</p>
      </div>
      <div class="admin-toolbar">
        <p data-role="stats" class="admin-stats">—</p>
        <span data-role="live" class="live-badge" data-state="pending">Connecting…</span>
      </div>
    </header>

    <div data-role="status" class="admin-status" hidden></div>

    <div
      id="admin-app"
      class="card admin-card"
      data-supabase-url="<?= htmlspecialchars((string) $url, ENT_QUOTES, 'UTF-8') ?>"
      data-supabase-service-role-key="<?= htmlspecialchars((string) $serviceKey, ENT_QUOTES, 'UTF-8') ?>"
    >
      <p data-role="empty" class="admin-empty" hidden>No RSVPs yet.</p>
      <div class="table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Guests</th>
              <th>Message</th>
              <th>Submitted</th>
              <th></th>
            </tr>
          </thead>
          <tbody data-role="list"></tbody>
        </table>
      </div>
    </div>

    <p class="admin-footer">
      <a href="index.php">← Back to RSVP form</a>
    </p>
  </main>

  <script src="assets/admin.js" defer></script>
</body>
</html>
