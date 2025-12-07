"use client";

import { useState } from 'react';
import { Card } from '@/app/components/ui/Card';
import { LoginForm } from '././LoginForm';
import { RegisterForm } from '././RegisterForm';

export function AuthCard() {
  const [view, setView] = useState<'signin' | 'register'>('signin');

  return (
    <Card className="w-full max-w-md p-8">
      {/* Conditional Form Rendering */}
      {view === 'signin' ? (
        <>
          <LoginForm />
          <div className="mt-6 text-center">
            <p className="text-sm text-brown/70">
              Don't have an account?{' '}
              <button
                onClick={() => setView('register')}
                className="font-medium text-brown hover:underline focus:outline-none"
              >
                Signup here
              </button>
            </p>
          </div>
        </>
      ) : (
        <>
          <RegisterForm />
          <div className="mt-6 text-center">
            <p className="text-sm text-brown/70">
              Already have an account?{' '}
              <button
                onClick={() => setView('signin')}
                className="font-medium text-brown hover:underline focus:outline-none"
              >
                Sign in here
              </button>
            </p>
          </div>
        </>
      )}
    </Card>
  );
}
