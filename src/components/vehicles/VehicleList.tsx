import { Vehicle } from '@/data/mockData';
import { VehicleCard } from './VehicleCard';

interface VehicleListProps {
  vehicles: Vehicle[];
  onBook: (vehicle: Vehicle) => void;
}

export const VehicleList = ({ vehicles, onBook }: VehicleListProps) => {
  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          No vehicles available for the selected dates and province.
        </p>
        <p className="text-muted-foreground text-sm mt-2">
          Please try different dates or another province.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground">
        Available Vehicles ({vehicles.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} onBook={onBook} />
        ))}
      </div>
    </div>
  );
};
