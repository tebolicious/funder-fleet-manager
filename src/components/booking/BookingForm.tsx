import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { provinces } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface BookingFormProps {
  onSearch: (startDate: Date, endDate: Date, province: string) => void;
}

export const BookingForm = ({ onSearch }: BookingFormProps) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedProvince, setSelectedProvince] = useState<string>('');

  const handleSearch = () => {
    if (startDate && endDate && selectedProvince) {
      onSearch(startDate, endDate, selectedProvince);
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-[var(--shadow-elevated)] p-6 space-y-4">
      <h2 className="text-2xl font-semibold text-card-foreground mb-4">Book a Vehicle</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-card-foreground">Start Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !startDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-popover" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-card-foreground">End Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !endDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-popover" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                disabled={(date) => !startDate || date <= startDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-card-foreground">Province</label>
          <Select value={selectedProvince} onValueChange={setSelectedProvince}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Select province" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {provinces.map((province) => (
                <SelectItem key={province.id} value={province.name}>
                  {province.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button 
        onClick={handleSearch} 
        className="w-full md:w-auto"
        disabled={!startDate || !endDate || !selectedProvince}
      >
        Search Available Vehicles
      </Button>
    </div>
  );
};
