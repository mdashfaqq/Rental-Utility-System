<?php

include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/database.php';

$db = (new Database())->getConnection();

$data = json_decode(
    file_get_contents("php://input"),
    true
);

if (
    !isset($data["challan_id"])
) {
    echo json_encode([
        "success" => false,
        "message" => "Challan ID required"
    ]);
    exit();
}

try {

    $db->beginTransaction();

    // =====================================================
    // 1. GET RETURN INSPECTION ITEMS
    // =====================================================

    $stmt = $db->prepare("
        SELECT
            product_id,
            good_qty,
            damaged_qty,
            missing_qty
        FROM return_challan_items
        WHERE challan_id = ?
    ");

    $stmt->execute([
        $data["challan_id"]
    ]);

    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!$items) {

        throw new Exception(
            "No return inspection items found"
        );
    }

    // =====================================================
    // 2. UPDATE INVENTORY
    // =====================================================

    foreach ($items as $item) {

        $productId = (int)$item["product_id"];

        $goodQty = (int)$item["good_qty"];

        $damagedQty = (int)$item["damaged_qty"];

        $missingQty = (int)$item["missing_qty"];


        // ✅ ONLY GOOD ITEMS RETURN TO STOCK
        // ✅ DAMAGED ITEMS GO TO DAMAGED STOCK
        // ✅ MISSING ITEMS GO TO MISSING STOCK

        $update = $db->prepare("
            UPDATE products

            SET

                stock =
                    stock + :good_qty,

                damaged_stock =
                    damaged_stock + :damaged_qty,

                missing_stock =
                    missing_stock + :missing_qty

            WHERE id = :id
        ");

        $update->execute([

            ":good_qty" =>
                $goodQty,

            ":damaged_qty" =>
                $damagedQty,

            ":missing_qty" =>
                $missingQty,

            ":id" =>
                $productId
        ]);


        // =================================================
        // 3. OPTIONAL INVENTORY HISTORY
        // =================================================

        $history = $db->prepare("
            INSERT INTO inventory_movements
            (
                product_id,
                movement_type,
                quantity,
                reference_id,
                created_at
            )
            VALUES
            (
                :product_id,
                :movement_type,
                :quantity,
                :reference_id,
                NOW()
            )
        ");

        // GOOD
        if ($goodQty > 0) {

            $history->execute([

                ":product_id" =>
                    $productId,

                ":movement_type" =>
                    "return_good",

                ":quantity" =>
                    $goodQty,

                ":reference_id" =>
                    $data["challan_id"]
            ]);
        }

        // DAMAGED
        if ($damagedQty > 0) {

            $history->execute([

                ":product_id" =>
                    $productId,

                ":movement_type" =>
                    "return_damaged",

                ":quantity" =>
                    $damagedQty,

                ":reference_id" =>
                    $data["challan_id"]
            ]);
        }

        // MISSING
        if ($missingQty > 0) {

            $history->execute([

                ":product_id" =>
                    $productId,

                ":movement_type" =>
                    "return_missing",

                ":quantity" =>
                    $missingQty,

                ":reference_id" =>
                    $data["challan_id"]
            ]);
        }
    }
    
    
    // =====================================================
// RECALCULATE FINAL INVOICE TOTAL
// =====================================================

$getInvoice = $db->prepare("
    SELECT id
    FROM invoices
    WHERE challan_id = ?
    LIMIT 1
");

$getInvoice->execute([
    $data["challan_id"]
]);

$invoice = $getInvoice->fetch(PDO::FETCH_ASSOC);

if ($invoice) {

    $invoiceId =
        (int)$invoice["id"];

    $itemsQuery = $db->prepare("

        SELECT

            dci.quantity_sent,
            dci.rental_days,

            p.selling_price,
            p.unit_price,

            COALESCE(r.damaged_qty, 0) AS damaged_qty,
            COALESCE(r.missing_qty, 0) AS missing_qty,
            COALESCE(r.damage_fee, 0) AS damage_fee

        FROM delivery_challan_items dci

        LEFT JOIN products p
            ON dci.product_id = p.id

        LEFT JOIN delivery_challan_returns r
            ON dci.product_id = r.product_id
            AND dci.challan_id = r.challan_id

        WHERE dci.challan_id = ?

    ");

    $itemsQuery->execute([
        $data["challan_id"]
    ]);

    $invoiceItems =
        $itemsQuery->fetchAll(PDO::FETCH_ASSOC);

    $finalTotal = 0;

    foreach ($invoiceItems as $row) {

        $qty =
            (float)($row["quantity_sent"] ?? 0);

        $rentalDays =
            (int)($row["rental_days"] ?? 1);

        $rentalPrice =
            (float)($row["selling_price"] ?? 0);

        $unitPrice =
            (float)($row["unit_price"] ?? 0);

        $damagedQty =
            (int)($row["damaged_qty"] ?? 0);

        $missingQty =
            (int)($row["missing_qty"] ?? 0);

        $damageFee =
            (float)($row["damage_fee"] ?? 0);

        $rentalTotal =
            $qty *
            $rentalPrice *
            $rentalDays;

        $damageTotal =
            $damagedQty *
            $damageFee;

        $missingTotal =
            $missingQty *
            $unitPrice;

        $itemTotal =
            $rentalTotal +
            $damageTotal +
            $missingTotal;

        $finalTotal +=
            $itemTotal;
    }

    $finalTotal =
        round($finalTotal, 2);

    $updateInvoice = $db->prepare("
        UPDATE invoices
        SET total_amount = ?
        WHERE id = ?
    ");

    $updateInvoice->execute([
        $finalTotal,
        $invoiceId
    ]);
}

    // =====================================================
    // 4. MARK CHALLAN COMPLETED
    // =====================================================

    $status = $db->prepare("
        UPDATE delivery_challans

        SET status = 'completed'

        WHERE id = ?
    ");

    $status->execute([
        $data["challan_id"]
    ]);

    // =====================================================
    // 5. COMMIT
    // =====================================================

    $db->commit();

    echo json_encode([

        "success" => true,

        "message" =>
            "Inventory updated successfully"
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