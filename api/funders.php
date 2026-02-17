<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$conn = getDBConnection();

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            // Get single funder
            $stmt = $conn->prepare("SELECT * FROM funders WHERE id = ?");
            $stmt->bind_param("s", $_GET['id']);
            $stmt->execute();
            $result = $stmt->get_result();
            $funder = $result->fetch_assoc();

            if ($funder) {
                sendResponse($funder);
            } else {
                sendResponse(['error' => 'Funder not found'], 404);
            }
        } else {
            // Get all funders
            $result = $conn->query("SELECT * FROM funders ORDER BY name");
            $funders = $result->fetch_all(MYSQLI_ASSOC);
            sendResponse($funders);
        }
        break;

    case 'POST':
        // Create new funder
        $data = getJsonInput();

        if (!isset($data['name']) || !isset($data['code'])) {
            sendResponse(['error' => 'Funder name and code are required'], 400);
        }

        $stmt = $conn->prepare("INSERT INTO funders (id, name, code) VALUES (?, ?, ?)");
        $id = uniqid();
        $stmt->bind_param("sss", $id, $data['name'], $data['code']);

        if ($stmt->execute()) {
            $data['id'] = $id;
            sendResponse($data, 201);
        } else {
            sendResponse(['error' => 'Failed to create funder'], 500);
        }
        break;

    case 'PUT':
        // Update funder
        if (!isset($_GET['id'])) {
            sendResponse(['error' => 'Funder ID is required'], 400);
        }

        $data = getJsonInput();

        if (!isset($data['name']) || !isset($data['code'])) {
            sendResponse(['error' => 'Funder name and code are required'], 400);
        }

        $stmt = $conn->prepare("UPDATE funders SET name = ?, code = ? WHERE id = ?");
        $stmt->bind_param("sss", $data['name'], $data['code'], $_GET['id']);

        if ($stmt->execute()) {
            sendResponse(['message' => 'Funder updated successfully']);
        } else {
            sendResponse(['error' => 'Failed to update funder'], 500);
        }
        break;

    case 'DELETE':
        // Delete funder
        if (!isset($_GET['id'])) {
            sendResponse(['error' => 'Funder ID is required'], 400);
        }

        $stmt = $conn->prepare("DELETE FROM funders WHERE id = ?");
        $stmt->bind_param("s", $_GET['id']);

        if ($stmt->execute()) {
            sendResponse(['message' => 'Funder deleted successfully']);
        } else {
            sendResponse(['error' => 'Failed to delete funder'], 500);
        }
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}

$conn->close();
?>