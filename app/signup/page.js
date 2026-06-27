import { Suspense } from 'react';
import Auth from '@/components/Auth';

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <Auth mode="signup" />
    </Suspense>
  );
}