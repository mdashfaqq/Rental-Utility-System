<?php
include_once __DIR__ . '/../config/database.php';
include_once '../config/cors.php';

$db = (new Database())->getConnection();
$data = json_decode(file_get_contents("php://input"), true);

// 🔴 VALIDATION
if (
  !isset($data["invoice_id"]) ||
  !isset($data["paid_amount"]) ||
  !isset($data["total_amount"])
) {
  http_response_code(400);
  echo json_encode(["success" => false, "message" => "Missing required fields"]);
  exit;
}

try {

  // 🔹 Get current invoice
  $stmt = $db->prepare("SELECT paid_amount, total_amount FROM invoices WHERE id = ?");
  $stmt->execute([$data["invoice_id"]]);
  $invoice = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$invoice) {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "Invoice not found"]);
    exit;
  }

  // 🔹 Calculate new payment
  $newPaid = $invoice["paid_amount"] + $data["paid_amount"];
  $total = $data["total_amount"];

  // 🔹 Decide status (BACKEND CONTROL)
  if ($newPaid <= 0) {
    $status = "pending";
  } elseif ($newPaid < $total) {
    $status = "partial";
  } else {
    $status = "paid";
    $newPaid = $total; // prevent overflow
  }

  // 🔹 Update invoice
  $stmt = $db->prepare("
    UPDATE invoices 
    SET paid_amount = ?, damage_fee = ?, late_fee = ?, total_amount = ?, status = ?
    WHERE id = ?
  ");

  $stmt->execute([
    $newPaid,
    $data["damage_fee"] ?? 0,
    $data["late_fee"] ?? 0,
    $total,
    $status,
    $data["invoice_id"]
  ]);

  echo json_encode([
    "success" => true,
    "paid_amount" => $newPaid,
    "status" => $status
  ]);

} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    "success" => false,
    "message" => $e->getMessage()
  ]);
}