#!/usr/bin/env php
<?php
/**
 * Check Badge Data for User
 * 
 * Usage: php check_badge_issue.php {user_id}
 * Example: php check_badge_issue.php 3
 */

// Get user ID from command line
$userId = $argv[1] ?? null;

if (!$userId) {
    echo "❌ Usage: php check_badge_issue.php {user_id}\n";
    exit(1);
}

echo "🔍 Checking badge data for User ID: $userId\n";
echo str_repeat("=", 60) . "\n\n";

// Database connection (adjust these values)
$host = '127.0.0.1';
$db = 'bank_sampah_mendaur'; // Updated database name
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // 1. Check user exists
    echo "1️⃣ Checking user...\n";
    $stmt = $pdo->prepare("SELECT user_id, nama, email FROM users WHERE user_id = ?");
    $stmt->execute([$userId]);
    $userRow = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$userRow) {
        echo "❌ User ID $userId not found!\n";
        exit(1);
    }
    
    echo "✅ User found: {$userRow['nama']} ({$userRow['email']})\n\n";
    
    // 2. Check badges in user_badges table
    echo "2️⃣ Checking user_badges table...\n";
    $stmt = $pdo->prepare("
        SELECT ub.*, b.nama, b.icon, b.reward_poin 
        FROM user_badges ub
        JOIN badges b ON ub.badge_id = b.badge_id
        WHERE ub.user_id = ?
        ORDER BY ub.tanggal_dapat DESC
    ");
    $stmt->execute([$userId]);
    $userBadges = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "📊 Total badges in user_badges: " . count($userBadges) . "\n\n";
    
    if (count($userBadges) > 0) {
        echo "🏆 User's badges:\n";
        foreach ($userBadges as $badge) {
            echo "   - ID: {$badge['badge_id']} | {$badge['icon']} {$badge['nama']} (+{$badge['reward_poin']} poin)\n";
            echo "     Tanggal: {$badge['tanggal_dapat']}\n";
        }
    } else {
        echo "⚠️ No badges found in user_badges table!\n";
    }
    echo "\n";
    
    // 3. Check all available badges
    echo "3️⃣ Checking all badges in system...\n";
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM badges");
    $totalBadges = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    echo "📋 Total badges in system: $totalBadges\n\n";
    
    // 4. Check badge_title_id
    echo "4️⃣ Checking current badge title...\n";
    $stmt = $pdo->prepare("SELECT badge_title_id FROM users WHERE user_id = ?");
    $stmt->execute([$userId]);
    $badgeTitleId = $stmt->fetch(PDO::FETCH_ASSOC)['badge_title_id'];
    
    if ($badgeTitleId) {
        $stmt = $pdo->prepare("SELECT badge_id, nama, icon FROM badges WHERE badge_id = ?");
        $stmt->execute([$badgeTitleId]);
        $badgeTitle = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "⭐ Current badge title: {$badgeTitle['icon']} {$badgeTitle['nama']} (ID: $badgeTitleId)\n\n";
    } else {
        echo "ℹ️ No badge title set\n\n";
    }
    
    // 5. Simulate API response
    echo "5️⃣ Simulating /unlocked-badges API response...\n";
    echo "Expected response:\n";
    echo json_encode([
        'status' => 'success',
        'data' => [
            'unlocked_badges' => array_map(function($b) {
                return [
                    'badge_id' => (int)$b['badge_id'],
                    'nama' => $b['nama'],
                    'icon' => $b['icon'],
                    'reward_poin' => (int)$b['reward_poin'],
                    'tanggal_dapat' => $b['tanggal_dapat'],
                ];
            }, $userBadges),
            'count' => count($userBadges),
            'current_badge_title_id' => $badgeTitleId ? (int)$badgeTitleId : null,
        ]
    ], JSON_PRETTY_PRINT) . "\n\n";
    
    // 6. Summary
    echo str_repeat("=", 60) . "\n";
    echo "📊 SUMMARY\n";
    echo str_repeat("=", 60) . "\n";
    echo "User: {$userRow['nama']}\n";
    echo "Badges owned: " . count($userBadges) . "\n";
    echo "Current title: " . ($badgeTitleId ? "Set (ID: $badgeTitleId)" : "Not set") . "\n";
    echo "\n";
    
    if (count($userBadges) === 0) {
        echo "⚠️ ISSUE: User has no badges!\n";
        echo "→ Run award_test_badges.php to add badges\n";
    } elseif (count($userBadges) === 1) {
        echo "⚠️ ISSUE: User only has 1 badge!\n";
        echo "→ Expected 6 badges according to screenshot\n";
        echo "→ Check if more badges should be awarded\n";
    } else {
        echo "✅ User has " . count($userBadges) . " badges\n";
        echo "→ If frontend shows fewer, check API endpoint code\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n✅ Check complete!\n";
