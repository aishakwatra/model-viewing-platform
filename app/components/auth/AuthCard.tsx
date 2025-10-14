"use client";

import { useState } from 'react';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { LoginForm } from '././LoginForm';
import { RegisterForm } from '././RegisterForm';

export function AuthCard() {
  const [view, setView] = useState<'signin' | 'register'>('signin');

  return (
    <Card className="w-full max-w-md p-8">
      {/* Tab Buttons */}
      <div className="flex items-center justify-center p-1 rounded-xl bg-brown/5 border border-brown/10 mb-6">
        <Button 
          variant={view === 'signin' ? 'brown' : 'ghost'} 
          onClick={() => setView('signin')}
          className="w-1/2"
        >
          Sign In
        </Button>
        <Button 
          variant={view === 'register' ? 'brown' : 'ghost'} 
          onClick={() => setView('register')}
          className="w-1/2"
        >
          Register
        </Button>
      </div>

      {/* Conditional Form Rendering */}
      {view === 'signin' ? <LoginForm /> : <RegisterForm />}
    </Card>
  );
}
