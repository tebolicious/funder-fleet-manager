import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

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

interface Province {
  id: string;
  name: string;
}

interface Funder {
  id: string;
  name: string;
  code: string;
}

interface Booking {
  id: string;
  vehicleId: string;
  funderId: string;
  startDate: string;
  endDate: string;
  province: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalKm?: number;
  totalCost?: number;
}

// API base URL - use relative path for local development, absolute for production
const API_BASE = import.meta.env.DEV ? '/api' : 'https://theenterprisehub.co.za/api';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'provinces' | 'funders' | 'bookings'>('vehicles');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [funders, setFunders] = useState<Funder[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [vehiclesRes, provincesRes, fundersRes, bookingsRes] = await Promise.all([
        fetch(`${API_BASE}/vehicles.php`),
        fetch(`${API_BASE}/provinces.php`),
        fetch(`${API_BASE}/funders.php`),
        fetch(`${API_BASE}/bookings.php`)
      ]);

      const [vehiclesData, provincesData, fundersData, bookingsData] = await Promise.all([
        vehiclesRes.json(),
        provincesRes.json(),
        fundersRes.json(),
        bookingsRes.json()
      ]);

      // Convert string numbers to actual numbers for vehicles
      const processedVehicles = vehiclesData.map((vehicle: any) => ({
        ...vehicle,
        pricePerKm: parseFloat(vehicle.pricePerKm),
        dailyKmAllowance: parseInt(vehicle.dailyKmAllowance),
        capacity: parseInt(vehicle.capacity)
      }));

      // Convert string numbers to actual numbers for bookings
      const processedBookings = bookingsData.map((booking: any) => ({
        ...booking,
        totalKm: booking.totalKm ? parseFloat(booking.totalKm) : null,
        totalCost: booking.totalCost ? parseFloat(booking.totalCost) : null,
      }));

      setVehicles(processedVehicles);
      setProvinces(provincesData);
      setFunders(fundersData);
      setBookings(processedBookings);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (endpoint: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`${API_BASE}/${endpoint}.php?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadAllData(); // Refresh data
      } else {
        alert('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item');
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`${API_BASE}/bookings.php?id=${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        loadAllData(); // Refresh data
      } else {
        alert('Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Error updating booking status');
    }
  };

  return (
    <div style={{ padding: 32, maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24 }}>Back Office Admin Dashboard</h2>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {[
          { key: 'vehicles', label: 'Manage Vehicles' },
          { key: 'provinces', label: 'Manage Provinces' },
          { key: 'funders', label: 'Manage Funders' },
          { key: 'bookings', label: 'Manage Bookings' }
        ].map(tab => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? 'default' : 'outline'}
            onClick={() => setActiveTab(tab.key as 'vehicles' | 'provinces' | 'funders' | 'bookings')}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {loading && <div>Loading...</div>}

      {/* Vehicles Tab */}
      {activeTab === 'vehicles' && (
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Management</CardTitle>
            <VehicleForm onSuccess={loadAllData} provinces={provinces} />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Province</TableHead>
                  <TableHead>Price/Km</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map(vehicle => (
                  <TableRow key={vehicle.id}>
                    <TableCell>{vehicle.name}</TableCell>
                    <TableCell>{vehicle.model}</TableCell>
                    <TableCell>{vehicle.province}</TableCell>
                    <TableCell>R{vehicle.pricePerKm}</TableCell>
                    <TableCell>
                      <Badge variant={vehicle.available ? 'default' : 'secondary'}>
                        {vehicle.available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete('vehicles', vehicle.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Provinces Tab */}
      {activeTab === 'provinces' && (
        <Card>
          <CardHeader>
            <CardTitle>Province Management</CardTitle>
            <ProvinceForm onSuccess={loadAllData} />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {provinces.map(province => (
                  <TableRow key={province.id}>
                    <TableCell>{province.id}</TableCell>
                    <TableCell>{province.name}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete('provinces', province.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Funders Tab */}
      {activeTab === 'funders' && (
        <Card>
          <CardHeader>
            <CardTitle>Funder Management</CardTitle>
            <FunderForm onSuccess={loadAllData} />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {funders.map(funder => (
                  <TableRow key={funder.id}>
                    <TableCell>{funder.name}</TableCell>
                    <TableCell>{funder.code}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete('funders', funder.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <Card>
          <CardHeader>
            <CardTitle>Booking Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Funder</TableHead>
                  <TableHead>Province</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Total Km</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map(booking => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.id}</TableCell>
                    <TableCell>{booking.vehicleId}</TableCell>
                    <TableCell>{booking.funderId}</TableCell>
                    <TableCell>{booking.province}</TableCell>
                    <TableCell>
                      {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{booking.totalKm ? booking.totalKm.toFixed(2) : 'N/A'}</TableCell>
                    <TableCell>{booking.totalCost ? `R${booking.totalCost.toFixed(2)}` : 'N/A'}</TableCell>
                    <TableCell>
                      <Select
                        value={booking.status}
                        onValueChange={(value) => updateBookingStatus(booking.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete('bookings', booking.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Vehicle Form Component
const VehicleForm = ({ onSuccess, provinces }: { onSuccess: () => void; provinces: Province[] }) => {
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    pricePerKm: '',
    dailyKmAllowance: '',
    capacity: '',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    province: '',
    available: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE}/vehicles.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pricePerKm: parseFloat(formData.pricePerKm),
          dailyKmAllowance: parseInt(formData.dailyKmAllowance),
          capacity: parseInt(formData.capacity)
        })
      });

      if (response.ok) {
        setFormData({
          name: '', model: '', pricePerKm: '', dailyKmAllowance: '', capacity: '',
          transmission: 'Automatic', fuelType: 'Petrol', province: '', available: true
        });
        onSuccess();
      } else {
        alert('Failed to create vehicle');
      }
    } catch (error) {
      console.error('Error creating vehicle:', error);
      alert('Error creating vehicle');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add New Vehicle</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="pricePerKm">Price per Km</Label>
              <Input
                id="pricePerKm"
                type="number"
                step="0.01"
                value={formData.pricePerKm}
                onChange={(e) => setFormData({...formData, pricePerKm: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="dailyKmAllowance">Daily Km Allowance</Label>
              <Input
                id="dailyKmAllowance"
                type="number"
                value={formData.dailyKmAllowance}
                onChange={(e) => setFormData({...formData, dailyKmAllowance: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="province">Province</Label>
              <Select value={formData.province} onValueChange={(value) => setFormData({...formData, province: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map(province => (
                    <SelectItem key={province.id} value={province.name}>{province.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="transmission">Transmission</Label>
              <Select value={formData.transmission} onValueChange={(value) => setFormData({...formData, transmission: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Automatic">Automatic</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fuelType">Fuel Type</Label>
              <Select value={formData.fuelType} onValueChange={(value) => setFormData({...formData, fuelType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Petrol">Petrol</SelectItem>
                  <SelectItem value="Diesel">Diesel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit">Create Vehicle</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Province Form Component
const ProvinceForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE}/provinces.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });

      if (response.ok) {
        setName('');
        onSuccess();
      } else {
        alert('Failed to create province');
      }
    } catch (error) {
      console.error('Error creating province:', error);
      alert('Error creating province');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add New Province</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Province</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="provinceName">Province Name</Label>
            <Input
              id="provinceName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <Button type="submit">Create Province</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Funder Form Component
const FunderForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [formData, setFormData] = useState({ name: '', code: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE}/funders.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setFormData({ name: '', code: '' });
        onSuccess();
      } else {
        alert('Failed to create funder');
      }
    } catch (error) {
      console.error('Error creating funder:', error);
      alert('Error creating funder');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add New Funder</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Funder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="funderName">Funder Name</Label>
            <Input
              id="funderName"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="funderCode">Funder Code</Label>
            <Input
              id="funderCode"
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              required
            />
          </div>
          <Button type="submit">Create Funder</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
