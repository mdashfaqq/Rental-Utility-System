<?php

include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/database.php';

header("Content-Type: application/json");

$db = (new Database())->getConnection();

try {

    // =========================================
    // GET ALL INVOICES
    // =========================================

$stmt = $db->prepare("
SELECT 

    i.*,

    DATE(i.created_at) AS invoice_date,

    MONTH(i.created_at) AS invoice_month,

    YEAR(i.created_at) AS invoice_year,

    c.gst_number AS gstin

FROM invoices i

LEFT JOIN customers c
    ON i.customer_phone COLLATE utf8mb4_general_ci = c.phone

ORDER BY i.created_at DESC
");
    $stmt->execute();

    $invoices = $stmt->fetchAll(PDO::FETCH_ASSOC);
  

    // =========================================
    // ATTACH ITEMS + RECALCULATE TOTALS
    // =========================================

    foreach ($invoices as &$inv) {

        // =====================================
        // GET CHALLAN ITEMS
        // SAME LOGIC AS INVOICE DETAIL PAGE
        // =====================================

        $stmtItems = $db->prepare("

            SELECT

                dci.product_id,

                dci.product_name,

                dci.quantity_sent,

                dci.rental_days,

                COALESCE(p.selling_price, 0) AS price,

                COALESCE(p.unit_price, 0) AS unitPrice,

                COALESCE(r.good_qty, 0) AS good_qty,

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

        $stmtItems->execute([
            $inv["challan_id"]
        ]);

        $items = $stmtItems->fetchAll(PDO::FETCH_ASSOC);



            // =====================================
// BREAKAGE CALCULATION
// =====================================

$damageTotal = 0;
$missingTotal = 0;

foreach ($items as $item) {

    $damageTotal +=
        (float)$item["damaged_qty"] *
        (float)$item["damage_fee"];

    $missingTotal +=
        (float)$item["missing_qty"] *
        (float)$item["unitPrice"];
}

$breakageTotal =
    $damageTotal + $missingTotal;

// =====================================
// GST CALCULATION
// =====================================

$gstPercentage =
    (float)($inv["gst_percentage"] ?? 0);

$gstAmount =
    (float)($inv["gst_amount"] ?? 0);

$baseTotal =
    (float)$inv["subtotal"] +
    $breakageTotal;


// =====================================
// ADD REPORT FIELDS
// =====================================

$inv["damage_total"] =
    round($damageTotal, 2);

$inv["missing_total"] =
    round($missingTotal, 2);

$inv["breakage_total"] =
    round($breakageTotal, 2);

$inv["base_total"] =
    round($baseTotal, 2);

$inv["gst_amount"] =
    $gstAmount;
    
            // =====================================
// RECALCULATE PAID AMOUNT
// =====================================

$stmtPaid = $db->prepare("

    SELECT
        COALESCE(SUM(amount), 0) as total_paid

    FROM payment_allocations

    WHERE invoice_id = ?

");

$stmtPaid->execute([
    $inv["id"]
]);

$paidData =
    $stmtPaid->fetch(PDO::FETCH_ASSOC);

$paidAmount =
    (float)($paidData["total_paid"] ?? 0);

$inv["paid_amount"] =
    round($paidAmount, 2);

$inv["total_amount"] =
    (float)$inv["total_amount"];
    
$inv["balance_amount"] =
    round(
        (float)$inv["total_amount"] -
        $paidAmount,
        2
    );


        // attach items
        $inv["items"] = $items;
    }


    // =========================================
    // RESPONSE
    // =========================================

    echo json_encode([
        "success" => true,
        "data" => $invoices
    ]);

} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}