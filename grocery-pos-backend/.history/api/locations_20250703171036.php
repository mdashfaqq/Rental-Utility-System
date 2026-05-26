
<?php
include_once '../config/cors.php';
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        getLocations($db);
        break;
    case 'POST':
        createLocation($db);
        break;
    case 'PUT':
        updateLocation($db);
        break;
    case 'DELETE':
        deleteLocation($db);
        break;
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        break;
}

function getLocations($db) {
    $type = isset($_GET['type']) ? $_GET['type'] : null;
    $is_active = isset($_GET['is_active']) ? $_GET['is_active'] : 1;
    
    $query = "SELECT * FROM locations WHERE is_active = :is_active";
    
    if ($type) {
        $query .= " AND type = :type";
    }
    
    $query .= " ORDER BY type, name";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(":is_active", $is_active);
    
    if ($type) {
        $stmt->bindParam(":type", $type);
    }
    
    $stmt->execute();
    
    $locations = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $locations[] = array(
            "id" => $row['id'],
            "name" => $row['name'],
            "type" => $row['type'],
            "address" => $row['address'],
            "contact_number" => $row['contact_number'],
            "manager_name" => $row['manager_name'],
            "email" => $row['email'],
            "is_active" => (bool)$row['is_active'],
            "created_at" => $row['created_at'],
            "updated_at" => $row['updated_at']
        );
    }
    
    echo json_encode($locations);
}

function createLocation($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->name) && !empty($data->type)) {
        try {
            $query = "INSERT INTO locations (name, type, address, contact_number, manager_name, email) 
                      VALUES (:name, :type, :address, :contact_number, :manager_name, :email)";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(":name", $data->name);
            $stmt->bindParam(":type", $data->type);
            $stmt->bindParam(":address", $data->address);
            $stmt->bindParam(":contact_number", $data->contact_number);
            $stmt->bindParam(":manager_name", $data->manager_name);
            $stmt->bindParam(":email", $data->email);
            
            $stmt->execute();
            $locationId = $db->lastInsertId();
            
            // Create stock entries for all active products at this new location
            $stockQuery = "INSERT INTO product_stocks (product_id, location_id, stock, min_stock, max_stock)
                          SELECT id, :location_id, 0, min_stock, max_stock 
                          FROM products WHERE is_active = 1";
            
            $stockStmt = $db->prepare($stockQuery);
            $stockStmt->bindParam(":location_id", $locationId);
            $stockStmt->execute();
            
            http_response_code(201);
            echo json_encode(array(
                "message" => "Location created successfully",
                "id" => $locationId
            ));
            
        } catch (Exception $e) {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create location: " . $e->getMessage()));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Incomplete location data"));
    }
}

function updateLocation($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->id) && !empty($data->name)) {
        try {
            $query = "UPDATE locations SET name = :name, type = :type, address = :address, 
                      contact_number = :contact_number, manager_name = :manager_name, 
                      email = :email, is_active = :is_active WHERE id = :id";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(":id", $data->id);
            $stmt->bindParam(":name", $data->name);
            $stmt->bindParam(":type", $data->type);
            $stmt->bindParam(":address", $data->address);
            $stmt->bindParam(":contact_number", $data->contact_number);
            $stmt->bindParam(":manager_name", $data->manager_name);
            $stmt->bindParam(":email", $data->email);
            $stmt->bindParam(":is_active", $data->is_active);
            
            $stmt->execute();
            
            http_response_code(200);
            echo json_encode(array("message" => "Location updated successfully"));
            
        } catch (Exception $e) {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to update location: " . $e->getMessage()));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Incomplete location data"));
    }
}

function deleteLocation($db) {
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    
    if ($id) {
        try {
            $query = "UPDATE locations SET is_active = 0 WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":id", $id);
            $stmt->execute();
            
            http_response_code(200);
            echo json_encode(array("message" => "Location deactivated successfully"));
            
        } catch (Exception $e) {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to delete location: " . $e->getMessage()));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Location ID required"));
    }
}
?>
