
<?php
include_once __DIR__ . '/../config/cors.php'; // 🔥 IMPORTANT
include_once __DIR__ . '/../config/database.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json");

$db = (new Database())->getConnection();
$db->exec("SET time_zone = '+05:30'");
$data = json_decode(file_get_contents("php://input"), true);

// =================================
// GST ENABLED FROM POS UI
// =================================

$gstEnabled =
    isset($data["gst_enabled"])
        ? (int)$data["gst_enabled"]
        : 0;

// 🔹 VALIDATION
if (!isset($data["challan_id"])) {
    echo json_encode([
        "success" => false,
        "message" => "Challan ID required"
    ]);
    exit();
}

try {

    $db->beginTransaction();

    // 🔹 1. Get challan
    $stmt = $db->prepare("SELECT * FROM delivery_challans WHERE id = ?");
    $stmt->execute([$data["challan_id"]]);
    $challan = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$challan) {
        throw new Exception("Challan not found");
    }
    
    $quotation_id = $challan["quotation_id"] ?? null;
    
    // =================================
// GET QUOTATION DATA
// =================================

$quotationSubtotal = 0;

$quotationDiscount = 0;

$quotationDiscountType = "amount";

if ($quotation_id) {

    $stmtQuotation = $db->prepare("
SELECT
    subtotal,
    discount_amount,
    discount_type,
    total_amount,
    gst_amount,
    gst_percentage
        FROM quotations
        WHERE id = ?
        LIMIT 1
    ");

    $stmtQuotation->execute([
        $quotation_id
    ]);

    $quotation =
        $stmtQuotation->fetch(PDO::FETCH_ASSOC);

    if ($quotation) {

        $quotationSubtotal =
            (float)($quotation["subtotal"] ?? 0);

        $quotationDiscount =
            (float)($quotation["discount_amount"] ?? 0);

        $quotationDiscountType =
            $quotation["discount_type"] ?? "amount";
    }
}

    // 🔹 2. Create invoice
    $stmt = $db->prepare("
INSERT INTO invoices 
(
    customer_name,
    customer_phone,
    start_date,
    end_date,
    subtotal,
    gst_percentage,
    gst_amount,
    discount_amount,
    discount_type,
    total_amount,
    status,
    challan_id,
    quotation_id,
    gst_enabled
)
VALUES (?, ?, ?, ?, ?,0, 0, ?, ?, 0, 'pending', ?, ?, ?)
");

$stmt->execute([

    $challan["customer_name"],

    $challan["customer_phone"],

    $challan["start_date"],

    $challan["end_date"],

    $quotationSubtotal,

    $quotationDiscount,

    $quotationDiscountType,

    $data["challan_id"],

    $quotation_id,

    $gstEnabled ? 1 : 0
]);

    $invoice_id = $db->lastInsertId();
    
    
    // 🔹 3. Get challan items WITH price
$stmtItems = $db->prepare("
SELECT

    dci.*,

    COALESCE(p.selling_price, 0) AS selling_price,

    COALESCE(p.unit_price, 0) AS unit_price,

    COALESCE(r.damaged_qty, 0) AS damaged_qty,

    COALESCE(r.missing_qty, 0) AS missing_qty,

    COALESCE(r.damage_fee, 0) AS damage_fee

FROM delivery_challan_items dci

LEFT JOIN delivery_challan_returns r
    ON dci.product_id = r.product_id
    AND dci.challan_id = r.challan_id

LEFT JOIN products p
    ON dci.product_id = p.id

WHERE dci.challan_id = ?
");
$stmtItems->execute([$data["challan_id"]]);

$items = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

$rentalTotal = 0;

$extraCharges = 0;

// 🔹 4. Insert into invoice_items
$stmtInsert = $db->prepare("
    INSERT INTO invoice_items 
    (invoice_id, product_id, product_name, quantity, price, total)
    VALUES (?, ?, ?, ?, ?, ?)
");

foreach ($items as $item) {

    $qty =
        (float)($item["quantity_sent"] ?? 0);

    $price =
        (float)($item["selling_price"] ?? 0);

    $rentalDays =
        (int)($item["rental_days"] ?? 1);

    // =================================
    // RENTAL TOTAL
    // =================================

// =================================
// RENTAL
// =================================

$rental =
    $qty *
    $price *
    $rentalDays;


// =================================
// DAMAGE
// =================================

$damageTotal =
    (float)$item["damaged_qty"] *
    (float)$item["damage_fee"];


// =================================
// MISSING
// =================================

$missingTotal =
    (float)$item["missing_qty"] *
    (float)$item["unit_price"];


// =================================
// FINAL TOTAL
// =================================

$itemTotal =
    round(
        $rental +
        $damageTotal +
        $missingTotal,
        2
    );

    // =================================
// RENTAL TOTAL
// =================================

$rentalTotal += $rental;

// =================================
// EXTRA CHARGES ONLY
// =================================

$extraCharges +=
    $damageTotal +
    $missingTotal;

    // =================================
    // SAVE ITEM
    // =================================

    $stmtInsert->execute([
        $invoice_id,
        $item["product_id"],
        $item["product_name"],
        $qty,
        $price,
        $itemTotal
    ]);
}


// =================================
// GST CALCULATION
// =================================
// =================================
// GET GST RATE FROM SETTINGS
// =================================

$gstRate = 20;

$stmtTax = $db->prepare("
    SELECT value
    FROM settings
    WHERE `key` = 'gstRate'
    LIMIT 1
");

$stmtTax->execute();

$taxData =
    $stmtTax->fetch(PDO::FETCH_ASSOC);

if ($taxData) {

    $gstRate =
        (float)$taxData["value"];
}

// $gstAmount =
//     $gstEnabled
//         ? round(
//             ($total * $gstRate) / 100,
//             2
//         )
//         : 0;

// $grandTotal =
//     round(
//         $total + $gstAmount,
//         2
//     );
    
    // =================================
// ORIGINAL QUOTATION TOTAL
// =================================

$quotationFinalTotal =
    (float)($quotation["total_amount"] ?? 0);
    
$quotationGstAmount =
    (float)($quotation["gst_amount"] ?? 0);

// =================================
// GST ONLY ON EXTRA CHARGES
// =================================

$gstAmount =
    $quotationGstAmount +
    (
        $gstEnabled
            ? round(
                ($extraCharges * $gstRate) / 100,
                2
            )
            : 0
    );

// =================================
// FINAL TOTAL
// =================================

$grandTotal =
    round(
        (
            $quotationFinalTotal -
            $quotationGstAmount
        ) +
        $extraCharges +
        $gstAmount,
        2
    );
    
// 🔹 5. Update invoice total
$stmtUpdate = $db->prepare("
    UPDATE invoices
SET
    total_amount = ?,
    gst_percentage = ?,
    gst_amount = ?
WHERE id = ?
");

$stmtUpdate->execute([
    $grandTotal,
    $gstRate,
    $gstAmount,
    $invoice_id
]);

    $db->commit();

    echo json_encode([
        "success" => true,
        "invoice_id" => $invoice_id
    ]);

} catch (Exception $e) {

    if ($db->inTransaction()) {
        $db->rollBack();
    }

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}