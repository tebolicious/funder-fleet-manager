import { useState } from 'react';
import { Vehicle, funders } from '@/data/mockData';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';
import { CheckCircle2 } from 'lucide-react';

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: Vehicle | null;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

export const BookingModal = ({ open, onOpenChange, vehicle, startDate, endDate }: BookingModalProps) => {
  const [selectedFunder, setSelectedFunder] = useState<string>('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const { toast } = useToast();

  if (!vehicle || !startDate || !endDate) return null;

  const days = differenceInDays(endDate, startDate) + 1;
  const includedKm = days * vehicle.dailyKmAllowance;
  const estimatedCost = includedKm * vehicle.pricePerKm;

  const handleConfirmBooking = () => {
    if (!selectedFunder) {
      toast({
        title: 'Funder Required',
        description: 'Please select a funder to proceed with the booking.',
        variant: 'destructive',
      });
      return;
    }

    setIsConfirmed(true);
    toast({
      title: 'Booking Confirmed!',
      description: `Your ${vehicle.name} has been booked successfully.`,
    });
  };

  const handleClose = () => {
    setIsConfirmed(false);
    setSelectedFunder('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isConfirmed ? 'Booking Confirmed' : 'Complete Your Booking'}
          </DialogTitle>
          <DialogDescription>
            {isConfirmed 
              ? 'Your vehicle reservation has been successfully created.'
              : 'Review your booking details and select the funder.'}
          </DialogDescription>
        </DialogHeader>

        {isConfirmed ? (
          <div className="space-y-6 py-4">
            <div className="flex justify-center">
              <CheckCircle2 className="h-20 w-20 text-secondary" />
            </div>
            
            <div className="bg-muted rounded-lg p-6 space-y-3">
              <h3 className="font-semibold text-lg">Booking Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Vehicle</p>
                  <p className="font-medium">{vehicle.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Funder</p>
                  <p className="font-medium">
                    {funders.find(f => f.id === selectedFunder)?.name}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Start Date</p>
                  <p className="font-medium">{format(startDate, 'PPP')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">End Date</p>
                  <p className="font-medium">{format(endDate, 'PPP')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">{days} days</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Province</p>
                  <p className="font-medium">{vehicle.province}</p>
                </div>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="bg-muted rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-4">
                <img 
                  src={vehicle.imageUrl} 
                  alt={vehicle.name}
                  className="w-32 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{vehicle.name}</h3>
                  <p className="text-sm text-muted-foreground">{vehicle.model}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Province:</span> {vehicle.province}</p>
                    <p><span className="text-muted-foreground">Duration:</span> {days} days</p>
                    <p><span className="text-muted-foreground">Dates:</span> {format(startDate, 'PP')} - {format(endDate, 'PP')}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rate per km</span>
                  <span className="font-medium">R{vehicle.pricePerKm.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Daily allowance</span>
                  <span className="font-medium">{vehicle.dailyKmAllowance} km/day</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Included km ({days} days)</span>
                  <span className="font-medium">{includedKm} km</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                  <span>Estimated Cost</span>
                  <span className="text-primary">R{estimatedCost.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  *Based on included km allowance. Additional km charged at rate per km.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Funder *</label>
              <Select value={selectedFunder} onValueChange={setSelectedFunder}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Choose the funder for this booking" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {funders.map((funder) => (
                    <SelectItem key={funder.id} value={funder.id}>
                      {funder.name} ({funder.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleConfirmBooking} className="flex-1">
                Confirm Booking
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
