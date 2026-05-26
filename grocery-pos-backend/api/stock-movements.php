
<?php
// include_once '../config/cors.php';
// include_once '../config/database.php';

// $database = new Database();
// $db = $database->getConnection();

// $method = $_SERVER['REQUEST_METHOD'];

// switch($method) {
//     case 'GET':
//         getStockMovements($db);
//         break;
//     case 'POST':
//         createStockMovement($db);
//         break;
//     case 'PUT':
//         updateStockMovement($db);
//         break;
//     case 'DELETE':
//         deleteStockMovement($db);
//         break;
//     default:
//         http_response_code(405);
//         echo json_encode(array("message" => "Method not allowed"));
//         break;
// }

// function getStockMovements($db) {
//     $product_id = isset($_GET['product_id']) ? $_GET['product_id'] : null;
//     $movement_type = isset($_GET['movement_type']) ? $_GET['movement_type'] : null;
//     $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
//     $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

//     $query = "SELECT sm.*, p.name as product_name, p.barcode, v.name as supplier_name, u.full_name as user_name
//               FROM stock_movements sm
//               LEFT JOIN products p ON sm.product_id = p.id
//               LEFT JOIN vendors v ON sm.supplier_id = v.id
//               LEFT JOIN users u ON sm.user_id = u.id
//               WHERE 1=1";
    
//     $params = array();
    
//     if ($product_id) {
//         $query .= " AND sm.product_id = :product_id";
//         $params[':product_id'] = $product_id;
//     }
    
//     if ($movement_type) {
//         $query .= " AND sm.movement_type = :movement_type";
//         $params[':movement_type'] = $movement_type;
//     }
    
//     $query .= " ORDER BY sm.created_at DESC LIMIT :limit OFFSET :offset";
    
//     $stmt = $db->prepare($query);
    
//     foreach ($params as $key => $value) {
//         $stmt->bindValue($key, $value);
//     }
//     $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
//     $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    
//     $stmt->execute();
    
//     $movements = array();
//     while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
//         $movements[] = array(
//             "id" => $row['id'],
//             "product_id" => $row['product_id'],
//             "product_name" => $row['product_name'],
//             "barcode" => $row['barcode'],
//             "movement_type" => $row['movement_type'],
//             "quantity" => floatval($row['quantity']),
//             "unit_cost" => floatval($row['unit_cost']),
//             "total_cost" => floatval($row['total_cost']),
//             "reference_type" => $row['reference_type'],
//             "reference_id" => $row['reference_id'],
//             "reference_number" => $row['reference_number'],
//             "supplier_id" => $row['supplier_id'],
//             "supplier_name" => $row['supplier_name'],
//             "batch_number" => $row['batch_number'],
//             "expiry_date" => $row['expiry_date'],
//             "notes" => $row['notes'],
//             "user_id" => $row['user_id'],
//             "user_name" => $row['user_name'],
//             "created_at" => $row['created_at']
//         );
//     }
    
//     echo json_encode($movements);
// }

// function createStockMovement($db) {
//     $data = json_decode(file_get_contents("php://input"));
    
//     if (!empty($data->product_id) && !empty($data->movement_type) && !empty($data->quantity)) {
//         try {
//             $db->beginTransaction();
            
//             // Insert stock movement
//             $query = "INSERT INTO stock_movements 
//                       (product_id, movement_type, quantity, unit_cost, total_cost, reference_type, reference_number, supplier_id, batch_number, expiry_date, notes, user_id) 
//                       VALUES 
//                       (:product_id, :movement_type, :quantity, :unit_cost, :total_cost, :reference_type, :reference_number, :supplier_id, :batch_number, :expiry_date, :notes, :user_id)";
            
//             $stmt = $db->prepare($query);
//             $stmt->bindParam(":product_id", $data->product_id);
//             $stmt->bindParam(":movement_type", $data->movement_type);
//             $stmt->bindParam(":quantity", $data->quantity);
//             $stmt->bindParam(":unit_cost", $data->unit_cost ?? 0);
//             $stmt->bindParam(":total_cost", $data->total_cost ?? 0);
//             $stmt->bindParam(":reference_type", $data->reference_type);
//             $stmt->bindParam(":reference_number", $data->reference_number ?? null);
//             $stmt->bindParam(":supplier_id", $data->supplier_id ?? null);
//             $stmt->bindParam(":batch_number", $data->batch_number ?? null);
//             $stmt->bindParam(":expiry_date", $data->expiry_date ?? null);
//             $stmt->bindParam(":notes", $data->notes ?? null);
//             $stmt->bindParam(":user_id", $data->user_id ?? null);
            
//             $stmt->execute();
//             $movementId = $db->lastInsertId();
            
//             // Update product stock
//             $stockUpdateQuery = "UPDATE products SET stock = stock " . 
//                                ($data->movement_type === 'in' ? '+' : '-') . 
//                                " :quantity WHERE id = :product_id";
            
//             $stockStmt = $db->prepare($stockUpdateQuery);
//             $stockStmt->bindParam(":quantity", $data->quantity);
//             $stockStmt->bindParam(":product_id", $data->product_id);
//             $stockStmt->execute();
            
//             $db->commit();
            
//             http_response_code(201);
//             echo json_encode(array(
//                 "message" => "Stock movement created successfully",
//                 "id" => $movementId
//             ));
            
//         } catch (Exception $e) {
//             $db->rollback();
//             http_response_code(503);
//             echo json_encode(array("message" => "Unable to create stock movement: " . $e->getMessage()));
//         }
//     } else {
//         http_response_code(400);
//         echo json_encode(array("message" => "Incomplete stock movement data"));
//     }
// }

// function updateStockMovement($db) {
//     // Implementation for updating stock movements if needed
//     http_response_code(501);
//     echo json_encode(array("message" => "Update not implemented"));
// }

// function deleteStockMovement($db) {
//     // Implementation for deleting stock movements if needed
//     http_response_code(501);
//     echo json_encode(array("message" => "Delete not implemented"));
// }
?>

<?php
include_once '../config/cors.php';
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// Debug logging
error_log("Stock movements API called with method: " . $method);
if ($method === 'POST' || $method === 'PUT') {
    $input = file_get_contents("php://input");
    error_log("Request body: " . $input);
}

switch($method) {
    case 'GET':
        getStockMovements($db);
        break;
    case 'POST':
        createStockMovement($db);
        break;
    case 'PUT':
        updateStockMovement($db);
        break;
    case 'DELETE':
        deleteStockMovement($db);
        break;
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        break;
}

function getStockMovements($db) {
    $product_id = isset($_GET['product_id']) ? $_GET['product_id'] : null;
    $movement_type = isset($_GET['movement_type']) ? $_GET['movement_type'] : null;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

    $query = "SELECT sm.*, p.name as product_name, p.barcode, v.name as supplier_name, u.full_name as user_name
              FROM stock_movements sm
              LEFT JOIN products p ON sm.product_id = p.id
              LEFT JOIN vendors v ON sm.supplier_id = v.id
              LEFT JOIN users u ON sm.user_id = u.id
              WHERE 1=1";
    
    $params = array();
    
    if ($product_id) {
        $query .= " AND sm.product_id = :product_id";
        $params[':product_id'] = $product_id;
    }
    
    if ($movement_type) {
        $query .= " AND sm.movement_type = :movement_type";
        $params[':movement_type'] = $movement_type;
    }
    
    $query .= " ORDER BY sm.created_at DESC LIMIT :limit OFFSET :offset";
    
    $stmt = $db->prepare($query);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    
    $stmt->execute();
    
    $movements = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $movements[] = array(
            "id" => $row['id'],
            "product_id" => $row['product_id'],
            "product_name" => $row['product_name'],
            "barcode" => $row['barcode'],
            "movement_type" => $row['movement_type'],
            "quantity" => floatval($row['quantity']),
            "unit_cost" => floatval($row['unit_cost']),
            "total_cost" => floatval($row['total_cost']),
            "reference_type" => $row['reference_type'],
            "reference_id" => $row['reference_id'],
            "reference_number" => $row['reference_number'],
            "supplier_id" => $row['supplier_id'],
            "supplier_name" => $row['supplier_name'],
            "batch_number" => $row['batch_number'],
            "expiry_date" => $row['expiry_date'],
            "notes" => $row['notes'],
            "user_id" => $row['user_id'],
            "user_name" => $row['user_name'],
            "created_at" => $row['created_at']
        );
    }
    
    echo json_encode($movements);
}

function createStockMovement($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    error_log("Creating stock movement with data: " . json_encode($data));
    
    if (!empty($data->product_id) && !empty($data->movement_type) && !empty($data->quantity)) {
        try {
            $db->beginTransaction();
            
            // Insert stock movement
            $query = "INSERT INTO stock_movements 
                      (product_id, movement_type, quantity, unit_cost, total_cost, reference_type, reference_number, supplier_id, batch_number, expiry_date, notes, user_id) 
                      VALUES 
                      (:product_id, :movement_type, :quantity, :unit_cost, :total_cost, :reference_type, :reference_number, :supplier_id, :batch_number, :expiry_date, :notes, :user_id)";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(":product_id", $data->product_id);
            $stmt->bindParam(":movement_type", $data->movement_type);
            $stmt->bindParam(":quantity", $data->quantity);
            $stmt->bindParam(":unit_cost", $data->unit_cost);
            $stmt->bindParam(":total_cost", $data->total_cost);
            $stmt->bindParam(":reference_type", $data->reference_type);
            $stmt->bindParam(":reference_number", $data->reference_number);
            $stmt->bindParam(":supplier_id", $data->supplier_id);
            $stmt->bindParam(":batch_number", $data->batch_number);
            $stmt->bindParam(":expiry_date", $data->expiry_date);
            $stmt->bindParam(":notes", $data->notes);
            $stmt->bindParam(":user_id", $data->user_id);
            
            $stmt->execute();
            $movementId = $db->lastInsertId();
            
            // Update product stock
            $stockUpdateQuery = "UPDATE products SET stock = stock " . 
                               ($data->movement_type === 'in' ? '+' : '-') . 
                               " :quantity WHERE id = :product_id";
            
            $stockStmt = $db->prepare($stockUpdateQuery);
            $stockStmt->bindParam(":quantity", $data->quantity);
            $stockStmt->bindParam(":product_id", $data->product_id);
            $stockStmt->execute();
            
            $db->commit();
            
            error_log("Stock movement created successfully with ID: " . $movementId);
            
            http_response_code(201);
            echo json_encode(array(
                "message" => "Stock movement created successfully",
                "id" => $movementId
            ));
            
        } catch (Exception $e) {
            $db->rollback();
            error_log("Exception in createStockMovement: " . $e->getMessage());
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create stock movement: " . $e->getMessage()));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Incomplete stock movement data. Product ID, movement type, and quantity are required."));
    }
}

function updateStockMovement($db) {
    // Implementation for updating stock movements if needed
    http_response_code(501);
    echo json_encode(array("message" => "Update not implemented"));
}

function deleteStockMovement($db) {
    // Implementation for deleting stock movements if needed
    http_response_code(501);
    echo json_encode(array("message" => "Delete not implemented"));
}
?>
