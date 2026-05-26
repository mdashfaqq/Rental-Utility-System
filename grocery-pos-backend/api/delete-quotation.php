<?php

include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/database.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->id)) {
    echo json_encode([
        "success" => false,
        "message" => "Quotation ID required"
    ]);
    exit;
}

$db = (new Database())->getConnection();

try {

    // 1. Check if delivery challan exists
    $challanCheck = $db->prepare("
        SELECT id
        FROM delivery_challans
        WHERE quotation_id = :id
        LIMIT 1
    ");

    $challanCheck->execute([
        ":id" => $data->id
    ]);

    if ($challanCheck->fetch()) {

        echo json_encode([
            "success" => false,
            "message" => "Cannot delete quotation because a delivery challan exists"
        ]);

        exit;
    }

    // 2. Delete quotation items first
    $deleteItems = $db->prepare("
        DELETE FROM quotation_items
        WHERE quotation_id = :id
    ");

    $deleteItems->execute([
        ":id" => $data->id
    ]);

    // 3. Delete quotation
    $deleteQuotation = $db->prepare("
        DELETE FROM quotations
        WHERE id = :id
    ");

    $success = $deleteQuotation->execute([
        ":id" => $data->id
    ]);

    echo json_encode([
        "success" => $success,
        "message" => "Quotation deleted successfully"
    ]);

} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}