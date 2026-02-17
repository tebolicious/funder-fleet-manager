import { useState, useEffect } from 'react';
import { BookingForm } from '@/components/booking/BookingForm';
import { VehicleList } from '@/components/vehicles/VehicleList';
import { BookingModal } from '@/components/booking/BookingModal';
import { isWithinInterval } from 'date-fns';
import heroImage from '@/assets/hero-bg.jpg';
import { Car } from 'lucide-react';

interface Vehicle {
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

interface Booking {
  id: string;
  vehicleId: string;
  funderId: string;
  startDate: string;
  endDate: string;
  province: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

// API base URL - use relative path for local development, absolute for production
const API_BASE = import.meta.env.DEV ? '/api' : 'https://theenterprisehub.co.za/api';

const Index = () => {
  const [searchParams, setSearchParams] = useState<{
    startDate?: Date;
    endDate?: Date;
    province?: string;
  }>({});
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load vehicles and bookings on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [vehiclesRes, bookingsRes] = await Promise.all([
        fetch(`${API_BASE}/vehicles.php`),
        fetch(`${API_BASE}/bookings.php`)
      ]);

      const vehiclesData = await vehiclesRes.json();
      const bookingsData = await bookingsRes.json();

      // Convert string numbers to actual numbers for vehicles
      const processedVehicles = vehiclesData.map((vehicle: any) => ({
        ...vehicle,
        pricePerKm: parseFloat(vehicle.pricePerKm),
        dailyKmAllowance: parseInt(vehicle.dailyKmAllowance),
        capacity: parseInt(vehicle.capacity)
      }));

      setAllVehicles(processedVehicles);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (startDate: Date, endDate: Date, province: string) => {
    setSearchParams({ startDate, endDate, province });

    // Filter vehicles by province
    const vehiclesInProvince = allVehicles.filter(v => v.province === province && v.available);

    // Check availability based on existing bookings
    const available = vehiclesInProvince.filter(vehicle => {
      const vehicleBookings = bookings.filter(b =>
        b.vehicleId === vehicle.id &&
        (b.status === 'pending' || b.status === 'confirmed')
      );

      // Check if any booking conflicts with the requested dates
      const hasConflict = vehicleBookings.some(booking => {
        const bookingStart = new Date(booking.startDate);
        const bookingEnd = new Date(booking.endDate);

        const bookingOverlaps = isWithinInterval(startDate, {
          start: bookingStart,
          end: bookingEnd,
        }) || isWithinInterval(endDate, {
          start: bookingStart,
          end: bookingEnd,
        }) || (
          startDate <= bookingStart && endDate >= bookingEnd
        );

        return bookingOverlaps;
      });

      return !hasConflict;
    });

    setAvailableVehicles(available);
  };

  const handleBookVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div 
        className="relative bg-gradient-to-r from-primary to-primary/80 text-primary-foreground overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0, 119, 204, 0.95), rgba(0, 119, 204, 0.85)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <Car className="h-10 w-10" />
              <h1 className="text-4xl md:text-5xl font-bold">
                Thandubomi Vehicle Management
              </h1>
            </div>
            <p className="text-xl text-primary-foreground/90 mb-8">
              Professional vehicle management services for NGO funders across South Africa
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 -mt-16 relative z-20">
          <BookingForm onSearch={handleSearch} />
        </div>

        {searchParams.startDate && searchParams.endDate && searchParams.province && (
          <VehicleList vehicles={availableVehicles} onBook={handleBookVehicle} />
        )}

        {!searchParams.startDate && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Welcome to Our Vehicle Management Service
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Select your booking dates and province to view available vehicles. 
              We offer a wide range of vehicles including Toyota Fortuner, Urban Cruiser, 
              Quantum, Corolla, Avanza, and Nissan X-Trail across all provinces.
            </p>
          </div>
        )}
      </div>

      <BookingModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        vehicle={selectedVehicle}
        startDate={searchParams.startDate}
        endDate={searchParams.endDate}
      />
    </div>
  );
};

export default Index;
