<?php

include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/database.php';

header("Content-Type: application/json");

$db = (new Database())->getConnection();

try {

    $activities = [];

    // =====================================
    // RECENT INVOICES
    // =====================================

    $invoiceQuery = $db->query("

        SELECT
            id,
            customer_name,
            total_amount,
            created_at

        FROM invoices

        ORDER BY created_at DESC

        LIMIT 5

    ");

    foreach ($invoiceQuery as $row) {

        $activities[] = [

            "type" => "sale",

            "message" =>
                "Invoice #{$row['id']} created for {$row['customer_name']}",

            "time" =>
                date("d M Y h:i A", strtotime($row["created_at"])),

            "amount" =>
                "₹" . number_format($row["total_amount"], 2)
        ];
    }


    // =====================================
    // RECENT PAYMENTS
    // =====================================

    $paymentQuery = $db->query("

        SELECT
            customer_name,
            amount,
            payment_method,
            created_at

        FROM payments

        ORDER BY created_at DESC

        LIMIT 5

    ");

    foreach ($paymentQuery as $row) {

        $activities[] = [

            "type" => "payment",

            "message" =>
                "Payment received from {$row['customer_name']} via {$row['payment_method']}",

            "time" =>
                date("d M Y h:i A", strtotime($row["created_at"])),

            "amount" =>
                "₹" . number_format($row["amount"], 2)
        ];
    }


    // =====================================
    // LOW STOCK PRODUCTS
    // =====================================

    $stockQuery = $db->query("

        SELECT
            name,
            stock

        FROM products

        WHERE stock <= 5

        ORDER BY stock ASC

        LIMIT 5

    ");

    foreach ($stockQuery as $row) {

        $activities[] = [

            "type" => "stock",

            "message" =>
                "{$row['name']} stock running low ({$row['stock']} left)",

            "time" => "Recently"
        ];
    }


    // =====================================
    // RECENT RETURNS
    // =====================================

    $returnQuery = $db->query("

        SELECT
            challan_id,
            created_at

        FROM delivery_challan_returns

        ORDER BY created_at DESC

        LIMIT 5

    ");

    foreach ($returnQuery as $row) {

        $activities[] = [

            "type" => "return",

            "message" =>
                "Return inspection completed for DC #{$row['challan_id']}",

            "time" =>
                date("d M Y h:i A", strtotime($row["created_at"]))
        ];
    }


    // =====================================
    // SORT ALL ACTIVITIES
    // =====================================

    usort($activities, function ($a, $b) {

        return strtotime($b["time"])
            - strtotime($a["time"]);
    });

    echo json_encode([

        "success" => true,

        "activities" =>
            array_slice($activities, 0, 10)
    ]);

} catch (Exception $e) {

    echo json_encode([

        "success" => false,

        "error" => $e->getMessage()
    ]);
}