"use client";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import Dashboard from "./(protected)/dashboard/page"; // Import component yang kita bikin tadi

export default function Home() {
  return (
    <div className="p-4">
      <nav className="flex justify-between items-center mb-10 border-b border-zinc-800 pb-4">
        <span className="font-black text-red-600 tracking-tighter text-xl">
          ROASTLE.AI
        </span>
        <div>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm">
                Login for Roast
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </nav>

      <Show when="signed-in">
        <Dashboard />
      </Show>

      <Show when="signed-out">
        <div className="text-center py-20">
          <h2 className="text-5xl font-black mb-4">LU MALAS?</h2>
          <p className="text-zinc-500 mb-8">
            Login biar AI kita bisa ngehina hidup lu yang stagnan itu.
          </p>
        </div>
      </Show>
    </div>
  );
}
