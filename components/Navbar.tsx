"use client";

import ConnectButton from "./ConnectButton";
import DisconnectButton from "./DisconnectButton";

export default function Navbar() {
  return (
    <div className="bg-gradient-to-r from-blue-400 to-purple-500 shadow-md py-4">
      <nav className="container mx-auto flex justify-between items-center px-4">
        {/* Placeholder for a logo or title */}
        <div className="text-white text-xl font-bold">SPL Token Creator</div>
        {/* Connect Wallet Button */}
        <ConnectButton />
        <DisconnectButton />
      </nav>
    </div>
  );
}
