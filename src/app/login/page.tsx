'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-white to-slate-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 overflow-hidden bg-primary-700 shadow-lg">
              <Image
                src="/logo.png"
                alt="FBC Opelika"
                width={96}
                height={96}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-primary-700">FBCO College Ministry</h1>
            <p className="text-primary-600 font-medium mt-2">Track. Connect. Disciple.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="email"
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />

            <div>
              <Input
                id="password"
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <div className="mt-2 text-right">
                <button
                  type="button"
                  className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                  onClick={() => alert('Please contact your administrator to reset your password.')}
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              Sign In
            </Button>
          </form>

          {/* Demo toggle */}
          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <button
              type="button"
              onClick={() => setShowDemo(!showDemo)}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              {showDemo ? 'Hide demo credentials' : 'Need demo credentials?'}
            </button>
            {showDemo && (
              <div className="mt-3 text-xs text-slate-600 bg-slate-50 rounded-lg p-3 space-y-1 text-left">
                <p><strong>Admin:</strong> admin@ministry.local / changeme</p>
                <p><strong>Staff:</strong> john@ministry.local / password123</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          First Baptist Church Opelika - College Ministry
        </p>
      </div>
    </div>
  );
}
