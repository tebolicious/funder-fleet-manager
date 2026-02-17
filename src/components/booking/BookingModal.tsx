import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';
import { CheckCircle2, Loader2 } from 'lucide-react';

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

interface Funder {
  id: string;
  name: string;
  code: string;
}

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: Vehicle | null;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

// API base URL - use relative path for local development, absolute for production
const API_BASE = import.meta.env.DEV ? '/api' : 'https://theenterprisehub.co.za/api';

export const BookingModal = ({ open, onOpenChange, vehicle, startDate, endDate }: BookingModalProps) => {
  const [funders, setFunders] = useState<Funder[]>([]);
  const [selectedFunder, setSelectedFunder] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [surname, setSurname] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Load funders on component mount
  useEffect(() => {
    const loadFunders = async () => {
      try {
        const response = await fetch(`${API_BASE}/funders.php`);
        const data = await response.json();
        setFunders(data);
      } catch (error) {
        console.error('Error loading funders:', error);
      }
    };

    if (open) {
      loadFunders();
    }
  }, [open]);

  if (!vehicle || !startDate || !endDate) return null;

  const days = differenceInDays(endDate, startDate) + 1;
  const includedKm = days * vehicle.dailyKmAllowance;
  const estimatedCost = includedKm * vehicle.pricePerKm;

  const handleConfirmBooking = async () => {
    if (!selectedFunder) {
      toast({
        title: 'Funder Required',
        description: 'Please select a funder to proceed with the booking.',
        variant: 'destructive',
      });
      return;
    }

    if (!name || !surname || !email) {
      toast({
        title: 'User Details Required',
        description: 'Please fill in all user details to proceed with the booking.',
        variant: 'destructive',
      });
      return;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create booking via API
      const bookingData = {
        vehicleId: vehicle.id,
        funderId: selectedFunder,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        province: vehicle.province,
        customerName: name,
        customerSurname: surname,
        customerEmail: email
      };

      const response = await fetch(`${API_BASE}/bookings.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();

      if (response.ok) {
        setIsConfirmed(true);
        toast({
          title: 'Booking Confirmed!',
          description: `Your ${vehicle.name} has been booked successfully. Booking ID: ${result.id}`,
        });
      } else {
        toast({
          title: 'Booking Failed',
          description: result.error || 'Failed to create booking. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: 'Booking Failed',
        description: 'Network error. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsConfirmed(false);
    setSelectedFunder('');
    setName('');
    setSurname('');
    setEmail('');
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
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{name} {surname}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{email}</p>
                </div>
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

            <div className="space-y-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname">Surname *</Label>
                  <Input
                    id="surname"
                    placeholder="Enter your surname"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1" disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleConfirmBooking} className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Booking...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
