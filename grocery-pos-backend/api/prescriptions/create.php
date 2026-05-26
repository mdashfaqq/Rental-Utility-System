<?php
// /api/prescriptions/create.php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';


// Keep JSON clean: convert warnings/notices to JSON 500
error_reporting(E_ALL);
ini_set('display_errors', '0');
set_error_handler(function ($severity, $message, $file, $line) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => "PHP error: $message @ $file:$line"]);
  exit;
});
set_exception_handler(function ($e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
  exit;
});

// ---- DB handle (this was missing) ----
$database = new Database();
$db = $database->getConnection();
if (!$db) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'DB connection failed']);
  exit;
}

// ---- method guard ----
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
  exit;
}

// ---- read JSON ----
$in = json_decode(file_get_contents('php://input'), true) ?? [];

$required = ['customer_id','date_of_examination'];
foreach ($required as $k) {
  if (!isset($in[$k]) || $in[$k]==='') {
    http_response_code(422);
    echo json_encode(['success' => false, 'error' => "Missing field: $k"]);
    exit;
  }
}

$bool = fn($v)=> (isset($v) && (int)$v===1) ? 1 : 0;
$axis = function($v){ if($v===''||$v===null){return null;} $n=(int)$v; return max(0,min(180,$n)); };
$toNull = fn($v)=> ($v===''||$v===null)? null : $v;

// ---- insert ----
$sql = "INSERT INTO glass_prescriptions (
  customer_id, ref_no, patient_name, age, phone, sex, date_of_examination, optometrist,
  r_dv_sph, r_dv_cyl, r_dv_axis, r_dv_vision,
  r_nv_sph, r_nv_cyl, r_nv_axis, r_nv_vision,
  l_dv_sph, l_dv_cyl, l_dv_axis, l_dv_vision,
  l_nv_sph, l_nv_cyl, l_nv_axis, l_nv_vision,
  chk_single_vision, chk_bifocal, chk_progressive,
  chk_plastic_cr39, chk_polycarbonate, chk_glass,
  chk_photochromatic, chk_transition, chk_hindex
) VALUES (
  :customer_id, :ref_no, :patient_name, :age, :phone, :sex, :date_of_examination, :optometrist,
  :r_dv_sph, :r_dv_cyl, :r_dv_axis, :r_dv_vision,
  :r_nv_sph, :r_nv_cyl, :r_nv_axis, :r_nv_vision,
  :l_dv_sph, :l_dv_cyl, :l_dv_axis, :l_dv_vision,
  :l_nv_sph, :l_nv_cyl, :l_nv_axis, :l_nv_vision,
  :chk_single_vision, :chk_bifocal, :chk_progressive,
  :chk_plastic_cr39, :chk_polycarbonate, :chk_glass,
  :chk_photochromatic, :chk_transition, :chk_hindex
)";
$stmt = $db->prepare($sql);

$stmt->execute([
  ':customer_id' => (int)$in['customer_id'],
  ':ref_no' => $toNull($in['ref_no'] ?? null),
  ':patient_name' => $toNull($in['patient_name'] ?? null),
  ':age' => $toNull($in['age'] ?? null),
  ':phone' => $toNull($in['phone'] ?? null),
  ':sex' => $toNull($in['sex'] ?? null),
  ':date_of_examination' => $in['date_of_examination'],
  ':optometrist' => $toNull($in['optometrist'] ?? null),

  ':r_dv_sph' => $toNull($in['r_dv_sph'] ?? null),
  ':r_dv_cyl' => $toNull($in['r_dv_cyl'] ?? null),
  ':r_dv_axis'=> $axis($in['r_dv_axis'] ?? null),
  ':r_dv_vision' => $toNull($in['r_dv_vision'] ?? null),

  ':r_nv_sph' => $toNull($in['r_nv_sph'] ?? null),
  ':r_nv_cyl' => $toNull($in['r_nv_cyl'] ?? null),
  ':r_nv_axis'=> $axis($in['r_nv_axis'] ?? null),
  ':r_nv_vision' => $toNull($in['r_nv_vision'] ?? null),

  ':l_dv_sph' => $toNull($in['l_dv_sph'] ?? null),
  ':l_dv_cyl' => $toNull($in['l_dv_cyl'] ?? null),
  ':l_dv_axis'=> $axis($in['l_dv_axis'] ?? null),
  ':l_dv_vision' => $toNull($in['l_dv_vision'] ?? null),

  ':l_nv_sph' => $toNull($in['l_nv_sph'] ?? null),
  ':l_nv_cyl' => $toNull($in['l_nv_cyl'] ?? null),
  ':l_nv_axis'=> $axis($in['l_nv_axis'] ?? null),
  ':l_nv_vision' => $toNull($in['l_nv_vision'] ?? null),

  ':chk_single_vision' => $bool($in['chk_single_vision'] ?? 0),
  ':chk_bifocal' => $bool($in['chk_bifocal'] ?? 0),
  ':chk_progressive' => $bool($in['chk_progressive'] ?? 0),
  ':chk_plastic_cr39' => $bool($in['chk_plastic_cr39'] ?? 0),
  ':chk_polycarbonate' => $bool($in['chk_polycarbonate'] ?? 0),
  ':chk_glass' => $bool($in['chk_glass'] ?? 0),
  ':chk_photochromatic' => $bool($in['chk_photochromatic'] ?? 0),
  ':chk_transition' => $bool($in['chk_transition'] ?? 0),
  ':chk_hindex' => $bool($in['chk_hindex'] ?? 0),
]);

echo json_encode(['success' => true, 'id' => (int)$db->lastInsertId()]);
