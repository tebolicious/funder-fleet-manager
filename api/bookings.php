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

        $required_fields = ['vehicleId', 'funderId', 'startDate', 'endDate', 'province', 'customerName', 'customerSurname', 'customerEmail'];
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

        // Fetch vehicle details
        $stmt = $conn->prepare("SELECT pricePerKm, dailyKmAllowance FROM vehicles WHERE id = ?");
        $stmt->bind_param("s", $data['vehicleId']);
        $stmt->execute();
        $result = $stmt->get_result();
        $vehicle = $result->fetch_assoc();

        if (!$vehicle) {
            sendResponse(['error' => 'Vehicle not found'], 404);
        }

        // Calculate totalKm and totalCost
        $start = new DateTime($data['startDate']);
        $end = new DateTime($data['endDate']);
        $days = $start->diff($end)->days + 1; // inclusive
        $totalKm = $days * $vehicle['dailyKmAllowance'];
        $totalCost = $totalKm * $vehicle['pricePerKm'];

        $stmt = $conn->prepare("INSERT INTO bookings (id, vehicleId, funderId, startDate, endDate, province, customerName, customerSurname, customerEmail, status, totalKm, totalCost) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $id = 'B' . strtoupper(substr(uniqid(), -6));
        $status = $data['status'] ?? 'pending';

        $stmt->bind_param("ssssssssssdd",
            $id,
            $data['vehicleId'],
            $data['funderId'],
            $data['startDate'],
            $data['endDate'],
            $data['province'],
            $data['customerName'],
            $data['customerSurname'],
            $data['customerEmail'],
            $status,
            $totalKm,
            $totalCost
        );

        if ($stmt->execute()) {
            $data['id'] = $id;
            $data['totalKm'] = $totalKm;
            $data['totalCost'] = $totalCost;
            
            // Send confirmation email
            sendBookingConfirmationEmail($data, $conn);
            
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

function sendBookingConfirmationEmail($bookingData, $conn) {
    // Get vehicle details
    $stmt = $conn->prepare("SELECT * FROM vehicles WHERE id = ?");
    $stmt->bind_param("s", $bookingData['vehicleId']);
    $stmt->execute();
    $vehicle = $stmt->get_result()->fetch_assoc();
    
    // Get funder details
    $stmt = $conn->prepare("SELECT * FROM funders WHERE id = ?");
    $stmt->bind_param("s", $bookingData['funderId']);
    $stmt->execute();
    $funder = $stmt->get_result()->fetch_assoc();
    
    // Calculate costs
    $startDate = new DateTime($bookingData['startDate']);
    $endDate = new DateTime($bookingData['endDate']);
    $days = $startDate->diff($endDate)->days + 1;
    $includedKm = $days * $vehicle['dailyKmAllowance'];
    $totalCost = $includedKm * $vehicle['pricePerKm'];
    
    // Email content
    $subject = "Booking Confirmation - {$bookingData['id']} - Thandubomi Vehicle Management";
    
    $message = "
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #333; }
        .invoice-details { margin-bottom: 30px; }
        .invoice-details div { margin-bottom: 10px; }
        .section { margin-bottom: 30px; }
        .section h3 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        .details-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .details-table th, .details-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .details-table th { background-color: #f8f8f8; font-weight: bold; }
        .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #333; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <div class='logo'>THANDUBOMI VEHICLE MANAGEMENT</div>
            <h2>BOOKING CONFIRMATION</h2>
            <p>Booking ID: {$bookingData['id']}</p>
        </div>
        
        <div class='invoice-details'>
            <div><strong>Bill To:</strong> 48 Wierda Rd West Wierda Valley Sandton 2196 · +27 (0) 11 523 1000 · info@lovelife.org.za</div>
            <div><strong>From:</strong> Thandubomi, 48 Wierda Rd West Wierda Valley Sandton 2196 · +27 (0) 11 523 1000</div>
            <div><strong>Booking Date:</strong> " . date('F j, Y') . "</div>
        </div>
        
        <div class='section'>
            <h3>Customer Details</h3>
            <table class='details-table'>
                <tr><th>Name:</th><td>{$bookingData['customerName']} {$bookingData['customerSurname']}</td></tr>
                <tr><th>Email:</th><td>{$bookingData['customerEmail']}</td></tr>
                <tr><th>Funder:</th><td>{$funder['name']} ({$funder['code']})</td></tr>
            </table>
        </div>
        
        <div class='section'>
            <h3>Vehicle Details</h3>
            <table class='details-table'>
                <tr><th>Vehicle:</th><td>{$vehicle['name']} {$vehicle['model']}</td></tr>
                <tr><th>Transmission:</th><td>{$vehicle['transmission']}</td></tr>
                <tr><th>Fuel Type:</th><td>{$vehicle['fuelType']}</td></tr>
                <tr><th>Capacity:</th><td>{$vehicle['capacity']} Passengers</td></tr>
                <tr><th>Province:</th><td>{$bookingData['province']}</td></tr>
            </table>
        </div>
        
        <div class='section'>
            <h3>Booking Details</h3>
            <table class='details-table'>
                <tr><th>Start Date:</th><td>" . date('F j, Y', strtotime($bookingData['startDate'])) . "</td></tr>
                <tr><th>End Date:</th><td>" . date('F j, Y', strtotime($bookingData['endDate'])) . "</td></tr>
                <tr><th>Duration:</th><td>{$days} days</td></tr>
                <tr><th>Daily KM Allowance:</th><td>{$vehicle['dailyKmAllowance']} km</td></tr>
                <tr><th>Total Included KM:</th><td>{$includedKm} km</td></tr>
                <tr><th>Rate per KM:</th><td>R " . number_format($vehicle['pricePerKm'], 2) . "</td></tr>
            </table>
        </div>
        
        <div class='total'>
            Total Estimated Cost: R " . number_format($totalCost, 2) . "
        </div>
        
        <div class='footer'>
            <p>Thank you for choosing Thandubomi Vehicle Management.</p>
            <p>This is an automated confirmation email. Please keep this for your records.</p>
            <p>For any inquiries, contact us at +27 (0) 11 523 1000 or info@lovelife.org.za</p>
        </div>
    </div>
</body>
</html>
";

    // Email headers
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: Thandubomi Vehicle Management <noreply@thandubomi.co.za>" . "\r\n";
    $headers .= "Reply-To: info@lovelife.org.za" . "\r\n";
    
    // Send email
    mail($bookingData['customerEmail'], $subject, $message, $headers);
}

$conn->close();
?>