<?php

include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/database.php';

header("Content-Type: application/json");


// =========================================
// HANDLE PREFLIGHT
// =========================================

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {

    http_response_code(200);
    exit();
}


$db = (new Database())->getConnection();

$phone = $_GET["phone"] ?? "";


// =========================================
// VALIDATION
// =========================================

if (!$phone) {

    echo json_encode([
        "success" => false,
        "message" => "Phone required"
    ]);

    exit();
}


try {

    // =====================================
    // GET CUSTOMER INVOICES
    // =====================================

$stmt = $db->prepare("

SELECT
    id,
    challan_id,
    total_amount,
    paid_amount,
    status,
    created_at

FROM invoices

WHERE customer_phone = ?

ORDER BY id DESC

");

    $stmt->execute([
        $phone
    ]);

    $invoices = $stmt->fetchAll(PDO::FETCH_ASSOC);


    // =====================================
    // OVERALL TOTALS
    // =====================================

    $overallTotal = 0;
    $overallPaid = 0;


    // =====================================
    // PROCESS EACH INVOICE
    // =====================================

    foreach ($invoices as &$inv) {

        // =================================
        // GET CHALLAN ITEMS
        // =================================

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

        $items =
            $stmtItems->fetchAll(PDO::FETCH_ASSOC);


        // =================================
        // RECALCULATE TOTAL
        // =================================

        $invoiceTotal = 0;

        foreach ($items as &$item) {

            $qty =
                (int)($item["quantity_sent"] ?? 0);

            $damaged =
                (int)($item["damaged_qty"] ?? 0);

            $missing =
                (int)($item["missing_qty"] ?? 0);

            $rentalPrice =
                (float)($item["price"] ?? 0);

            $unitPrice =
                (float)($item["unitPrice"] ?? 0);

            $damageFee =
                (float)($item["damage_fee"] ?? 0);


            // =============================
            // RENTAL CHARGE
            // =============================
            $rentalDays =
    (int)($item["rental_days"] ?? 1);

            $rental =
    $qty * $rentalPrice * $rentalDays;


            // =============================
            // DAMAGED CHARGE
            // =============================

            $breakage =
                $damaged * $damageFee;


            // =============================
            // MISSING CHARGE
            // =============================

            $missingCost =
                $missing * $unitPrice;


            // =============================
            // ITEM TOTAL
            // =============================

            $itemTotal =
                $rental +
                $breakage +
                $missingCost;


            // attach item total
            $item["calculated_total"] =
                round($itemTotal, 2);

            $invoiceTotal += $itemTotal;
        }


// =================================
// USE STORED DB TOTAL
// =================================

$inv["total_amount"] =
    (float)($inv["total_amount"] ?? 0);

$inv["balance_amount"] =
    round(
        (float)$inv["total_amount"] -
        (float)$inv["paid_amount"],
        2
    );

        // attach items
        $inv["items"] = $items;


        // =================================
        // OVERALL TOTALS
        // =================================
        
$overallTotal +=
    (float)$inv["total_amount"];

        $overallPaid +=
            (float)$inv["paid_amount"];
    }


    // =====================================
    // RESPONSE
    // =====================================

    echo json_encode([

        "success" => true,

        "invoices" => $invoices,

        "total" =>
            round($overallTotal, 2),

        "paid" =>
            round($overallPaid, 2),

        "balance" =>
            round(
                $overallTotal -
                $overallPaid,
                2
            )
    ]);

} catch (Exception $e) {

    echo json_encode([

        "success" => false,

        "error" => $e->getMessage()
    ]);
}