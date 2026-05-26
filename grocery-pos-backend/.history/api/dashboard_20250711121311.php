<?php
include_once '../config/cors.php';
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    getDashboardStats($db);
} else {
    http_response_code(405);
    echo json_encode(array("message" => "Method not allowed"));
}

function getDashboardStats($db) {
    $stats = array();
    
    // Total products
    $query = "SELECT COUNT(*) as total_products FROM products";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $stats['total_products'] = $stmt->fetch(PDO::FETCH_ASSOC)['total_products'];
    
    // Low stock products (less than 10)
    $query = "SELECT COUNT(*) as low_stock_products FROM products WHERE stock < 10";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $stats['low_stock_products'] = $stmt->fetch(PDO::FETCH_ASSOC)['low_stock_products'];
    
    // Today's sales
    $query = "SELECT COUNT(*) as today_transactions, COALESCE(SUM(total_amount), 0) as today_revenue 
              FROM transactions WHERE DATE(created_at) = CURDATE()";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $todayStats = $stmt->fetch(PDO::FETCH_ASSOC);
    $stats['today_transactions'] = $todayStats['today_transactions'];
    $stats['today_revenue'] = floatval($todayStats['today_revenue']);
    
    // Total categories
    $query = "SELECT COUNT(*) as total_categories FROM categories";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $stats['total_categories'] = $stmt->fetch(PDO::FETCH_ASSOC)['total_categories'];
    
    // Total vendors
    $query = "SELECT COUNT(*) as total_vendors FROM vendors";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $stats['total_vendors'] = $stmt->fetch(PDO::FETCH_ASSOC)['total_vendors'];
    
    // Recent transactions
    $query = "SELECT t.id, t.transaction_number, t.total_amount, t.payment_method, t.created_at
              FROM transactions t
              ORDER BY t.created_at DESC
              LIMIT 5";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $recentTransactions = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $recentTransactions[] = array(
            "id" => $row['id'],
            "transaction_number" => $row['transaction_number'],
            "total" => floatval($row['total_amount']),
            "payment_method" => $row['payment_method'],
            "timestamp" => $row['created_at']
        );
    }
    $stats['recent_transactions'] = $recentTransactions;
    
    echo json_encode($stats);
}
?>
