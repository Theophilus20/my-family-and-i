import { Suspense } from 'react';
import Auth from '@/components/Auth';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <Auth mode="login" />
    </Suspense>
  );
}