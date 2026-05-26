<?php
include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/database.php';

header("Content-Type: application/json");

$db = (new Database())->getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

// 🔹 GET CUSTOMERS
if ($method === 'GET') {

    $stmt = $db->prepare("
        SELECT * FROM customers 
        WHERE deleted_at IS NULL
        ORDER BY id DESC
    ");

    $stmt->execute();
    $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($customers);
    exit();
}

// 🔹 CREATE CUSTOMER
if ($method === 'POST') {

    if (empty($data['name'])) {
        echo json_encode(["success" => false, "message" => "Name required"]);
        exit();
    }

    $stmt = $db->prepare("
        INSERT INTO customers (
            name, phone, email, gender, dob,
            address, city, state, pincode,
            customer_code, loyalty_points,
            preferred_contact, whatsapp_optin,
            gst_number , status
        ) VALUES (
            :name, :phone, :email, :gender, :dob,
            :address, :city, :state, :pincode,
            :customer_code, :loyalty_points,
            :preferred_contact, :whatsapp_optin,
            :gst_number , :status
        )
    ");

    $stmt->execute([
        ":name" => $data['name'],
        ":phone" => $data['phone'] ?? null,
        ":email" => $data['email'] ?? null,
        ":gender" => $data['gender'] ?? null,
        ":dob" => $data['dob'] ?? null,
        ":address" => $data['address'] ?? null,
        ":city" => $data['city'] ?? null,
        ":state" => $data['state'] ?? null,
        ":pincode" => $data['pincode'] ?? null,
        ":customer_code" => $data['customer_code'] ?? uniqid("CUST_"),
        ":loyalty_points" => $data['loyalty_points'] ?? 0,
        ":preferred_contact" => $data['preferred_contact'] ?? 'Phone',
        ":whatsapp_optin" => $data['whatsapp_optin'] ?? 0,
        ":gst_number" => $data['gst_number'] ?? null,
        ":status" => $data['status'] ?? 'active'
    ]);

    echo json_encode([
        "success" => true,
        "id" => $db->lastInsertId()
    ]);
    exit();
}

// 🔹 UPDATE CUSTOMER
if ($method === 'PUT') {

    if (!isset($_GET['id'])) {
        echo json_encode(["success" => false, "message" => "ID required"]);
        exit();
    }

    $id = $_GET['id'];

    $stmt = $db->prepare("
        UPDATE customers SET
            name = :name,
            phone = :phone,
            email = :email,
            gender = :gender,
            dob = :dob,
            address = :address,
            city = :city,
            state = :state,
            pincode = :pincode,
            customer_code = :customer_code,
            preferred_contact = :preferred_contact,
            whatsapp_optin = :whatsapp_optin,
            status = :status,
            gst_number = :gst_number
        WHERE id = :id
    ");

    $stmt->execute([
        ":name" => $data['name'],
        ":phone" => $data['phone'] ?? null,
        ":email" => $data['email'] ?? null,
        ":gender" => $data['gender'] ?? null,
        ":dob" => $data['dob'] ?? null,
        ":address" => $data['address'] ?? null,
        ":city" => $data['city'] ?? null,
        ":state" => $data['state'] ?? null,
        ":pincode" => $data['pincode'] ?? null,
        ":customer_code" => $data['customer_code'] ?? null,
        ":preferred_contact" => $data['preferred_contact'] ?? 'Phone',
        ":whatsapp_optin" => $data['whatsapp_optin'] ?? 0,
        ":status" => $data['status'] ?? 'active',
        ":gst_number" => $data['gst_number'] ?? null,
        ":id" => $id
    ]);

    echo json_encode(["success" => true]);
    exit();
}

// 🔹 DELETE (SOFT DELETE)
if ($method === 'DELETE') {

    if (!isset($_GET['id'])) {
        echo json_encode(["success" => false, "message" => "ID required"]);
        exit();
    }

    $id = $_GET['id'];

$check = $db->prepare("
    SELECT status
    FROM customers
    WHERE id = :id
    AND deleted_at IS NULL
");

$check->execute([":id" => $id]);

$customer = $check->fetch(PDO::FETCH_ASSOC);

if (!$customer) {

    echo json_encode([
        "success" => false,
        "message" => "Customer not found"
    ]);
    exit();
}

// BLOCK ACTIVE CUSTOMER DELETE
if (strtolower($customer["status"]) === "active") {

    echo json_encode([
        "success" => false,
        "message" => "Active customers cannot be deleted. Mark as inactive instead."
    ]);
    exit();
}

// SOFT DELETE
$stmt = $db->prepare("
    UPDATE customers
    SET deleted_at = NOW()
    WHERE id = :id
");

$stmt->execute([":id" => $id]);

echo json_encode([
    "success" => true
]);
    exit();
}

echo json_encode(["success" => false, "message" => "Invalid request"]);