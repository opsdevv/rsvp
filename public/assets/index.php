<?php
declare(strict_types=1);

$configPath = dirname(__DIR__) . '/config.local.php';
$config = file_exists($configPath) ? require $configPath : [];

$url = $config['SUPABASE_URL'] ?? '';
$key = $config['SUPABASE_ANON_KEY'] ?? '';

header('Content-Type: text/html; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>RSVP</title>
  <link rel="stylesheet" href="rsvp-page.css" />
</head>
<body>
  <main>
    <h1>RSVP</h1>
    <p class="lede">Let us know if you can join — responses are saved securely.</p>

    <div
      id="rsvp-app"
      class="card"
      data-supabase-url="<?= htmlspecialchars((string) $url, ENT_QUOTES, 'UTF-8') ?>"
      data-supabase-anon-key="<?= htmlspecialchars((string) $key, ENT_QUOTES, 'UTF-8') ?>"
    >
      <form data-role="rsvp-form" method="post" action="#" autocomplete="on" novalidate>
        <div class="field">
          <label for="full_name">Full name</label>
          <input id="full_name" name="full_name" type="text" required maxlength="120" autocomplete="name" />
        </div>

        <div class="field">
          <label for="email">Email</label>
          <input id="email" name="email" type="email" required maxlength="254" autocomplete="email" />
        </div>

        <fieldset>
          <legend>Will you attend?</legend>
          <div class="choices">
            <label><input type="radio" name="attending" value="yes" required checked /> Yes, I’ll be there</label>
            <label><input type="radio" name="attending" value="no" /> Sorry, I can’t make it</label>
          </div>
        </fieldset>

        <div class="field" data-guest-wrap>
          <label for="guest_count">Guests (including you)</label>
          <input id="guest_count" name="guest_count" type="number" min="1" max="20" value="1" />
          <p class="hint">Count everyone in your party.</p>
        </div>

        <div class="field">
          <label for="dietary_notes">Dietary notes <span class="hint hint-inline">(optional)</span></label>
          <textarea id="dietary_notes" name="dietary_notes" maxlength="500" placeholder="Allergies, vegetarian, etc."></textarea>
        </div>

        <div class="field">
          <label for="message">Message <span class="hint hint-inline">(optional)</span></label>
          <textarea id="message" name="message" maxlength="1000" placeholder="A note for the hosts"></textarea>
        </div>

        <button type="submit">Send RSVP</button>
      </form>

      <div data-role="status" hidden></div>
    </div>
  </main>

  <script src="assets/rsvp.js" defer></script>
</body>
</html>
