import { vehicles, provinces, mockBookings } from "@/data/mockData";

export const AdminDashboard = () => {
  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>Back Office Admin Dashboard</h2>
      <section style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 20, fontWeight: "bold" }}>Manage Vehicles</h3>
        <ul>
          {vehicles.map(v => (
            <li key={v.id}>{v.name} ({v.model}) - {v.province}</li>
          ))}
        </ul>
      </section>
      <section style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 20, fontWeight: "bold" }}>Manage Provinces</h3>
        <ul>
          {provinces.map(p => (
            <li key={p.id}>{p.name}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3 style={{ fontSize: 20, fontWeight: "bold" }}>Manage Bookings</h3>
        <ul>
          {mockBookings.map(b => (
            <li key={b.id}>Booking {b.id}: Vehicle {b.vehicleId}, Province {b.province}, Status {b.status}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};
