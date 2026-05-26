<?php

include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/database.php';

header("Content-Type: application/json");

$db = (new Database())->getConnection();

$data = json_decode(
    file_get_contents("php://input"),
    true
);

// =====================================================
// VALIDATION
// =====================================================

if (
    !isset($data["challan_id"]) ||
    !isset($data["items"])
) {

    echo json_encode([

        "success" => false,

        "message" => "Invalid payload"
    ]);

    exit();
}

try {

    $db->beginTransaction();

    $challan_id = (int)$data["challan_id"];


    // =================================================
    // PREVENT DUPLICATE PROCESSING
    // =================================================

    $check = $db->prepare("
        SELECT status
        FROM delivery_challans
        WHERE id = ?
    ");

    $check->execute([
        $challan_id
    ]);

    $existing = $check->fetch(PDO::FETCH_ASSOC);



    // =================================================
    // REMOVE OLD RETURN DATA
    // =================================================

    $delete = $db->prepare("
        DELETE FROM delivery_challan_returns
        WHERE challan_id = ?
    ");

    $delete->execute([
        $challan_id
    ]);


    // =================================================
    // INSERT RETURN DATA
    // =================================================

    $insert = $db->prepare("
        INSERT INTO delivery_challan_returns
        (
            challan_id,
            product_id,
            good_qty,
            damaged_qty,
            missing_qty,
            damage_fee
        )
        VALUES
        (
            ?, ?, ?, ?, ?, ?
        )
    ");


    // =================================================
    // UPDATE INVENTORY
    // =================================================

    $updateInventory = $db->prepare("
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


    // =================================================
    // INVENTORY HISTORY
    // =================================================

    // $history = $db->prepare("
    //     INSERT INTO inventory_movements
    //     (
    //         product_id,
    //         movement_type,
    //         quantity,
    //         reference_id,
    //         created_at
    //     )
    //     VALUES
    //     (
    //         :product_id,
    //         :movement_type,
    //         :quantity,
    //         :reference_id,
    //         NOW()
    //     )
    // ");


    // =================================================
    // PROCESS ITEMS
    // =================================================

    foreach ($data["items"] as $item) {

        $productId =
            (int)$item["product_id"];

        $goodQty =
            (int)($item["good_qty"] ?? 0);

        $damagedQty =
            (int)($item["damaged_qty"] ?? 0);

        $missingQty =
            (int)($item["missing_qty"] ?? 0);

        $damageFee =
            (float)($item["damage_fee"] ?? 0);


        // =============================================
        // VALIDATION
        // =============================================

        $total =
            $goodQty +
            $damagedQty +
            $missingQty;

        if ($total <= 0) {

            throw new Exception(
                "Invalid quantities"
            );
        }

        // damaged fee required
        if (
            $damagedQty > 0 &&
            $damageFee <= 0
        ) {

            throw new Exception(
                "Damage fee required"
            );
        }


        // =============================================
        // SAVE RETURN DATA
        // =============================================

        $insert->execute([

            $challan_id,

            $productId,

            $goodQty,

            $damagedQty,

            $missingQty,

            $damageFee
        ]);


        // =============================================
        // UPDATE INVENTORY
        // =============================================

        $updateInventory->execute([

            ":good_qty" =>
                $goodQty,

            ":damaged_qty" =>
                $damagedQty,

            ":missing_qty" =>
                $missingQty,

            ":id" =>
                $productId
        ]);


        // =============================================
        // INVENTORY HISTORY
        // =============================================

        // GOOD
        // if ($goodQty > 0) {

        //     $history->execute([

        //         ":product_id" =>
        //             $productId,

        //         ":movement_type" =>
        //             "return_good",

        //         ":quantity" =>
        //             $goodQty,

        //         ":reference_id" =>
        //             $challan_id
        //     ]);
        // }

        // // DAMAGED
        // if ($damagedQty > 0) {

        //     $history->execute([

        //         ":product_id" =>
        //             $productId,

        //         ":movement_type" =>
        //             "return_damaged",

        //         ":quantity" =>
        //             $damagedQty,

        //         ":reference_id" =>
        //             $challan_id
        //     ]);
        // }

        // // MISSING
        // if ($missingQty > 0) {

        //     $history->execute([

        //         ":product_id" =>
        //             $productId,

        //         ":movement_type" =>
        //             "return_missing",

        //         ":quantity" =>
        //             $missingQty,

        //         ":reference_id" =>
        //             $challan_id
        //     ]);
        // }
    }


    
    // =================================================
// RECALCULATE FINAL INVOICE TOTAL
// =================================================
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

    $query = $db->prepare("

        SELECT

            SUM(

                (
                    dci.quantity_sent *
                    COALESCE(p.selling_price, 0)
                )

                +

                (
                    COALESCE(r.damaged_qty, 0) *
                    COALESCE(r.damage_fee, 0)
                )

                +

                (
                    COALESCE(r.missing_qty, 0) *
                    COALESCE(p.unit_price, 0)
                )

            ) AS final_total

        FROM delivery_challan_items dci

        LEFT JOIN products p
            ON dci.product_id = p.id

        LEFT JOIN delivery_challan_returns r
            ON dci.product_id = r.product_id
            AND dci.challan_id = r.challan_id

        WHERE dci.challan_id = ?

    ");

    $query->execute([
        $data["challan_id"]
    ]);

    $result =
        $query->fetch(PDO::FETCH_ASSOC);

    $finalTotal =
        round(
            (float)($result["final_total"] ?? 0),
            2
        );
        
        $updateItems = $db->prepare("

    UPDATE invoice_items ii

    JOIN delivery_challan_items dci
        ON ii.product_id = dci.product_id

    LEFT JOIN delivery_challan_returns r
        ON r.product_id = dci.product_id
        AND r.challan_id = dci.challan_id

    LEFT JOIN products p
        ON p.id = dci.product_id

    SET

        ii.total =

            (
                dci.quantity_sent *
                COALESCE(p.selling_price, 0)
            )

            +

            (
                COALESCE(r.damaged_qty, 0) *
                COALESCE(r.damage_fee, 0)
            )

            +

            (
                COALESCE(r.missing_qty, 0) *
                COALESCE(p.unit_price, 0)
            )

    WHERE ii.invoice_id = ?

");

$updateItems->execute([
    $invoiceId
]);

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


    // =================================================
    // MARK CHALLAN COMPLETED
    // =================================================

    $status = $db->prepare("
        UPDATE delivery_challans

        SET status = 'completed'

        WHERE id = ?
    ");

    $status->execute([
        $challan_id
    ]);


    // =================================================
    // COMMIT
    // =================================================

    $db->commit();

    echo json_encode([

        "success" => true,

        "message" =>
            "Return inspection saved successfully"
    ]);

} catch (Exception $e) {

    if ($db->inTransaction()) {

        $db->rollBack();
    }

    echo json_encode([

        "success" => false,

        "message" =>
            $e->getMessage()
    ]);
}