import { useState } from 'react';
import { BookingForm } from '@/components/booking/BookingForm';
import { VehicleList } from '@/components/vehicles/VehicleList';
import { BookingModal } from '@/components/booking/BookingModal';
import { vehicles, Vehicle, mockBookings } from '@/data/mockData';
import { isWithinInterval } from 'date-fns';
import heroImage from '@/assets/hero-bg.jpg';
import { Car } from 'lucide-react';

const Index = () => {
  const [searchParams, setSearchParams] = useState<{
    startDate?: Date;
    endDate?: Date;
    province?: string;
  }>({});
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearch = (startDate: Date, endDate: Date, province: string) => {
    setSearchParams({ startDate, endDate, province });

    // Filter vehicles by province
    const vehiclesInProvince = vehicles.filter(v => v.province === province);

    // Check availability based on existing bookings
    const available = vehiclesInProvince.filter(vehicle => {
      const vehicleBookings = mockBookings.filter(b => b.vehicleId === vehicle.id);
      
      // Check if any booking conflicts with the requested dates
      const hasConflict = vehicleBookings.some(booking => {
        const bookingOverlaps = isWithinInterval(startDate, {
          start: booking.startDate,
          end: booking.endDate,
        }) || isWithinInterval(endDate, {
          start: booking.startDate,
          end: booking.endDate,
        });
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
                Vehicle Rental Management
              </h1>
            </div>
            <p className="text-xl text-primary-foreground/90 mb-8">
              Professional vehicle rental services for NGO funders across South Africa
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
              Welcome to Our Vehicle Rental Service
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
