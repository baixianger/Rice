"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import UserControl from "@/components/user-control";

export const Navbar = () => {
  return (
    <nav
      className="p-4 bg-transparent fixed top-0 left-0 right-0 z-50 
    transition-all duration-200 border-b border-transparent"
    >
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={24} height={24} />
          <span className="text-lg font-semibold">Rice</span>
        </Link>
        <SignedOut>
          <div className="flex gap-2">
            <SignUpButton>
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </SignUpButton>
            <SignInButton>
              <Button size="sm">Sign Up</Button>
            </SignInButton>
          </div>
        </SignedOut>
        <SignedIn>
          <UserControl showName />
        </SignedIn>
      </div>
    </nav>
  );
};
