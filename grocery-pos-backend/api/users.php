<?php
include_once '../config/cors.php';
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        getUsers($db);
        break;
    case 'POST':
        createUser($db);
        break;
    case 'PUT':
        updateUser($db);
        break;
    case 'DELETE':
        deleteUser($db);
        break;
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        break;
}

function getUsers($db) {
    $query = "SELECT id, username, email, role, is_active, created_at FROM users ORDER BY created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $users = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $users[] = array(
            'id' => $row['id'],
            'name' => $row['username'],
            'email' => $row['email'],
            'role' => $row['role'],
            'status' => $row['is_active'] ? 'active' : 'inactive',
            'created_at' => $row['created_at']
        );
    }
    
    echo json_encode($users);
}

function createUser($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->name) && !empty($data->email) && !empty($data->password)) {
        // Check if user already exists
        $check_query = "SELECT id FROM users WHERE username = :username OR email = :email";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bindParam(":username", $data->name);
        $check_stmt->bindParam(":email", $data->email);
        $check_stmt->execute();
        
        if ($check_stmt->rowCount() > 0) {
            http_response_code(409);
            echo json_encode(array("message" => "User already exists"));
            return;
        }
        
        $query = "INSERT INTO users (username, email, password, role, is_active) VALUES (:username, :email, :password, :role, :is_active)";
        $stmt = $db->prepare($query);
        
        $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);
        $role = $data->role ?? 'cashier';
        $is_active = 1;
        
        $stmt->bindParam(":username", $data->name);
        $stmt->bindParam(":email", $data->email);
        $stmt->bindParam(":password", $hashed_password);
        $stmt->bindParam(":role", $role);
        $stmt->bindParam(":is_active", $is_active);
        
        if($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array(
                "message" => "User created successfully",
                "user_id" => $db->lastInsertId()
            ));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create user"));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Name, email and password required"));
    }
}

function updateUser($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->id) && !empty($data->name) && !empty($data->email)) {
        $query = "UPDATE users SET username = :username, email = :email, role = :role";
        
        if (!empty($data->password)) {
            $query .= ", password = :password";
        }
        
        $query .= " WHERE id = :id";
        $stmt = $db->prepare($query);
        
        $stmt->bindParam(":id", $data->id);
        $stmt->bindParam(":username", $data->name);
        $stmt->bindParam(":email", $data->email);
        $stmt->bindParam(":role", $data->role);
        
        if (!empty($data->password)) {
            $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);
            $stmt->bindParam(":password", $hashed_password);
        }
        
        if($stmt->execute()) {
            echo json_encode(array("message" => "User updated successfully"));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to update user"));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "ID, name and email required"));
    }
}

function deleteUser($db) {
    $id = $_GET['id'] ?? '';
    
    if (!empty($id)) {
        $query = "DELETE FROM users WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $id);
        
        if($stmt->execute()) {
            echo json_encode(array("message" => "User deleted successfully"));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to delete user"));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "User ID required"));
    }
}
?>
