import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

export default function DisconnectButton() {
  const { disconnect, connected } = useWallet(); // Use the 'disconnect' function from useWallet hook

  return (
    connected && (
      <button
        onClick={disconnect}
        className="bg-gray-300 text-gray-800 px-6 py-2 rounded-full hover:bg-gray-500 transition-colors duration-200 font-bold"
      >
        Disconnect
      </button>
    )
  );
}
