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

    if (!empty($data->name) && !empty($data->category_id)) {

        $name = trim($data->name);

        // CHECK DUPLICATE INSIDE SAME CATEGORY
        $checkQuery = "
            SELECT id
            FROM subcategories
            WHERE LOWER(name) = :name
            AND category_id = :category_id
            LIMIT 1
        ";

        $checkStmt = $db->prepare($checkQuery);

        $lowerName = strtolower($name);

        $checkStmt->bindParam(":name", $lowerName);
        $checkStmt->bindParam(":category_id", $data->category_id);

        $checkStmt->execute();

        if ($checkStmt->rowCount() > 0) {

            http_response_code(409);

            echo json_encode([
                "success" => false,
                "message" => "Sub-category already exists"
            ]);

            return;
        }

        $query = "
            INSERT INTO subcategories
            (name, category_id, description)
            VALUES
            (:name, :category_id, :description)
        ";

        $stmt = $db->prepare($query);

        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":category_id", $data->category_id);
        $stmt->bindParam(":description", $data->description);

        if($stmt->execute()) {

            http_response_code(201);

            echo json_encode([
                "success" => true,
                "message" => "Sub-category created successfully",
                "id" => $db->lastInsertId()
            ]);

        } else {

            http_response_code(503);

            echo json_encode([
                "success" => false,
                "message" => "Unable to create sub-category"
            ]);
        }

    } else {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Sub-category name and category ID required"
        ]);
    }
}


function updateSubCategory($db) {

    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->id) && !empty($data->name)) {

        $name = trim($data->name);

        // CHECK DUPLICATE
        $checkQuery = "
            SELECT id
            FROM subcategories
            WHERE LOWER(name) = :name
            AND category_id = :category_id
            AND id != :id
            LIMIT 1
        ";

        $checkStmt = $db->prepare($checkQuery);

        $lowerName = strtolower($name);

        $checkStmt->bindParam(":name", $lowerName);
        $checkStmt->bindParam(":category_id", $data->category_id);
        $checkStmt->bindParam(":id", $data->id);

        $checkStmt->execute();

        if ($checkStmt->rowCount() > 0) {

            http_response_code(409);

            echo json_encode([
                "success" => false,
                "message" => "Sub-category already exists"
            ]);

            return;
        }

        $query = "
            UPDATE subcategories
            SET
                name = :name,
                category_id = :category_id,
                description = :description
            WHERE id = :id
        ";

        $stmt = $db->prepare($query);

        $stmt->bindParam(":id", $data->id);
        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":category_id", $data->category_id);
        $stmt->bindParam(":description", $data->description);

        if($stmt->execute()) {

            echo json_encode([
                "success" => true,
                "message" => "Sub-category updated successfully"
            ]);

        } else {

            http_response_code(503);

            echo json_encode([
                "success" => false,
                "message" => "Unable to update sub-category"
            ]);
        }

    } else {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Sub-category ID and name required"
        ]);
    }
}


function deleteSubCategory($db)
{
    $id = $_GET['id'] ?? null;

    if (!$id) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Sub-category ID required"
        ]);

        return;
    }

    try {

        // Check products linked to subcategory
        $checkQuery = "
            SELECT COUNT(*) as total
            FROM products
            WHERE subcategory_id = :id
        ";

        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(":id", $id);
        $checkStmt->execute();

        $result = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if ($result['total'] > 0) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Cannot delete sub-category. Products are linked to it."
            ]);

            return;
        }

        // Safe delete
        $query = "
            DELETE FROM subcategories
            WHERE id = :id
        ";

        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $id);

        if ($stmt->execute()) {

            echo json_encode([
                "success" => true,
                "message" => "Sub-category deleted successfully"
            ]);

        } else {

            http_response_code(503);

            echo json_encode([
                "success" => false,
                "message" => "Unable to delete sub-category"
            ]);
        }

    } catch (Exception $e) {

        error_log(
            "Exception in deleteSubCategory: " .
            $e->getMessage()
        );

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Database error: " . $e->getMessage()
        ]);
    }
}
?>
