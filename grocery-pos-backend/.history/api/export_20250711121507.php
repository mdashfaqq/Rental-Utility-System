<?php
include_once '../config/cors.php';
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$type = $_GET['type'] ?? 'products';

switch($type) {
    case 'products':
        exportProducts($db);
        break;
    case 'categories':
        exportCategories($db);
        break;
    case 'vendors':
        exportVendors($db);
        break;
    case 'transactions':
        exportTransactions($db);
        break;
    case 'stock-movements':
        exportStockMovements($db);
        break;
    default:
        http_response_code(400);
        echo json_encode(array("message" => "Invalid export type"));
        break;
}

function exportProducts($db) {
    $query = "SELECT p.*, c.name as category_name, v.name as vendor_name 
              FROM products p 
              LEFT JOIN categories c ON p.category_id = c.id 
              LEFT JOIN vendors v ON p.vendor_id = v.id 
              ORDER BY p.name";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    exportToExcel($products, 'products');
}

function exportCategories($db) {
    $query = "SELECT * FROM categories ORDER BY name";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    exportToExcel($categories, 'categories');
}

function exportVendors($db) {
    $query = "SELECT * FROM vendors ORDER BY name";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $vendors = $stmt->fetchAll(PDO::FETCH_ASSOC);
    exportToExcel($vendors, 'vendors');
}

function exportTransactions($db) {
    $query = "SELECT * FROM transactions ORDER BY created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    exportToExcel($transactions, 'transactions');
}

function exportStockMovements($db) {
    $query = "SELECT sm.*, p.name as product_name 
              FROM stock_movements sm 
              LEFT JOIN products p ON sm.product_id = p.id 
              ORDER BY sm.created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $movements = $stmt->fetchAll(PDO::FETCH_ASSOC);
    exportToExcel($movements, 'stock_movements');
}

function exportToExcel($data, $filename) {
    header('Content-Type: application/vnd.ms-excel');
    header('Content-Disposition: attachment; filename="' . $filename . '_' . date('Y-m-d') . '.xls"');
    header('Pragma: no-cache');
    header('Expires: 0');
    
    if (empty($data)) {
        echo "No data available for export.";
        return;
    }
    
    // Output column headers
    echo implode("\t", array_keys($data[0])) . "\n";
    
    // Output data rows
    foreach ($data as $row) {
        $cleanRow = array();
        foreach ($row as $value) {
            $cleanRow[] = str_replace(array("\r", "\n", "\t"), ' ', $value);
        }
        echo implode("\t", $cleanRow) . "\n";
    }
}
?>
