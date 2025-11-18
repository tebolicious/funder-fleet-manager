import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { adminCredentials } from "@/data/mockData";

interface AdminLoginProps {
  onSuccess: () => void;
}

export const AdminLogin = ({ onSuccess }: AdminLoginProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      username === adminCredentials.username &&
      password === adminCredentials.password
    ) {
      setError("");
      onSuccess();
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Admin Login</DialogTitle>
        <DialogDescription>Login to manage vehicles, provinces, and bookings.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleLogin}>
        <Input
          type="email"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ marginTop: 8 }}
        />
        {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
        <DialogFooter>
          <Button type="submit" style={{ marginTop: 16 }}>
            Login
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};
