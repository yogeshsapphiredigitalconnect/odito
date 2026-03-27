import LoginPage from "@/components/login";
import { PublicGuard } from "@/components/guards/AuthGuard";

export default function Login() {
  return (
    <PublicGuard>
      <LoginPage />
    </PublicGuard>
  );
}
