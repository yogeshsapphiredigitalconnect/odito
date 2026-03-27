import { Demo } from '@/components/landingpage/demo';
import { PublicGuard } from "@/components/guards/AuthGuard";

export default function Home() {
  return (
    <PublicGuard>
      <Demo />
    </PublicGuard>
  );
}
