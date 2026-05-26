
<?php
include_once '../config/cors.php';
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        getVendors($db);
        break;
    case 'POST':
        createVendor($db);
        break;
    case 'PUT':
        updateVendor($db);
        break;
    case 'DELETE':
        deleteVendor($db);
        break;
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        break;
}

function getVendors($db) {
    $query = "SELECT * FROM vendors ORDER BY name";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $vendors = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $vendors[] = array(
            "id" => $row['id'],
            "name" => $row['name'],
            "contact" => $row['contact'],
            "email" => $row['email'],
            "address" => $row['address']
        );
    }
    
    echo json_encode($vendors);
}

function createVendor($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->name)) {
        $query = "INSERT INTO vendors (name, contact, email, address) VALUES (:name, :contact, :email, :address)";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(":name", $data->name);
        $stmt->bindParam(":contact", $data->contact);
        $stmt->bindParam(":email", $data->email);
        $stmt->bindParam(":address", $data->address);
        
        if($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array("message" => "Vendor created successfully", "id" => $db->lastInsertId()));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create vendor"));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Vendor name required"));
    }
}

function updateVendor($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->id) && !empty($data->name)) {
        $query = "UPDATE vendors SET name = :name, contact = :contact, email = :email, address = :address WHERE id = :id";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(":id", $data->id);
        $stmt->bindParam(":name", $data->name);
        $stmt->bindParam(":contact", $data->contact);
        $stmt->bindParam(":email", $data->email);
        $stmt->bindParam(":address", $data->address);
        
        if($stmt->execute()) {
            echo json_encode(array("message" => "Vendor updated successfully"));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to update vendor"));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Vendor ID and name required"));
    }
}

function deleteVendor($db) {
    $id = $_GET['id'] ?? null;
    
    if ($id) {
        $query = "DELETE FROM vendors WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $id);
        
        if($stmt->execute()) {
            echo json_encode(array("message" => "Vendor deleted successfully"));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to delete vendor"));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Vendor ID required"));
    }
}
?>
