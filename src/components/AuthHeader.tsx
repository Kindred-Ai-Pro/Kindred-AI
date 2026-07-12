'use client';

import {
  ClerkLoaded,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs';
import { UI } from '@/lib/labels';

export function AuthHeader() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <p className="font-serif text-lg text-slate-50">Kindred AI</p>
        <ClerkLoaded>
          <div className="flex items-center gap-3">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-medium text-slate-50 transition-colors hover:bg-zinc-800">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-white">
                  Sign up
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <span title={UI.SETTINGS}>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'h-9 w-9',
                    },
                  }}
                />
              </span>
            </Show>
          </div>
        </ClerkLoaded>
      </div>
    </header>
  );
}
