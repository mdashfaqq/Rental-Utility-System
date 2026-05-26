<?php
// /api/prescriptions/list.php

// 1) Headers/CORS FIRST and exit early on OPTIONS
require_once __DIR__ . '/../../config/cors.php';

// 2) DB bootstrap
require_once __DIR__ . '/../../config/database.php';
$database = new Database();
$db = $database->getConnection(); // <-- THIS was missing

// 3) Input
$cid = isset($_GET['customer_id']) ? (int)$_GET['customer_id'] : 0;
if ($cid <= 0) {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => 'Missing or invalid customer_id']);
    exit;
}

try {
    // NOTE: keep the table name consistent with your CREATE endpoint
    // If your insert uses `glass_prescriptions`, keep it here as well.
    $sql = "SELECT id, ref_no, patient_name, date_of_examination, optometrist,
                   r_dv_sph, r_dv_cyl, r_dv_axis, r_dv_vision,
                   r_nv_sph, r_nv_cyl, r_nv_axis, r_nv_vision,
                   l_dv_sph, l_dv_cyl, l_dv_axis, l_dv_vision,
                   l_nv_sph, l_nv_cyl, l_nv_axis, l_nv_vision,
                   chk_single_vision, chk_bifocal, chk_progressive, chk_plastic_cr39,
                   chk_polycarbonate, chk_glass, chk_photochromatic, chk_transition, chk_hindex
            FROM glass_prescriptions
            WHERE customer_id = :cid
            ORDER BY date_of_examination DESC, id DESC";

    $stmt = $db->prepare($sql);
    $stmt->execute([':cid' => $cid]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 4) JSON response (no stray output)
    echo json_encode(['success' => true, 'prescriptions' => $rows]);
} catch (Throwable $e) {
    error_log("Rx list error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error']);
}
