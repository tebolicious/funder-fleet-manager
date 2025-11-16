export interface Vehicle {
  id: string;
  name: string;
  model: string;
  pricePerKm: number;
  dailyKmAllowance: number;
  capacity: number;
  transmission: string;
  fuelType: string;
  imageUrl: string;
  province: string;
  available: boolean;
}

export interface Funder {
  id: string;
  name: string;
  code: string;
}

export interface Province {
  id: string;
  name: string;
}

export const provinces: Province[] = [
  { id: '1', name: 'Limpopo' },
  { id: '2', name: 'Gauteng' },
  { id: '3', name: 'Western Cape' },
  { id: '4', name: 'KwaZulu-Natal' },
  { id: '5', name: 'Eastern Cape' },
  { id: '6', name: 'Mpumalanga' },
  { id: '7', name: 'North West' },
  { id: '8', name: 'Free State' },
  { id: '9', name: 'Northern Cape' },
];

export const funders: Funder[] = [
  { id: '1', name: 'TDHS', code: 'TDHS' },
  { id: '2', name: 'UNFPA', code: 'UNFPA' },
  { id: '3', name: 'UNICEF', code: 'UNICEF' },
  { id: '4', name: 'NDOH', code: 'NDOH' },
  { id: '5', name: 'VWSA', code: 'VWSA' },
  { id: '6', name: 'AMSTILITE', code: 'AMSTILITE' },
  { id: '7', name: 'SIOC', code: 'SIOC' },
  { id: '8', name: 'KURISANI', code: 'KURISANI' },
  { id: '9', name: 'SASOL', code: 'SASOL' },
  { id: '10', name: 'DSAC', code: 'DSAC' },
  { id: '11', name: 'IPAS', code: 'IPAS' },
];

export const vehicles: Vehicle[] = [
  // Limpopo - 5 Toyota Fortuner
  {
    id: '1',
    name: 'Toyota Fortuner',
    model: '2023',
    pricePerKm: 7.90,
    dailyKmAllowance: 100,
    capacity: 7,
    transmission: 'Automatic',
    fuelType: 'Diesel',
    imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800',
    province: 'Limpopo',
    available: true,
  },
  {
    id: '2',
    name: 'Toyota Fortuner',
    model: '2023',
    pricePerKm: 7.90,
    dailyKmAllowance: 100,
    capacity: 7,
    transmission: 'Automatic',
    fuelType: 'Diesel',
    imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800',
    province: 'Limpopo',
    available: true,
  },
  {
    id: '3',
    name: 'Toyota Fortuner',
    model: '2023',
    pricePerKm: 7.90,
    dailyKmAllowance: 100,
    capacity: 7,
    transmission: 'Automatic',
    fuelType: 'Diesel',
    imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800',
    province: 'Limpopo',
    available: true,
  },
  {
    id: '4',
    name: 'Toyota Fortuner',
    model: '2023',
    pricePerKm: 7.90,
    dailyKmAllowance: 100,
    capacity: 7,
    transmission: 'Automatic',
    fuelType: 'Diesel',
    imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800',
    province: 'Limpopo',
    available: true,
  },
  {
    id: '5',
    name: 'Toyota Fortuner',
    model: '2023',
    pricePerKm: 7.90,
    dailyKmAllowance: 100,
    capacity: 7,
    transmission: 'Automatic',
    fuelType: 'Diesel',
    imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800',
    province: 'Limpopo',
    available: true,
  },
  // Gauteng - Mixed vehicles
  {
    id: '6',
    name: 'Toyota Urban Cruiser',
    model: '2023',
    pricePerKm: 5.50,
    dailyKmAllowance: 100,
    capacity: 5,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
    province: 'Gauteng',
    available: true,
  },
  {
    id: '7',
    name: 'Toyota Quantum',
    model: '2023',
    pricePerKm: 6.80,
    dailyKmAllowance: 100,
    capacity: 14,
    transmission: 'Manual',
    fuelType: 'Diesel',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
    province: 'Gauteng',
    available: true,
  },
  {
    id: '8',
    name: 'Toyota Corolla',
    model: '2023',
    pricePerKm: 4.90,
    dailyKmAllowance: 100,
    capacity: 5,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800',
    province: 'Gauteng',
    available: true,
  },
  {
    id: '9',
    name: 'Toyota Avanza',
    model: '2023',
    pricePerKm: 5.20,
    dailyKmAllowance: 100,
    capacity: 7,
    transmission: 'Manual',
    fuelType: 'Petrol',
    imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800',
    province: 'Gauteng',
    available: true,
  },
  {
    id: '10',
    name: 'Nissan X-Trail',
    model: '2023',
    pricePerKm: 6.50,
    dailyKmAllowance: 100,
    capacity: 7,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    imageUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
    province: 'Gauteng',
    available: true,
  },
  // Western Cape
  {
    id: '11',
    name: 'Toyota Fortuner',
    model: '2023',
    pricePerKm: 7.90,
    dailyKmAllowance: 100,
    capacity: 7,
    transmission: 'Automatic',
    fuelType: 'Diesel',
    imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800',
    province: 'Western Cape',
    available: true,
  },
  {
    id: '12',
    name: 'Toyota Corolla',
    model: '2023',
    pricePerKm: 4.90,
    dailyKmAllowance: 100,
    capacity: 5,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800',
    province: 'Western Cape',
    available: true,
  },
  {
    id: '13',
    name: 'Nissan X-Trail',
    model: '2023',
    pricePerKm: 6.50,
    dailyKmAllowance: 100,
    capacity: 7,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    imageUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
    province: 'Western Cape',
    available: true,
  },
  // KwaZulu-Natal
  {
    id: '14',
    name: 'Toyota Quantum',
    model: '2023',
    pricePerKm: 6.80,
    dailyKmAllowance: 100,
    capacity: 14,
    transmission: 'Manual',
    fuelType: 'Diesel',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
    province: 'KwaZulu-Natal',
    available: true,
  },
  {
    id: '15',
    name: 'Toyota Avanza',
    model: '2023',
    pricePerKm: 5.20,
    dailyKmAllowance: 100,
    capacity: 7,
    transmission: 'Manual',
    fuelType: 'Petrol',
    imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800',
    province: 'KwaZulu-Natal',
    available: true,
  },
];

export interface Booking {
  id: string;
  vehicleId: string;
  funderId: string;
  startDate: Date;
  endDate: Date;
  province: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalKm?: number;
  totalCost?: number;
}

// Mock bookings for demonstration
export const mockBookings: Booking[] = [
  {
    id: 'B001',
    vehicleId: '1',
    funderId: '1',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-01-20'),
    province: 'Limpopo',
    status: 'confirmed',
  },
];
