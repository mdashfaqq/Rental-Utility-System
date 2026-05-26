<?php
include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/database.php';

try {
  $database = new Database();
  $db = $database->getConnection();

  // Read JSON body
  $data = json_decode(file_get_contents("php://input"), true);
  $id = $data['id'] ?? null;
  if (!is_array($data)) { $data = []; }

  // Required fields (based on your table: name = NOT NULL, phone = NULL allowed but you want it required in UI)
  $name  = isset($data['name'])  ? trim($data['name'])  : '';
  $phone = isset($data['phone']) ? trim($data['phone']) : '';

  if ($name === '' || $phone === '') {
    echo json_encode(['success' => false, 'message' => 'Name and phone number are required']);
    exit;
  }

  // Optional fields (your table allows NULLs for these)
  $email            = $data['email']            ?? null;
  $gender           = $data['gender']           ?? null; // enum('Male','Female','Other') or NULL
  $dob              = $data['dob']              ?? null; // YYYY-MM-DD or NULL
  $address          = $data['address']          ?? null;
  $city             = $data['city']             ?? null;
  $state            = $data['state']            ?? null;
  $pincode          = $data['pincode']          ?? null;
  $customer_code    = $data['customer_code']    ?? null;
  $loyalty_points   = isset($data['loyalty_points']) ? (int)$data['loyalty_points'] : 0; // default 0
  $preferred_contact= $data['preferred_contact']?? 'Phone'; // default 'Phone'
  $whatsapp_optin   = !empty($data['whatsapp_optin']) ? 1 : 0; // tinyint (0/1)
  $gst_number       = $data['gst_number']       ?? null;

  // Optional: ensure date format is correct or pass NULL
  if ($dob !== null && $dob !== '') {
    $d = DateTime::createFromFormat('Y-m-d', $dob);
    if (!$d || $d->format('Y-m-d') !== $dob) {
      $dob = null; // invalid date -> null (or return validation error)
    }
  } else {
    $dob = null;
  }

if ($id) {

  // UPDATE EXISTING CUSTOMER

  $sql = "UPDATE customers SET
      name = :name,
      phone = :phone,
      email = :email,
      gender = :gender,
      dob = :dob,
      address = :address,
      city = :city,
      state = :state,
      pincode = :pincode,
      customer_code = :customer_code,
      loyalty_points = :loyalty_points,
      preferred_contact = :preferred_contact,
      whatsapp_optin = :whatsapp_optin,
      gst_number = :gst_number,
      updated_at = NOW()
    WHERE id = :id";

} else {

  // CREATE NEW CUSTOMER

  $sql = "INSERT INTO customers (
      name, phone, email, gender, dob, address, city, state, pincode,
      customer_code, loyalty_points, preferred_contact, whatsapp_optin, gst_number,
      created_at, updated_at
    ) VALUES (
      :name, :phone, :email, :gender, :dob, :address, :city, :state, :pincode,
      :customer_code, :loyalty_points, :preferred_contact, :whatsapp_optin, :gst_number,
      NOW(), NOW()
    )";
}

  $stmt = $db->prepare($sql);
  $stmt->bindValue(':name', $name);
  $stmt->bindValue(':phone', $phone);
  $stmt->bindValue(':email', $email);
  $stmt->bindValue(':gender', $gender);
  $stmt->bindValue(':dob', $dob);
  $stmt->bindValue(':address', $address);
  $stmt->bindValue(':city', $city);
  $stmt->bindValue(':state', $state);
  $stmt->bindValue(':pincode', $pincode);
  $stmt->bindValue(':customer_code', $customer_code);
  $stmt->bindValue(':loyalty_points', $loyalty_points, PDO::PARAM_INT);
  $stmt->bindValue(':preferred_contact', $preferred_contact);
  $stmt->bindValue(':whatsapp_optin', $whatsapp_optin, PDO::PARAM_INT);
  if ($id) {
  $stmt->bindValue(':id', $id, PDO::PARAM_INT);
}
  

  $stmt->execute();

  echo json_encode(['success' => true]);
} catch (PDOException $e) {
  // Handle duplicate phone gracefully if you add a UNIQUE index on phone
  $sqlState = $e->getCode();
  error_log('add-customer PDO error: ' . $e->getMessage());
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Failed to add customer']);
} catch (Throwable $e) {
  error_log('add-customer error: ' . $e->getMessage());
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Server error']);
}
