<?php
file_put_contents('debug.txt', $_SERVER['REQUEST_METHOD'] . "\n", FILE_APPEND);
require_once '../config/cors.php';

// CORS headers - must be first
// $allowedOrigins = ['http://localhost:8080'];
// $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// if (in_array($origin, $allowedOrigins)) {
//     header("Access-Control-Allow-Origin: $origin");
//     header("Access-Control-Allow-Credentials: true");
// }

// header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
// header("Access-Control-Allow-Credentials: true");
// header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
// header("Content-Type: application/json; charset=UTF-8");

// // Handle OPTIONS preflight
// if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
//     http_response_code(200);
//     exit(0);
// }

// echo "hellow world";
include_once '../config/database.php';

//header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        getCategories($db);
        break;
    case 'POST':
        createCategory($db);
        break;
    case 'PUT':
        updateCategory($db);
        break;
    case 'DELETE':
        deleteCategory($db);
        break;
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        break;
}

function getCategories($db) {

    $query = "
        SELECT
            c.id,
            c.name,
            c.description,
            GROUP_CONCAT(sc.name SEPARATOR '||') AS subcategories
        FROM categories c
        LEFT JOIN subcategories sc
            ON sc.category_id = c.id
        GROUP BY c.id
        ORDER BY c.name
    ";

    $stmt = $db->prepare($query);
    $stmt->execute();

    $categories = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {

        $categories[] = array(
            "id" => $row['id'],
            "name" => $row['name'],
            "description" => $row['description'],

            // 🔥 Convert string → array
            "subcategories" =>
                !empty($row['subcategories'])
                ? explode('||', $row['subcategories'])
                : []
        );
    }

    echo json_encode($categories);
}

function createCategory($db) {
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->name)) {

        $name = trim($data->name);

        // CHECK DUPLICATE
// CHECK DUPLICATE
$checkQuery = "
    SELECT id
    FROM categories
    WHERE LOWER(name) = :name
    LIMIT 1
";

$checkStmt = $db->prepare($checkQuery);

$lowerName = strtolower(trim($name));

$checkStmt->bindParam(":name", $lowerName);

$checkStmt->execute();

        if ($checkStmt->rowCount() > 0) {

            http_response_code(409);

            echo json_encode([
                "success" => false,
                "message" => "Category already exists"
            ]);

            return;
        }

        $query = "
            INSERT INTO categories (name, description)
            VALUES (:name, :description)
        ";

        $stmt = $db->prepare($query);

        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":description", $data->description);

        if($stmt->execute()) {

            http_response_code(201);

            echo json_encode([
                "success" => true,
                "message" => "Category created successfully",
                "id" => $db->lastInsertId()
            ]);

        } else {

            http_response_code(503);

            echo json_encode([
                "success" => false,
                "message" => "Unable to create category"
            ]);
        }

    } else {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Category name required"
        ]);
    }
}


function updateCategory($db) {

    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->id) && !empty($data->name)) {

        $name = trim($data->name);

// CHECK DUPLICATE EXCLUDING CURRENT RECORD
$checkQuery = "
    SELECT id
    FROM categories
    WHERE LOWER(name) = :name
    AND id != :id
    LIMIT 1
";

$checkStmt = $db->prepare($checkQuery);

$lowerName = strtolower(trim($name));

$checkStmt->bindParam(":name", $lowerName);
$checkStmt->bindParam(":id", $data->id);

$checkStmt->execute();

        if ($checkStmt->rowCount() > 0) {

            http_response_code(409);

            echo json_encode([
                "success" => false,
                "message" => "Category already exists"
            ]);

            return;
        }

        $query = "
            UPDATE categories
            SET
                name = :name,
                description = :description
            WHERE id = :id
        ";

        $stmt = $db->prepare($query);

        $stmt->bindParam(":id", $data->id);
        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":description", $data->description);

        if($stmt->execute()) {

            echo json_encode([
                "success" => true,
                "message" => "Category updated successfully"
            ]);

        } else {

            http_response_code(503);

            echo json_encode([
                "success" => false,
                "message" => "Unable to update category"
            ]);
        }

    } else {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Category ID and name required"
        ]);
    }
}

function deleteCategory($db)
{
    $id = $_GET['id'] ?? null;

    if (!$id) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Category ID required"
        ]);

        return;
    }

    try {

        // Check products linked to category
        $checkQuery = "
            SELECT COUNT(*) as total
            FROM products
            WHERE category_id = :id
        ";

        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(":id", $id);
        $checkStmt->execute();

        $result = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if ($result['total'] > 0) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Cannot delete category. Products are linked to this category."
            ]);

            return;
        }

        // Delete subcategories first
        $deleteSubQuery = "
            DELETE FROM subcategories
            WHERE category_id = :id
        ";

        $deleteSubStmt = $db->prepare($deleteSubQuery);
        $deleteSubStmt->bindParam(":id", $id);
        $deleteSubStmt->execute();

        // Delete category
        $query = "
            DELETE FROM categories
            WHERE id = :id
        ";

        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $id);

        if ($stmt->execute()) {

            echo json_encode([
                "success" => true,
                "message" => "Category deleted successfully"
            ]);

        } else {

            http_response_code(503);

            echo json_encode([
                "success" => false,
                "message" => "Unable to delete category"
            ]);
        }

    } catch (Exception $e) {

        error_log(
            "Exception in deleteCategory: " .
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
