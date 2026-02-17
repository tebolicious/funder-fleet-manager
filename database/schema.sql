-- Database schema for Thandubomi Vehicle Management System

-- Create provinces table
CREATE TABLE IF NOT EXISTS provinces (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Create funders table
CREATE TABLE IF NOT EXISTS funders (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    model VARCHAR(50) NOT NULL,
    pricePerKm DECIMAL(8,2) NOT NULL,
    dailyKmAllowance INT NOT NULL,
    capacity INT NOT NULL,
    transmission VARCHAR(20) NOT NULL,
    fuelType VARCHAR(20) NOT NULL,
    imageUrl TEXT,
    province VARCHAR(100) NOT NULL,
    available BOOLEAN DEFAULT TRUE
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(20) PRIMARY KEY,
    vehicleId VARCHAR(50) NOT NULL,
    funderId VARCHAR(50) NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    province VARCHAR(100) NOT NULL,
    customerName VARCHAR(100) NOT NULL,
    customerSurname VARCHAR(100) NOT NULL,
    customerEmail VARCHAR(255) NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    totalKm DECIMAL(10,2) NULL,
    totalCost DECIMAL(10,2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicleId) REFERENCES vehicles(id),
    FOREIGN KEY (funderId) REFERENCES funders(id)
);

-- Insert sample data for provinces
INSERT IGNORE INTO provinces (id, name) VALUES
('1', 'Limpopo'),
('2', 'Gauteng'),
('3', 'Western Cape'),
('4', 'KwaZulu-Natal'),
('5', 'Eastern Cape'),
('6', 'Mpumalanga'),
('7', 'North West'),
('8', 'Free State'),
('9', 'Northern Cape');

-- Insert sample data for funders
INSERT IGNORE INTO funders (id, name, code) VALUES
('1', 'TDHS', 'TDHS'),
('2', 'UNFPA', 'UNFPA'),
('3', 'UNICEF', 'UNICEF'),
('4', 'NDOH', 'NDOH'),
('5', 'VWSA', 'VWSA'),
('6', 'AMSTILITE', 'AMSTILITE'),
('7', 'SIOC', 'SIOC'),
('8', 'KURISANI', 'KURISANI'),
('9', 'SASOL', 'SASOL'),
('10', 'DSAC', 'DSAC'),
('11', 'IPAS', 'IPAS');

-- Insert sample data for vehicles
INSERT IGNORE INTO vehicles (id, name, model, pricePerKm, dailyKmAllowance, capacity, transmission, fuelType, imageUrl, province, available) VALUES
('1', 'Toyota Fortuner', '2023', 7.90, 100, 7, 'Automatic', 'Diesel', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800', 'Limpopo', true),
('2', 'Toyota Fortuner', '2023', 7.90, 100, 7, 'Automatic', 'Diesel', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800', 'Limpopo', true),
('3', 'Toyota Fortuner', '2023', 7.90, 100, 7, 'Automatic', 'Diesel', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800', 'Limpopo', true),
('4', 'Toyota Fortuner', '2023', 7.90, 100, 7, 'Automatic', 'Diesel', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800', 'Limpopo', true),
('5', 'Toyota Fortuner', '2023', 7.90, 100, 7, 'Automatic', 'Diesel', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800', 'Limpopo', true),
('6', 'Toyota Urban Cruiser', '2023', 5.50, 100, 5, 'Automatic', 'Petrol', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800', 'Gauteng', true),
('7', 'Toyota Quantum', '2023', 6.80, 100, 14, 'Manual', 'Diesel', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800', 'Gauteng', true),
('8', 'Toyota Corolla', '2023', 4.90, 100, 5, 'Automatic', 'Petrol', 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800', 'Gauteng', true),
('9', 'Toyota Avanza', '2023', 5.20, 100, 7, 'Manual', 'Petrol', 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800', 'Gauteng', true),
('10', 'Nissan X-Trail', '2023', 6.50, 100, 7, 'Automatic', 'Petrol', 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800', 'Gauteng', true),
('11', 'Toyota Fortuner', '2023', 7.90, 100, 7, 'Automatic', 'Diesel', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800', 'Western Cape', true),
('12', 'Toyota Corolla', '2023', 4.90, 100, 5, 'Automatic', 'Petrol', 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800', 'Western Cape', true),
('13', 'Nissan X-Trail', '2023', 6.50, 100, 7, 'Automatic', 'Petrol', 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800', 'Western Cape', true),
('14', 'Toyota Quantum', '2023', 6.80, 100, 14, 'Manual', 'Diesel', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800', 'KwaZulu-Natal', true),
('15', 'Toyota Avanza', '2023', 5.20, 100, 7, 'Manual', 'Petrol', 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800', 'KwaZulu-Natal', true);

-- Insert sample booking
INSERT IGNORE INTO bookings (id, vehicleId, funderId, startDate, endDate, province, customerName, customerSurname, customerEmail, status) VALUES
('B001', '1', '1', '2025-01-15', '2025-01-20', 'Limpopo', 'John', 'Doe', 'john.doe@example.com', 'confirmed');