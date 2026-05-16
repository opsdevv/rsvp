<?php
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RSVP Event</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>You're Invited</h1>
            <p class="subtitle">Please confirm your attendance below.</p>

            <form action="submit.php" method="POST" class="rsvp-form">
                <div class="input-group">
                    <label>Full Name</label>
                    <input type="text" name="name" required>
                </div>

                <div class="input-group">
                    <label>Email Address</label>
                    <input type="email" name="email" required>
                </div>

                <div class="input-group">
                    <label>Phone Number</label>
                    <input type="text" name="phone">
                </div>

                <div class="input-group">
                    <label>Will you attend?</label>
                    <select name="attendance" required>
                        <option value="">Select Option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </select>
                </div>

                <div class="input-group">
                    <label>Message</label>
                    <textarea name="message" rows="4"></textarea>
                </div>

                <button type="submit">Submit RSVP</button>
            </form>
        </div>
    </div>
</body>
</html>
