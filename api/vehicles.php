<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$conn = getDBConnection();

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            // Get single vehicle
            $stmt = $conn->prepare("SELECT * FROM vehicles WHERE id = ?");
            $stmt->bind_param("s", $_GET['id']);
            $stmt->execute();
            $result = $stmt->get_result();
            $vehicle = $result->fetch_assoc();

            if ($vehicle) {
                sendResponse($vehicle);
            } else {
                sendResponse(['error' => 'Vehicle not found'], 404);
            }
        } elseif (isset($_GET['province'])) {
            // Get vehicles by province
            $stmt = $conn->prepare("SELECT * FROM vehicles WHERE province = ? ORDER BY name");
            $stmt->bind_param("s", $_GET['province']);
            $stmt->execute();
            $result = $stmt->get_result();
            $vehicles = $result->fetch_all(MYSQLI_ASSOC);
            sendResponse($vehicles);
        } else {
            // Get all vehicles
            $result = $conn->query("SELECT * FROM vehicles ORDER BY name");
            $vehicles = $result->fetch_all(MYSQLI_ASSOC);
            sendResponse($vehicles);
        }
        break;

    case 'POST':
        // Create new vehicle
        $data = getJsonInput();

        $required_fields = ['name', 'model', 'pricePerKm', 'dailyKmAllowance', 'capacity', 'transmission', 'fuelType', 'province'];
        foreach ($required_fields as $field) {
            if (!isset($data[$field])) {
                sendResponse(['error' => "Field '$field' is required"], 400);
            }
        }

        $stmt = $conn->prepare("INSERT INTO vehicles (id, name, model, pricePerKm, dailyKmAllowance, capacity, transmission, fuelType, imageUrl, province, available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $id = uniqid();
        $imageUrl = $data['imageUrl'] ?? 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800';
        $available = $data['available'] ?? true;

        $stmt->bind_param("sssdiissssis",
            $id,
            $data['name'],
            $data['model'],
            $data['pricePerKm'],
            $data['dailyKmAllowance'],
            $data['capacity'],
            $data['transmission'],
            $data['fuelType'],
            $imageUrl,
            $data['province'],
            $available
        );

        if ($stmt->execute()) {
            $data['id'] = $id;
            sendResponse($data, 201);
        } else {
            sendResponse(['error' => 'Failed to create vehicle'], 500);
        }
        break;

    case 'PUT':
        // Update vehicle
        if (!isset($_GET['id'])) {
            sendResponse(['error' => 'Vehicle ID is required'], 400);
        }

        $data = getJsonInput();

        $stmt = $conn->prepare("UPDATE vehicles SET name = ?, model = ?, pricePerKm = ?, dailyKmAllowance = ?, capacity = ?, transmission = ?, fuelType = ?, imageUrl = ?, province = ?, available = ? WHERE id = ?");

        $imageUrl = $data['imageUrl'] ?? 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800';
        $available = $data['available'] ?? true;

        $stmt->bind_param("ssdiissssis",
            $data['name'],
            $data['model'],
            $data['pricePerKm'],
            $data['dailyKmAllowance'],
            $data['capacity'],
            $data['transmission'],
            $data['fuelType'],
            $imageUrl,
            $data['province'],
            $available,
            $_GET['id']
        );

        if ($stmt->execute()) {
            sendResponse(['message' => 'Vehicle updated successfully']);
        } else {
            sendResponse(['error' => 'Failed to update vehicle'], 500);
        }
        break;

    case 'DELETE':
        // Delete vehicle
        if (!isset($_GET['id'])) {
            sendResponse(['error' => 'Vehicle ID is required'], 400);
        }

        $stmt = $conn->prepare("DELETE FROM vehicles WHERE id = ?");
        $stmt->bind_param("s", $_GET['id']);

        if ($stmt->execute()) {
            sendResponse(['message' => 'Vehicle deleted successfully']);
        } else {
            sendResponse(['error' => 'Failed to delete vehicle'], 500);
        }
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}

$conn->close();
?>