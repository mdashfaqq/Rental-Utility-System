<?php
include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();

if (!isset($_GET["id"])) {
    echo json_encode([
        "success" => false,
        "message" => "Invoice ID required"
    ]);
    exit();
}

$id = $_GET["id"];

try {

    // 🔹 1. Get invoice
$stmt = $db->prepare("
    SELECT 
        i.*,
        DATE(i.created_at) AS invoice_created_date,
      DATE(dc.created_at) AS challan_created_date,
        -- 🔥 customer details via phone
        c.address AS customer_address,
        c.city AS customer_city,
        c.state,
        c.pincode,
        c.customer_code,
        c.gst_number AS gstin

    FROM invoices i

LEFT JOIN delivery_challans dc
    ON i.challan_id = dc.id
    
    LEFT JOIN customers c 
       ON i.customer_phone COLLATE utf8mb4_general_ci = c.phone

    WHERE i.id = ?
");
    $stmt->execute([$id]);
    $invoice = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$invoice) {
        echo json_encode([
            "success" => false,
            "message" => "Invoice not found"
        ]);
        exit();
    }

    if (!$invoice["challan_id"]) {
        echo json_encode([
            "success" => false,
            "message" => "Invoice not linked to challan"
        ]);
        exit();
    }

    // 🔹 2. Get items + return data + product price
    $stmt = $db->prepare("
        SELECT 
            dci.product_id,
            dci.product_name,
            dci.quantity_sent,

            -- 🔥 price from products table
            COALESCE(p.selling_price, 0) AS price,
            COALESCE(p.unit_price, 0) AS unitPrice,

            -- 🔥 base total
            (dci.quantity_sent * COALESCE(p.selling_price, 0)) AS total,

            -- 🔥 return data
            COALESCE(r.good_qty, 0) AS good_qty,
            COALESCE(r.damaged_qty, 0) AS damaged_qty,
            COALESCE(r.missing_qty, 0) AS missing_qty,

            -- 🔥 damage fee (AUTO CALCULATED)
            COALESCE(r.damage_fee, 0) AS damage_fee

        FROM delivery_challan_items dci

        LEFT JOIN delivery_challan_returns r
            ON dci.product_id = r.product_id
            AND dci.challan_id = r.challan_id

        LEFT JOIN products p
            ON dci.product_id = p.id

        WHERE dci.challan_id = ?
    ");

$stmt->execute([$invoice["challan_id"]]);

$items = $stmt->fetchAll(PDO::FETCH_ASSOC);

$normalItems = [];
$breakageItems = [];
$breakageTotal = 0;


// =====================================
// PROCESS ITEMS
// =====================================

foreach ($items as $item) {

    // normal rental items
    $normalItems[] = $item;

    $damaged =
        (int)$item["damaged_qty"];

    $missing =
        (int)$item["missing_qty"];


    // =====================================
    // DAMAGED ITEMS
    // =====================================

    if ($damaged > 0) {

        $damageFee =
            (float)$item["damage_fee"];

        $damageTotal =
            $damaged * $damageFee;

        $breakageItems[] = [

            "type" => "damaged",

            "product_name" =>
                $item["product_name"],

            "qty" =>
                $damaged,

            "price" =>
                $damageFee,

            "total" =>
                $damageTotal
        ];

        $breakageTotal += $damageTotal;
    }


    // =====================================
    // MISSING ITEMS
    // =====================================

    if ($missing > 0) {

        $unitPrice =
            (float)$item["unitPrice"];

        $missingTotal =
            $missing * $unitPrice;

        $breakageItems[] = [

            "type" => "missing",

            "product_name" =>
                $item["product_name"],

            "qty" =>
                $missing,

            "price" =>
                $unitPrice,

            "total" =>
                $missingTotal
        ];

        $breakageTotal += $missingTotal;
    }

}
    // 🔥 FINANCIAL YEAR LOGIC
$year = date("Y");
$month = date("m");

if ($month >= 4) {
    $fyStart = $year;
    $fyEnd = substr($year + 1, -2);
} else {
    $fyStart = $year - 1;
    $fyEnd = substr($year, -2);
}

$fy = $fyStart . "-" . $fyEnd;

// 🔥 FORMATTED NUMBERS
$invoiceNo = "INV/$fy/" . str_pad($invoice["id"], 4, "0", STR_PAD_LEFT);

$dcNo = $invoice["challan_id"]
    ? "DC/$fy/" . str_pad($invoice["challan_id"], 4, "0", STR_PAD_LEFT)
    : "-";

$invoice["invoice_no_formatted"] = $invoiceNo;
$invoice["dc_no_formatted"] = $dcNo;

echo json_encode([
    "success" => true,
    "invoice" => $invoice,
    "items" => $normalItems,
    "breakage_items" => $breakageItems,
    "breakage_total" => $breakageTotal
]);
    

} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}

