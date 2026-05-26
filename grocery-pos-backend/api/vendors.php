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

    if (empty($data->name)) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Vendor name required"
        ]);

        return;
    }

    try {

        // ✅ Duplicate check
        $checkQuery = "
            SELECT id
            FROM vendors
            WHERE LOWER(TRIM(name)) = LOWER(TRIM(:name))
        ";

        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(":name", $data->name);
        $checkStmt->execute();

        if ($checkStmt->rowCount() > 0) {

            http_response_code(409);

            echo json_encode([
                "success" => false,
                "message" => "Vendor already exists"
            ]);

            return;
        }

        // ✅ Insert vendor
        $query = "
            INSERT INTO vendors
            (name, contact, email, address)
            VALUES
            (:name, :contact, :email, :address)
        ";

        $stmt = $db->prepare($query);

        $stmt->bindParam(":name", $data->name);
        $stmt->bindParam(":contact", $data->contact);
        $stmt->bindParam(":email", $data->email);
        $stmt->bindParam(":address", $data->address);

        if ($stmt->execute()) {

            http_response_code(201);

            echo json_encode([
                "success" => true,
                "message" => "Vendor created successfully",
                "id" => $db->lastInsertId()
            ]);

        } else {

            http_response_code(503);

            echo json_encode([
                "success" => false,
                "message" => "Unable to create vendor"
            ]);
        }

    } catch (Exception $e) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => $e->getMessage()
        ]);
    }
}

function updateVendor($db) {

    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->id) || empty($data->name)) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Vendor ID and name required"
        ]);

        return;
    }

    try {

        // ✅ Duplicate check excluding current vendor
        $checkQuery = "
            SELECT id
            FROM vendors
            WHERE LOWER(TRIM(name)) = LOWER(TRIM(:name))
            AND id != :id
        ";

        $checkStmt = $db->prepare($checkQuery);

        $checkStmt->bindParam(":name", $data->name);
        $checkStmt->bindParam(":id", $data->id);

        $checkStmt->execute();

        if ($checkStmt->rowCount() > 0) {

            http_response_code(409);

            echo json_encode([
                "success" => false,
                "message" => "Vendor already exists"
            ]);

            return;
        }

        // ✅ Update vendor
        $query = "
            UPDATE vendors
            SET
                name = :name,
                contact = :contact,
                email = :email,
                address = :address
            WHERE id = :id
        ";

        $stmt = $db->prepare($query);

        $stmt->bindParam(":id", $data->id);
        $stmt->bindParam(":name", $data->name);
        $stmt->bindParam(":contact", $data->contact);
        $stmt->bindParam(":email", $data->email);
        $stmt->bindParam(":address", $data->address);

        if ($stmt->execute()) {

            echo json_encode([
                "success" => true,
                "message" => "Vendor updated successfully"
            ]);

        } else {

            http_response_code(503);

            echo json_encode([
                "success" => false,
                "message" => "Unable to update vendor"
            ]);
        }

    } catch (Exception $e) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => $e->getMessage()
        ]);
    }
}


function deleteVendor($db)
{
    $id = $_GET['id'] ?? null;

    if (!$id) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Vendor ID required"
        ]);

        return;
    }

    try {

        // Check linked products
        $checkQuery = "
            SELECT COUNT(*) as total
            FROM products
            WHERE vendor_id = :id
        ";

        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(":id", $id);
        $checkStmt->execute();

        $result = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if ($result['total'] > 0) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Cannot delete vendor. Products are linked to this vendor."
            ]);

            return;
        }

        // Safe delete
        $query = "
            DELETE FROM vendors
            WHERE id = :id
        ";

        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $id);

        if ($stmt->execute()) {

            echo json_encode([
                "success" => true,
                "message" => "Vendor deleted successfully"
            ]);

        } else {

            http_response_code(503);

            echo json_encode([
                "success" => false,
                "message" => "Unable to delete vendor"
            ]);
        }

    } catch (Exception $e) {

        error_log(
            "Exception in deleteVendor: " .
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
