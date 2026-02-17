<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$conn = getDBConnection();

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            // Get single booking
            $stmt = $conn->prepare("SELECT * FROM bookings WHERE id = ?");
            $stmt->bind_param("s", $_GET['id']);
            $stmt->execute();
            $result = $stmt->get_result();
            $booking = $result->fetch_assoc();

            if ($booking) {
                // Convert date strings back to Date objects for frontend
                $booking['startDate'] = date('c', strtotime($booking['startDate']));
                $booking['endDate'] = date('c', strtotime($booking['endDate']));
                sendResponse($booking);
            } else {
                sendResponse(['error' => 'Booking not found'], 404);
            }
        } elseif (isset($_GET['status'])) {
            // Get bookings by status
            $stmt = $conn->prepare("SELECT * FROM bookings WHERE status = ? ORDER BY startDate DESC");
            $stmt->bind_param("s", $_GET['status']);
            $stmt->execute();
            $result = $stmt->get_result();
            $bookings = $result->fetch_all(MYSQLI_ASSOC);

            // Convert dates for all bookings
            foreach ($bookings as &$booking) {
                $booking['startDate'] = date('c', strtotime($booking['startDate']));
                $booking['endDate'] = date('c', strtotime($booking['endDate']));
            }
            sendResponse($bookings);
        } else {
            // Get all bookings
            $result = $conn->query("SELECT * FROM bookings ORDER BY startDate DESC");
            $bookings = $result->fetch_all(MYSQLI_ASSOC);

            // Convert dates for all bookings
            foreach ($bookings as &$booking) {
                $booking['startDate'] = date('c', strtotime($booking['startDate']));
                $booking['endDate'] = date('c', strtotime($booking['endDate']));
            }
            sendResponse($bookings);
        }
        break;

    case 'POST':
        // Create new booking
        $data = getJsonInput();

        $required_fields = ['vehicleId', 'funderId', 'startDate', 'endDate', 'province'];
        foreach ($required_fields as $field) {
            if (!isset($data[$field])) {
                sendResponse(['error' => "Field '$field' is required"], 400);
            }
        }

        // Check if vehicle is available for the date range
        $stmt = $conn->prepare("
            SELECT COUNT(*) as conflicts FROM bookings
            WHERE vehicleId = ?
            AND status IN ('pending', 'confirmed')
            AND (
                (startDate <= ? AND endDate >= ?) OR
                (startDate <= ? AND endDate >= ?) OR
                (startDate >= ? AND endDate <= ?)
            )
        ");
        $stmt->bind_param("sssssss",
            $data['vehicleId'],
            $data['endDate'], $data['startDate'],
            $data['startDate'], $data['endDate'],
            $data['startDate'], $data['endDate']
        );
        $stmt->execute();
        $result = $stmt->get_result();
        $conflict = $result->fetch_assoc();

        if ($conflict['conflicts'] > 0) {
            sendResponse(['error' => 'Vehicle is not available for the selected dates'], 409);
        }

        $stmt = $conn->prepare("INSERT INTO bookings (id, vehicleId, funderId, startDate, endDate, province, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $id = 'B' . strtoupper(substr(uniqid(), -6));
        $status = $data['status'] ?? 'pending';

        $stmt->bind_param("sssssss",
            $id,
            $data['vehicleId'],
            $data['funderId'],
            $data['startDate'],
            $data['endDate'],
            $data['province'],
            $status
        );

        if ($stmt->execute()) {
            $data['id'] = $id;
            sendResponse($data, 201);
        } else {
            sendResponse(['error' => 'Failed to create booking'], 500);
        }
        break;

    case 'PUT':
        // Update booking
        if (!isset($_GET['id'])) {
            sendResponse(['error' => 'Booking ID is required'], 400);
        }

        $data = getJsonInput();

        $update_fields = [];
        $types = "";
        $values = [];

        if (isset($data['status'])) {
            $update_fields[] = "status = ?";
            $types .= "s";
            $values[] = $data['status'];
        }

        if (isset($data['totalKm'])) {
            $update_fields[] = "totalKm = ?";
            $types .= "d";
            $values[] = $data['totalKm'];
        }

        if (isset($data['totalCost'])) {
            $update_fields[] = "totalCost = ?";
            $types .= "d";
            $values[] = $data['totalCost'];
        }

        if (empty($update_fields)) {
            sendResponse(['error' => 'No valid fields to update'], 400);
        }

        $query = "UPDATE bookings SET " . implode(", ", $update_fields) . " WHERE id = ?";
        $types .= "s";
        $values[] = $_GET['id'];

        $stmt = $conn->prepare($query);
        $stmt->bind_param($types, ...$values);

        if ($stmt->execute()) {
            sendResponse(['message' => 'Booking updated successfully']);
        } else {
            sendResponse(['error' => 'Failed to update booking'], 500);
        }
        break;

    case 'DELETE':
        // Delete booking
        if (!isset($_GET['id'])) {
            sendResponse(['error' => 'Booking ID is required'], 400);
        }

        $stmt = $conn->prepare("DELETE FROM bookings WHERE id = ?");
        $stmt->bind_param("s", $_GET['id']);

        if ($stmt->execute()) {
            sendResponse(['message' => 'Booking deleted successfully']);
        } else {
            sendResponse(['error' => 'Failed to delete booking'], 500);
        }
        break;

    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}

$conn->close();
?>