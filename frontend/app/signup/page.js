import SignupPage from "@/components/login/animated-characters-signup-page";
import { PublicGuard } from "@/components/guards/AuthGuard";

export default function Signup() {
  return (
    <PublicGuard>
      <SignupPage />
    </PublicGuard>
  );
}
