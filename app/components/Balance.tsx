import { Button } from "@/app/components/DemoComponents";
import { Icon } from "@/app/components/Icon";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import {
  Avatar,
  Name,
  Identity,
  Address,
  EthBalance,
} from "@coinbase/onchainkit/identity";

export function Balance() {
  return (
    <div className="flex flex-col min-h-screen bg-[#4C6FFF] text-white p-4">
      <header className="flex justify-between items-center mb-8">
        <button className="p-2 hover:bg-white/10 rounded-full">
          <Icon name="refresh" className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-white/10 rounded-full">
            <Icon name="lock" className="w-6 h-6" />
          </button>
          <Wallet>
            <ConnectWallet>
              <Avatar className="w-8 h-8 rounded-full" />
            </ConnectWallet>
            <WalletDropdown>
              <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                <Avatar />
                <Name />
                <Address />
                <EthBalance />
              </Identity>
              <WalletDropdownDisconnect />
            </WalletDropdown>
          </Wallet>
        </div>
      </header>

      <div className="flex-1">
        <div className="text-center mb-8">
          <div className="text-sm opacity-80 mb-2">Total balance</div>
          <div className="text-4xl font-bold mb-1">$0.00</div>
          <div className="text-sm opacity-80">USDC</div>
        </div>

        <div className="bg-white/10 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <Icon name="droplet" className="w-5 h-5 mr-2" />
            <span>Drop Tokens: 1000</span>
          </div>
        </div>
      </div>

      <Button className="w-full bg-white text-[#4C6FFF] hover:bg-white/90 py-4 rounded-xl font-medium">
        Create an Event
      </Button>
    </div>
  );
}
