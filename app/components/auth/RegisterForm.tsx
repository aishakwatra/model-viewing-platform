"use client";

import { useState } from 'react';
import { Button } from "@/app/components/ui/Button";

export function RegisterForm() {
  const [role, setRole] = useState<'user' | 'creator'>('user');

  return (
    <div>
      <h2 className="text-xl font-semibold text-brown">Create account</h2>
      <p className="text-sm text-brown/70 mt-1">Join our creative community</p>

      <form className="mt-6 space-y-4">
        <div>
          <label htmlFor="full-name" className="block text-sm font-medium text-brown/80 mb-1">Full Name</label>
          <input
            id="full-name"
            type="text"
            placeholder="Enter your full name"
            className="w-full rounded-lg border border-brown/20 bg-white px-4 py-2 text-sm text-brown placeholder-brown/50 outline-none focus:ring-2 focus:ring-gold/60"
          />
        </div>
        <div>
          <label htmlFor="email-register" className="block text-sm font-medium text-brown/80 mb-1">Email</label>
          <input
            id="email-register"
            type="email"
            placeholder="Enter your email"
            className="w-full rounded-lg border border-brown/20 bg-white px-4 py-2 text-sm text-brown placeholder-brown/50 outline-none focus:ring-2 focus:ring-gold/60"
          />
        </div>
        <div>
          <label htmlFor="password-register" className="block text-sm font-medium text-brown/80 mb-1">Password</label>
          <input
            id="password-register"
            type="password"
            placeholder="Enter your password"
            className="w-full rounded-lg border border-brown/20 bg-white px-4 py-2 text-sm text-brown placeholder-brown/50 outline-none focus:ring-2 focus:ring-gold/60"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brown/80 mb-1">Profile Picture</label>
          <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-brown/20 border-dashed rounded-lg cursor-pointer bg-brown/5 hover:bg-brown/10">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-brown/60">
                    <svg className="w-8 h-8 mb-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                    <p className="text-xs">Click to upload or drag and drop</p>
                    <p className="text-xs">PNG, JPG (up to 10MB)</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" />
            </label>
          </div> 
        </div>
        <div>
            <label className="block text-sm font-medium text-brown/80 mb-2">I am a</label>
            <div className="flex items-center p-1 rounded-xl bg-brown/5 border border-brown/10">
              <Button
                type="button"
                variant={role === 'user' ? 'gold' : 'ghost'}
                onClick={() => setRole('user')}
                className="w-1/2"
              >
                User
              </Button>
              <Button
                type="button"
                variant={role === 'creator' ? 'gold' : 'ghost'}
                onClick={() => setRole('creator')}
                className="w-1/2"
              >
                Creator
              </Button>
            </div>
        </div>
        <Button variant="brown" className="w-full !mt-6">Create Account</Button>
      </form>
    </div>
  );
}
