<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$conn = getDBConnection();

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            // Get single province
            $stmt = $conn->prepare("SELECT * FROM provinces WHERE id = ?");
            $stmt->bind_param("s", $_GET['id']);
            $stmt->execute();
            $result = $stmt->get_result();
            $province = $result->fetch_assoc();

            if ($province) {
                sendResponse($province);
            } else {
                sendResponse(['error' => 'Province not found'], 404);
            }
        } else {
            // Get all provinces
            $result = $conn->query("SELECT * FROM provinces ORDER BY name");
            $provinces = $result->fetch_all(MYSQLI_ASSOC);
            sendResponse($provinces);
        }
        break;

    case 'POST':
        // Create new province
        $data = getJsonInput();

        if (!isset($data['name'])) {
            sendResponse(['error' => 'Province name is required'], 400);
        }

        $stmt = $conn->prepare("INSERT INTO provinces (id, name) VALUES (?, ?)");
        $id = uniqid();
        $stmt->bind_param("ss", $id, $data['name']);

        if ($stmt->execute()) {
            $data['id'] = $id;
            sendResponse($data, 201);
        } else {
            sendResponse(['error' => 'Failed to create province'], 500);
        }
        break;

    case 'PUT':
        // Update province
        if (!isset($_GET['id'])) {
            sendResponse(['error' => 'Province ID is required'], 400);
        }

        $data = getJsonInput();

        if (!isset($data['name'])) {
            sendResponse(['error' => 'Province name is required'], 400);
        }

        $stmt = $conn->prepare("UPDATE provinces SET name = ? WHERE id = ?");
        $stmt->bind_param("ss", $data['name'], $_GET['id']);

        if ($stmt->execute()) {
            sendResponse(['message' => 'Province updated successfully']);
        } else {
            sendResponse(['error' => 'Failed to update province'], 500);
        }
        break;

    case 'DELETE':
        // Delete province
        if (!isset($_GET['id'])) {
            sendResponse(['error' => 'Province ID is required'], 400);
        }

        $stmt = $conn->prepare("DELETE FROM provinces WHERE id = ?");
        $stmt->bind_param("s", $_GET['id']);

        if ($stmt->execute()) {
            sendResponse(['message' => 'Province deleted successfully']);
        } else {
            sendResponse(['error' => 'Failed to delete province'], 500);
        }
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}

$conn->close();
?>