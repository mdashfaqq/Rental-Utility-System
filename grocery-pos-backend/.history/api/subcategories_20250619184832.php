<?php
include_once '../config/cors.php';
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        getSubCategories($db);
        break;
    case 'POST':
        createSubCategory($db);
        break;
    case 'PUT':
        updateSubCategory($db);
        break;
    case 'DELETE':
        deleteSubCategory($db);
        break;
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        break;
}

function getSubCategories($db) {
    $query = "SELECT s.*, c.name as category_name 
              FROM subcategories s 
              LEFT JOIN categories c ON s.category_id = c.id 
              ORDER BY c.name, s.name";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $subcategories = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $subcategories[] = array(
            "id" => $row['id'],
            "name" => $row['name'],
            "category_id" => $row['category_id'],
            "category_name" => $row['category_name'],
            "description" => $row['description']
        );
    }
    
    echo json_encode($subcategories);
}

function createSubCategory($db) {
    $data = json_decode(file_get_contents("php://input"));
    //echo $data;
    if (!empty($data->name) && !empty($data->category_id)) {
        $query = "INSERT INTO subcategories (name, category_id, description) VALUES (:name, :category_id, :description)";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(":name", $data->name);
        $stmt->bindParam(":category_id", $data->category_id);
        $stmt->bindParam(":description", $data->description);
        
        if($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array("message" => "Sub-category created successfully", "id" => $db->lastInsertId()));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create sub-category"));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Sub-category name and category ID required"));
    }
}

function updateSubCategory($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->id) && !empty($data->name)) {
        $query = "UPDATE subcategories SET name = :name, category_id = :category_id, description = :description WHERE id = :id";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(":id", $data->id);
        $stmt->bindParam(":name", $data->name);
        $stmt->bindParam(":category_id", $data->category_id);
        $stmt->bindParam(":description", $data->description);
        
        if($stmt->execute()) {
            echo json_encode(array("message" => "Sub-category updated successfully"));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to update sub-category"));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Sub-category ID and name required"));
    }
}

function deleteSubCategory($db) {
    $id = $_GET['id'] ?? null;
    
    if ($id) {
        $query = "DELETE FROM subcategories WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $id);
        
        if($stmt->execute()) {
            echo json_encode(array("message" => "Sub-category deleted successfully"));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to delete sub-category"));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Sub-category ID required"));
    }
}
?>
