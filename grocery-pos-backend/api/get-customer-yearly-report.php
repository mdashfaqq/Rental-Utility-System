<?php
include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/database.php';

header("Content-Type: application/json");

$db = (new Database())->getConnection();

try {

    // =========================================
    // GET ALL INVOICES + PAYMENTS
    // =========================================

    $stmt = $db->prepare("

        SELECT

            i.id,
            i.customer_name,
            i.customer_phone,
            i.total_amount,
            i.created_at,

            COALESCE(
                (
                    SELECT SUM(pa.amount)
                    FROM payment_allocations pa
                    WHERE pa.invoice_id = i.id
                ),
                0
            ) AS paid_amount

        FROM invoices i

        ORDER BY i.created_at ASC

    ");

    $stmt->execute();

    $invoices = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // =========================================
    // REPORT DATA
    // =========================================

    $report = [];

    foreach ($invoices as $inv) {

        $customer =
            trim($inv["customer_name"] ?: "Walk-in");

        $date =
            new DateTime($inv["created_at"]);

        $month =
            (int)$date->format("n");

        $year =
            (int)$date->format("Y");

        // =====================================
        // FINANCIAL YEAR
        // APR -> MAR
        // =====================================

        if ($month >= 4) {

            $fyStart = $year;
            $fyEnd = $year + 1;

        } else {

            $fyStart = $year - 1;
            $fyEnd = $year;
        }

        $financialYear =
            $fyStart . "-" . $fyEnd;

        // =====================================
        // MONTH KEY
        // =====================================

        $monthMap = [
            4  => "apr",
            5  => "may",
            6  => "jun",
            7  => "jul",
            8  => "aug",
            9  => "sep",
            10 => "oct",
            11 => "nov",
            12 => "dec",
            1  => "jan",
            2  => "feb",
            3  => "mar",
        ];

        $monthKey =
            $monthMap[$month];

        // =====================================
        // UNIQUE GROUP KEY
        // =====================================

        $key =
            $customer . "_" . $financialYear;

        // =====================================
        // INITIALIZE ROW
        // =====================================

        if (!isset($report[$key])) {

            $report[$key] = [

                "customer_name" =>
                    $customer,

                "customer_phone" =>
                    $inv["customer_phone"],

                "financial_year" =>
                    $financialYear,

                "apr" => 0,
                "may" => 0,
                "jun" => 0,
                "jul" => 0,
                "aug" => 0,
                "sep" => 0,
                "oct" => 0,
                "nov" => 0,
                "dec" => 0,
                "jan" => 0,
                "feb" => 0,
                "mar" => 0,

                "total" => 0,
                "received" => 0,
                "balance" => 0,
            ];
        }

        // =====================================
        // ADD MONTH VALUE
        // =====================================

        $amount =
            (float)$inv["total_amount"];

        $paid =
            (float)$inv["paid_amount"];

        $report[$key][$monthKey] +=
            $amount;

        $report[$key]["total"] +=
            $amount;

        $report[$key]["received"] +=
            $paid;

$report[$key]["balance"] =
    round(
        $report[$key]["total"] -
        $report[$key]["received"],
        2
    );
    }

// =========================================
// SORT REPORT
// =========================================

$report =
    array_values($report);

usort($report, function ($a, $b) {

    // CUSTOMER SORT
    $customerCompare =
        strcmp(
            strtolower($a["customer_name"]),
            strtolower($b["customer_name"])
        );

    if ($customerCompare !== 0) {
        return $customerCompare;
    }

    // FINANCIAL YEAR SORT
    return strcmp(
        $a["financial_year"],
        $b["financial_year"]
    );
});

// =========================================
// RESPONSE
// =========================================

echo json_encode([
    "success" => true,
    "data" => $report
]);

} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}