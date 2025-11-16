import { Vehicle, Funder } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Users, Fuel, Gauge, CalendarCheck } from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
  onBook: (vehicle: Vehicle) => void;
}

export const VehicleCard = ({ vehicle, onBook }: VehicleCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-[var(--shadow-elevated)] transition-shadow">
      <div className="aspect-video w-full overflow-hidden bg-muted">
        <img 
          src={vehicle.imageUrl} 
          alt={vehicle.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      <CardHeader>
        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-card-foreground">{vehicle.name}</h3>
          <p className="text-sm text-muted-foreground">{vehicle.model}</p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{vehicle.capacity} Passengers</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Fuel className="h-4 w-4" />
            <span>{vehicle.fuelType}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Gauge className="h-4 w-4" />
            <span>{vehicle.transmission}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarCheck className="h-4 w-4" />
            <span>{vehicle.dailyKmAllowance}km/day</span>
          </div>
        </div>
        
        <div className="pt-3 border-t border-border">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-primary">R{vehicle.pricePerKm.toFixed(2)}</span>
            <span className="text-sm text-muted-foreground">per km</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {vehicle.dailyKmAllowance}km daily allowance included
          </p>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={() => onBook(vehicle)} 
          className="w-full"
          variant="default"
        >
          Select Vehicle
        </Button>
      </CardFooter>
    </Card>
  );
};
