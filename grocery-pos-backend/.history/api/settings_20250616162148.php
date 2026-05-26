
<?php
include_once '../config/cors.php';
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        getSettings($db);
        break;
    case 'POST':
        updateSettings($db);
        break;
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        break;
}

function getSettings($db) {
    $type = $_GET['type'] ?? 'store';
    
    $query = "SELECT * FROM settings WHERE type = :type";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":type", $type);
    $stmt->execute();
    
    $settings = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $settings[$row['key']] = $row['value'];
    }
    
    echo json_encode($settings);
}

function updateSettings($db) {
    $data = json_decode(file_get_contents("php://input"));
    $type = $data->type;
    
    if ($type) {
        try {
            $db->beginTransaction();
            
            foreach ($data as $key => $value) {
                if ($key !== 'type') {
                    $query = "INSERT INTO settings (type, `key`, value) VALUES (:type, :key, :value) 
                             ON DUPLICATE KEY UPDATE value = :value";
                    $stmt = $db->prepare($query);
                    $stmt->bindParam(":type", $type);
                    $stmt->bindParam(":key", $key);
                    $stmt->bindParam(":value", $value);
                    $stmt->execute();
                }
            }
            
            $db->commit();
            echo json_encode(array("message" => "Settings updated successfully"));
        } catch (Exception $e) {
            $db->rollback();
            http_response_code(503);
            echo json_encode(array("message" => "Unable to update settings: " . $e->getMessage()));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Settings type required"));
    }
}
?>
