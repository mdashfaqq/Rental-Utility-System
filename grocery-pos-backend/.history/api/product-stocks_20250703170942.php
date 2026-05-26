
<?php
include_once '../config/cors.php';
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        getProductStocks($db);
        break;
    case 'POST':
        updateProductStock($db);
        break;
    case 'PUT':
        transferStock($db);
        break;
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        break;
}

function getProductStocks($db) {
    $product_id = isset($_GET['product_id']) ? $_GET['product_id'] : null;
    $location_id = isset($_GET['location_id']) ? $_GET['location_id'] : null;
    $location_type = isset($_GET['location_type']) ? $_GET['location_type'] : null;
    
    $query = "SELECT ps.*, p.name as product_name, p.barcode, l.name as location_name, l.type as location_type
              FROM product_stocks ps
              JOIN products p ON ps.product_id = p.id
              JOIN locations l ON ps.location_id = l.id
              WHERE p.is_active = 1 AND l.is_active = 1";
    
    $params = array();
    
    if ($product_id) {
        $query .= " AND ps.product_id = :product_id";
        $params[':product_id'] = $product_id;
    }
    
    if ($location_id) {
        $query .= " AND ps.location_id = :location_id";
        $params[':location_id'] = $location_id;
    }
    
    if ($location_type) {
        $query .= " AND l.type = :location_type";
        $params[':location_type'] = $location_type;
    }
    
    $query .= " ORDER BY l.type, l.name, p.name";
    
    $stmt = $db->prepare($query);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    $stmt->execute();
    
    $stocks = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $stocks[] = array(
            "id" => $row['id'],
            "product_id" => $row['product_id'],
            "product_name" => $row['product_name'],
            "barcode" => $row['barcode'],
            "location_id" => $row['location_id'],
            "location_name" => $row['location_name'],
            "location_type" => $row['location_type'],
            "stock" => floatval($row['stock']),
            "min_stock" => floatval($row['min_stock']),
            "max_stock" => floatval($row['max_stock']),
            "reserved_stock" => floatval($row['reserved_stock']),
            "updated_at" => $row['updated_at']
        );
    }
    
    echo json_encode($stocks);
}

function updateProductStock($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->product_id) && !empty($data->location_id) && isset($data->stock)) {
        try {
            $db->beginTransaction();
            
            // Update product stock
            $query = "UPDATE product_stocks SET stock = :stock WHERE product_id = :product_id AND location_id = :location_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":stock", $data->stock);
            $stmt->bindParam(":product_id", $data->product_id);
            $stmt->bindParam(":location_id", $data->location_id);
            $stmt->execute();
            
            // Record stock movement
            $movementQuery = "INSERT INTO stock_movements (product_id, location_id, movement_type, quantity, reference_type, reference_number, notes, user_id) 
                              VALUES (:product_id, :location_id, :movement_type, :quantity, 'adjustment', :reference_number, :notes, :user_id)";
            
            $movementStmt = $db->prepare($movementQuery);
            $movementStmt->bindParam(":product_id", $data->product_id);
            $movementStmt->bindParam(":location_id", $data->location_id);
            $movementStmt->bindParam(":movement_type", $data->movement_type);
            $movementStmt->bindParam(":quantity", $data->quantity);
            $movementStmt->bindParam(":reference_number", $data->reference_number);
            $movementStmt->bindParam(":notes", $data->notes);
            $movementStmt->bindParam(":user_id", $data->user_id);
            $movementStmt->execute();
            
            $db->commit();
            
            http_response_code(200);
            echo json_encode(array("message" => "Stock updated successfully"));
            
        } catch (Exception $e) {
            $db->rollback();
            http_response_code(503);
            echo json_encode(array("message" => "Unable to update stock: " . $e->getMessage()));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Incomplete stock data"));
    }
}

function transferStock($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->product_id) && !empty($data->from_location_id) && !empty($data->to_location_id) && !empty($data->quantity)) {
        try {
            $db->beginTransaction();
            
            // Check if source location has enough stock
            $checkQuery = "SELECT stock FROM product_stocks WHERE product_id = :product_id AND location_id = :from_location_id";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->bindParam(":product_id", $data->product_id);
            $checkStmt->bindParam(":from_location_id", $data->from_location_id);
            $checkStmt->execute();
            $currentStock = $checkStmt->fetchColumn();
            
            if ($currentStock < $data->quantity) {
                throw new Exception("Insufficient stock for transfer");
            }
            
            // Reduce stock from source location
            $reduceQuery = "UPDATE product_stocks SET stock = stock - :quantity WHERE product_id = :product_id AND location_id = :from_location_id";
            $reduceStmt = $db->prepare($reduceQuery);
            $reduceStmt->bindParam(":quantity", $data->quantity);
            $reduceStmt->bindParam(":product_id", $data->product_id);
            $reduceStmt->bindParam(":from_location_id", $data->from_location_id);
            $reduceStmt->execute();
            
            // Add stock to destination location
            $addQuery = "UPDATE product_stocks SET stock = stock + :quantity WHERE product_id = :product_id AND location_id = :to_location_id";
            $addStmt = $db->prepare($addQuery);
            $addStmt->bindParam(":quantity", $data->quantity);
            $addStmt->bindParam(":product_id", $data->product_id);
            $addStmt->bindParam(":to_location_id", $data->to_location_id);
            $addStmt->execute();
            
            // Record outgoing movement
            $outMovementQuery = "INSERT INTO stock_movements (product_id, location_id, movement_type, quantity, reference_type, reference_number, notes, user_id) 
                                 VALUES (:product_id, :location_id, 'out', :quantity, 'transfer', :reference_number, :notes, :user_id)";
            $outMovementStmt = $db->prepare($outMovementQuery);
            $outMovementStmt->bindParam(":product_id", $data->product_id);
            $outMovementStmt->bindParam(":location_id", $data->from_location_id);
            $outMovementStmt->bindParam(":quantity", $data->quantity);
            $outMovementStmt->bindParam(":reference_number", $data->reference_number);
            $outMovementStmt->bindParam(":notes", $data->notes);
            $outMovementStmt->bindParam(":user_id", $data->user_id);
            $outMovementStmt->execute();
            
            // Record incoming movement
            $inMovementQuery = "INSERT INTO stock_movements (product_id, location_id, movement_type, quantity, reference_type, reference_number, notes, user_id) 
                                VALUES (:product_id, :location_id, 'in', :quantity, 'transfer', :reference_number, :notes, :user_id)";
            $inMovementStmt = $db->prepare($inMovementQuery);
            $inMovementStmt->bindParam(":product_id", $data->product_id);
            $inMovementStmt->bindParam(":location_id", $data->to_location_id);
            $inMovementStmt->bindParam(":quantity", $data->quantity);
            $inMovementStmt->bindParam(":reference_number", $data->reference_number);
            $inMovementStmt->bindParam(":notes", $data->notes);
            $inMovementStmt->bindParam(":user_id", $data->user_id);
            $inMovementStmt->execute();
            
            $db->commit();
            
            http_response_code(200);
            echo json_encode(array("message" => "Stock transferred successfully"));
            
        } catch (Exception $e) {
            $db->rollback();
            http_response_code(503);
            echo json_encode(array("message" => "Unable to transfer stock: " . $e->getMessage()));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Incomplete transfer data"));
    }
}
?>
