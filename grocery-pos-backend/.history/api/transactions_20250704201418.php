<?php
include_once '../config/cors.php';
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        getTransactions($db);
        break;
    case 'POST':
        createTransaction($db);
        break;
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        break;
}

function getTransactions($db) {
    $query = "SELECT t.*, ti.product_id, p.name as product_name, ti.quantity, ti.unit_price, ti.total_price
              FROM transactions t
              LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
              LEFT JOIN products p ON ti.product_id = p.id
              ORDER BY t.created_at DESC";

    $stmt = $db->prepare($query);
    $stmt->execute();

    $transactions = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $id = $row['id'];

        // If we haven't seen this transaction, create a base structure
        if (!isset($transactions[$id])) {
            $transactions[$id] = [
                "id" => $row['id'],
                "transaction_number" => $row['transaction_number'],
                "bill_number" => $row['bill_number'],
                "subtotal" => floatval($row['subtotal']),
                "tax" => floatval($row['tax_amount']),
                "discount" => floatval($row['discount_amount']),
                "total" => floatval($row['total_amount']),
                "paymentMethod" => $row['payment_method'],
                "timestamp" => $row['created_at'],
                "items" => []
            ];
        }

        // If this row has a product, add it to the items array
        if ($row['product_id']) {
            $transactions[$id]["items"][] = [
                "product_id" => $row['product_id'],
                "product_name" => $row['product_name'],
                "quantity" => floatval($row['quantity']),
                "unit_price" => floatval($row['unit_price']),
                "total_price" => floatval($row['total_price'])
            ];
        }
    }

    // Convert associative array to indexed array
    echo json_encode(array_values($transactions));
}

// function getTransactions($db) {
//     $query = "SELECT t.*, 
//                      JSON_ARRAYAGG(
//                          JSON_OBJECT(
//                              'product_id', ti.product_id,
//                              'product_name', p.name,
//                              'quantity', ti.quantity,
//                              'unit_price', ti.unit_price,
//                              'total_price', ti.total_price
//                          )
//                      ) as items
//               FROM transactions t
//               LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
//               LEFT JOIN products p ON ti.product_id = p.id
//               GROUP BY t.id
//               ORDER BY t.created_at DESC";
    
//     $stmt = $db->prepare($query);
//     $stmt->execute();
    
//     $transactions = array();
//     while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
//         $transactions[] = array(
//             "id" => $row['id'],
//             "transaction_number" => $row['transaction_number'],
//             "bill_number" => $row['bill_number'],
//             "subtotal" => floatval($row['subtotal']),
//             "tax" => floatval($row['tax_amount']),
//             "discount" => floatval($row['discount_amount']),
//             "total" => floatval($row['total_amount']),
//             "paymentMethod" => $row['payment_method'],
//             "timestamp" => $row['created_at'],
//             "items" => json_decode($row['items'])
//         );
//     }
    
//     echo json_encode($transactions);
// }

function createTransaction($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->items) && !empty($data->total)) {
        try {
            $db->beginTransaction();
            
            // Generate transaction number and bill number
            $transactionNumber = 'TXN' . date('Ymd') . sprintf('%04d', rand(1, 9999));
            $billNumber = 'BILL-' . date('Ymd') . '-' . strtoupper(substr(md5(uniqid()), 0, 4));
            
            // Insert transaction
            $query = "INSERT INTO transactions (transaction_number, bill_number, subtotal, tax_amount, discount_amount, total_amount, payment_method) 
                      VALUES (:transaction_number, :bill_number, :subtotal, :tax_amount, :discount_amount, :total_amount, :payment_method)";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(":transaction_number", $transactionNumber);
            $stmt->bindParam(":bill_number", $billNumber);
            $stmt->bindParam(":subtotal", $data->subtotal);
            $stmt->bindParam(":tax_amount", $data->tax);
            $stmt->bindParam(":discount_amount", $data->discount);
            $stmt->bindParam(":total_amount", $data->total);
            $stmt->bindParam(":payment_method", $data->paymentMethod);
            
            $stmt->execute();
            $transactionId = $db->lastInsertId();
            
            // Insert transaction items and update stock
            foreach ($data->items as $item) {
                // Insert transaction item
                $itemQuery = "INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price, total_price) 
                              VALUES (:transaction_id, :product_id, :quantity, :unit_price, :total_price)";
                
                $itemStmt = $db->prepare($itemQuery);
                $itemStmt->bindParam(":transaction_id", $transactionId);
                $itemStmt->bindParam(":product_id", $item->id);
                $itemStmt->bindParam(":quantity", $item->quantity);
                $itemStmt->bindParam(":unit_price", $item->price);
                $totalPrice = $item->price * $item->quantity;
                $itemStmt->bindParam(":total_price", $totalPrice);
                $itemStmt->execute();
                
                // Update product stock
                $stockQuery = "UPDATE products SET stock = stock - :quantity WHERE id = :product_id";
                $stockStmt = $db->prepare($stockQuery);
                $stockStmt->bindParam(":quantity", $item->quantity);
                $stockStmt->bindParam(":product_id", $item->id);
                $stockStmt->execute();
                
                // Record stock movement
                $movementQuery = "INSERT INTO stock_movements (product_id, movement_type, quantity, reference_type, reference_id) 
                                  VALUES (:product_id, 'out', :quantity, 'sale', :reference_id)";
                $movementStmt = $db->prepare($movementQuery);
                $movementStmt->bindParam(":product_id", $item->id);
                $movementStmt->bindParam(":quantity", $item->quantity);
                $movementStmt->bindParam(":reference_id", $transactionId);
                $movementStmt->execute();
            }
            
            $db->commit();
            
            http_response_code(201);
            echo json_encode(array(
                "message" => "Transaction created successfully",
                "transaction_id" => $transactionId,
                "transaction_number" => $transactionNumber,
                "bill_number" => $billNumber
            ));
            
        } catch (Exception $e) {
            $db->rollback();
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create transaction: " . $e->getMessage()));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Incomplete transaction data"));
    }
}
?>
