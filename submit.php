<?php

require_once 'config.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $data = [
        "name" => $_POST['name'] ?? '',
        "email" => $_POST['email'] ?? '',
        "phone" => $_POST['phone'] ?? '',
        "attendance" => $_POST['attendance'] ?? '',
        "message" => $_POST['message'] ?? '',
    ];

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, SUPABASE_URL . "/rest/v1/rsvps");
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "apikey: " . SUPABASE_API_KEY,
        "Authorization: Bearer " . SUPABASE_API_KEY,
        "Content-Type: application/json",
        "Prefer: return=minimal"
    ]);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);

    if ($httpCode >= 200 && $httpCode < 300) {
        header("Location: success.php");
        exit;
    } else {
        echo "Error submitting RSVP.<br>";
        echo $response;
    }
}
?>
