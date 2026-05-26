<?php
include_once '../config/cors.php';
include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch($method) {
    case 'POST':
        if ($action === 'login') {
            login($db);
        } else if ($action === 'register') {
            register($db);
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Invalid action"));
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        break;
}

function login($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->username) && !empty($data->password)) {
        $query = "SELECT id, username, email, role, password FROM users WHERE username = :username AND is_active = 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":username", $data->username);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // // In production, use password_verify() with hashed passwords
            // if ($data->password === 'password' || password_verify($data->password, $user['password'])) {
            // Properly verify password with hashed passwords
            if (password_verify($data->password, $user['password'])) {
                // Generate a simple token (in production, use JWT)
                // $token = base64_encode($user['id'] . ':' . time());
                 $token = base64_encode($user['id'] . ':' . time() . ':' . uniqid());

                echo json_encode(array(
                    "message" => "Login successful",
                    "token" => $token,
                    "user" => array(
                        "id" => $user['id'],
                        "username" => $user['username'],
                        "email" => $user['email'],
                        "role" => $user['role']
                    )
                ));
            } else {
                http_response_code(401);
                echo json_encode(array("message" => "Invalid credentials"));
            }
        } else {
            http_response_code(401);
            echo json_encode(array("message" => "User not found"));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Username and password required"));
    }
}

function register($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->username) && !empty($data->email) && !empty($data->password)) {
        // Check if user already exists
        $check_query = "SELECT id FROM users WHERE username = :username OR email = :email";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bindParam(":username", $data->username);
        $check_stmt->bindParam(":email", $data->email);
        $check_stmt->execute();
        
        if ($check_stmt->rowCount() > 0) {
            http_response_code(409);
            // echo json_encode(array("message" => "User already exists"));
            return;
        }
        
        $query = "INSERT INTO users (username, email, password, role) VALUES (:username, :email, :password, :role)";
        $stmt = $db->prepare($query);
        
        $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);
        $role = $data->role ?? 'cashier';
        
        $stmt->bindParam(":username", $data->username);
        $stmt->bindParam(":email", $data->email);
        $stmt->bindParam(":password", $hashed_password);
        $stmt->bindParam(":role", $role);
        
        if($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array(
                "message" => "User registered successfully",
                "user_id" => $db->lastInsertId()
            ));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to register user"));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Username, email and password required"));
    }
}
?>
