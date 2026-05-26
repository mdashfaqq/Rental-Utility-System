<?php
include_once '../config/cors.php';
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// Debug logging
error_log("Products API called with method: " . $method);
if ($method === 'POST' || $method === 'PUT') {
    $input = file_get_contents("php://input");
    error_log("Request body: " . $input);
}

switch ($method) {
    case 'GET':
        getProducts($db);
        break;
    case 'POST':
        createProduct($db);
        break;
    case 'PUT':
        updateProduct($db);
        break;
    case 'DELETE':
        deleteProduct($db);
        break;
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        break;
}

function getProducts($db)
{

    $from = $_GET['from'] ?? null;
    $to = $_GET['to'] ?? null;

$query = "

SELECT

    p.*,

    c.name as category_name,
    v.name as vendor_name,

    COALESCE((
        SELECT SUM(sm.quantity)
        FROM stock_movements sm

        WHERE sm.product_id = p.id
        AND sm.movement_type = 'in'

        AND (
            :from IS NULL
            OR DATE(sm.created_at) >= :from
        )

        AND (
            :to IS NULL
            OR DATE(sm.created_at) <= :to
        )

    ), 0) AS inwardMovement,

COALESCE((
    SELECT
        COALESCE(SUM(dci.quantity_sent), 0)

        -

        COALESCE((
            SELECT SUM(
    dcr.good_qty +
    dcr.damaged_qty +
    dcr.missing_qty
)

            FROM delivery_challan_returns dcr

            INNER JOIN delivery_challan_items dci2
                ON dci2.challan_id = dcr.challan_id
                AND dci2.product_id = dcr.product_id

            WHERE dcr.product_id = p.id

        ), 0)

    FROM delivery_challan_items dci

    INNER JOIN delivery_challans dc
        ON dc.id = dci.challan_id

    WHERE dci.product_id = p.id

), 0) AS outwardMovement

FROM products p

LEFT JOIN categories c
    ON p.category_id = c.id

LEFT JOIN vendors v
    ON p.vendor_id = v.id

ORDER BY p.name

";

    $stmt = $db->prepare($query);

    $stmt->bindParam(":from", $from);
    $stmt->bindParam(":to", $to);

    $stmt->execute();

    $products = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {

        $products[] = array(

            "id" => $row['id'],
            "name" => $row['name'],
            "barcode" => $row['barcode'],

            "price" =>
                floatval($row['selling_price']),

            "unitPrice" =>
                floatval($row['unit_price']),

            "stock" =>
                intval($row['stock']),

            "inwardMovement" =>
                floatval($row['inwardMovement']),

            "outwardMovement" =>
                floatval($row['outwardMovement']),

            "category" =>
                $row['category_name'] ?: '',

            "vendor" =>
                $row['vendor_name'] ?: '',

            "image" =>
                $row['image'],

            "description" =>
                $row['description'] ?? '',

            "unit" =>
                $row['unit'] ?? 'piece',

        );
    }

    echo json_encode($products);
}

function createProduct($db) {
    $data = json_decode(file_get_contents("php://input"));

    error_log("Creating product with data: " . json_encode($data));

    if (!empty($data->name) && isset($data->price)) {
        try {
            // $query = " INTO products
            //           (name, barcode, description, category_id, vendor_id, unit_price, selling_price, stock, unit, small_unit, conversion_factor, min_quantity) 
            //           VALUES 
            //           (:name, :barcode, :description, :category_id, :vendor_id, :unit_price, :selling_price, :stock, :unit, :small_unit, :conversion_factor, :min_quantity)";
            $query = "INSERT INTO products (name, barcode, description, category_id, vendor_id, unit_price, selling_price, stock, unit) 
                      VALUES (:name, :barcode, :description, :category_id, :vendor_id, :unit_price, :selling_price, :stock, :unit )";
    

            $stmt = $db->prepare($query);

            $category_id = getCategoryIdByName($db, $data->category ?? '');
            $vendor_id = getVendorIdByName($db, $data->vendor ?? '');

            $unit_price = floatval($data->unit_price ?? $data->price ?? 0);
            $selling_price = floatval($data->selling_price ?? $data->price ?? 0);
            $stock = intval($data->stock ?? 0);
            $unit = $data->unit ?? 'piece';

            // $small_unit = $data->smallUnit ?? null;
            // $conversion_factor = isset($data->conversionFactor) ? floatval($data->conversionFactor) : null;
            // $min_quantity = isset($data->minQuantity) ? floatval($data->minQuantity) : null;

            $stmt->bindParam(":name", $data->name);
            $stmt->bindParam(":barcode", $data->barcode);
            $stmt->bindParam(":description", $data->description);
            $stmt->bindParam(":category_id", $category_id);
            $stmt->bindParam(":vendor_id", $vendor_id);
            $stmt->bindParam(":unit_price", $unit_price);
            $stmt->bindParam(":selling_price", $selling_price);
            $stmt->bindParam(":stock", $stock);
            $stmt->bindParam(":unit", $unit);
          
            // $stmt->bindParam(":small_unit", $small_unit);
            // $stmt->bindParam(":conversion_factor", $conversion_factor);
            // $stmt->bindParam(":min_quantity", $min_quantity);

            if ($stmt->execute()) {
                $product_id = $db->lastInsertId();
                error_log("Product created successfully with ID: " . $product_id);
                http_response_code(201);
                echo json_encode(array("message" => "Product created successfully", "id" => $product_id));
            } else {
                error_log("Failed to execute product creation query");
                http_response_code(503);
                echo json_encode(array("message" => "Unable to create product"));
            }
        } catch (Exception $e) {
            error_log("Exception in createProduct: " . $e->getMessage());
            http_response_code(503);
            echo json_encode(array("message" => "Database error: " . $e->getMessage()));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Incomplete data. Name and price are required."));
    }
}


function updateProduct($db) {
    $data = json_decode(file_get_contents("php://input"));

    error_log("Updating product with data: " . json_encode($data));

    if (!empty($data->id)) {
        try {
            $query = "UPDATE products SET name = :name, barcode = :barcode, description = :description, 
                      category_id = :category_id, vendor_id = :vendor_id, unit_price = :unit_price, 
                    --   selling_price = :selling_price, stock = :stock, unit = :unit 
                      selling_price = :selling_price, stock = :stock, unit = :unit,
                      updated_at = CURRENT_TIMESTAMP
                      WHERE id = :id";

            $stmt = $db->prepare($query);

            $category_id = getCategoryIdByName($db, $data->category ?? '');
            $vendor_id = getVendorIdByName($db, $data->vendor ?? '');

            $unit_price = floatval($data->unit_price ?? $data->price ?? 0);
            $selling_price = floatval($data->selling_price ?? $data->price ?? 0);
            $stock = intval($data->stock ?? 0);
            $unit = $data->unit ?? 'piece';
            $user_id = $data->user_id ?? null;

            $stmt->bindParam(":id", $data->id);
            $stmt->bindParam(":name", $data->name);
            $stmt->bindParam(":barcode", $data->barcode);
            $stmt->bindParam(":description", $data->description);
            $stmt->bindParam(":category_id", $category_id);
            $stmt->bindParam(":vendor_id", $vendor_id);
            $stmt->bindParam(":unit_price", $unit_price);
            $stmt->bindParam(":selling_price", $selling_price);
            $stmt->bindParam(":stock", $stock);
            $stmt->bindParam(":unit", $unit);
            // $stmt->bindParam(":user_id", $user_id);

            if ($stmt->execute()) {
                error_log("Product updated successfully");
                echo json_encode(array("message" => "Product updated successfully"));
            } else {
                error_log("Failed to execute product update query");
                http_response_code(503);
                echo json_encode(array("message" => "Unable to update product"));
            }
        } catch (Exception $e) {
            error_log("Exception in updateProduct: " . $e->getMessage());
            http_response_code(503);
            echo json_encode(array("message" => "Database error: " . $e->getMessage()));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Product ID required"));
    }
}

function deleteProduct($db)
{
    $id = $_GET['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Product ID required"
        ]);
        return;
    }

    try {

        // Check whether product is already used
$tables = [
    'quotation_items',
    'invoice_items',
    'delivery_challan_items'
];

        foreach ($tables as $table) {

            $checkQuery = "
                SELECT COUNT(*) as total
                FROM $table
                WHERE product_id = :id
            ";

            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->bindParam(":id", $id);
            $checkStmt->execute();

            $result = $checkStmt->fetch(PDO::FETCH_ASSOC);

if ((int)$result['total'] > 0) {

    echo json_encode([
        "success" => false,
        "message" => "Cannot delete product. Product already used in transactions."
    ]);

    exit;
}
        }

        // Safe to delete
        $query = "DELETE FROM products WHERE id = :id";

        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $id);

        if ($stmt->execute()) {

            echo json_encode([
                "success" => true,
                "message" => "Product deleted successfully"
            ]);

        } else {

            http_response_code(503);

            echo json_encode([
                "success" => false,
                "message" => "Unable to delete product"
            ]);
        }

    } catch (Exception $e) {

        error_log("Exception in deleteProduct: " . $e->getMessage());

        http_response_code(503);

        echo json_encode([
            "success" => false,
            "message" => "Database error: " . $e->getMessage()
        ]);
    }
}
function getCategoryIdByName($db, $categoryName)
{
    if (empty($categoryName)) return null;

    $query = "SELECT id FROM categories WHERE name = :name";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":name", $categoryName);
    $stmt->execute();

    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result ? $result['id'] : null;
}

function getVendorIdByName($db, $vendorName)
{
    if (empty($vendorName)) return null;

    $query = "SELECT id FROM vendors WHERE name = :name";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":name", $vendorName);
    $stmt->execute();

    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result ? $result['id'] : null;
}
