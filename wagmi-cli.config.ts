import { defineConfig } from '@wagmi/cli'
import { foundry } from '@wagmi/cli/plugins'
import type { Address } from 'viem'
import { erc20Abi } from 'viem'
import { base, baseSepolia } from 'viem/chains'

const poolDeployments = {
    [base.id]: '0x5CA11740144513897Be27e3E82D75Aa75067F712' as Address, // github commit: eda48eb,
    [baseSepolia.id]: '0x5C22662210E48D0f5614cACA6f7a6a938716Ea26' as Address, // github commit: eda48eb,
}

const tokenDeployments = {
    [base.id]: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' as Address, // base mainnet USDC
    [baseSepolia.id]: '0xfD2Ec58cE4c87b253567Ff98ce2778de6AF0101b' as Address, // base sepolia droplet
}

const tokenAbi =
    process.env.NODE_ENV === 'production'
        ? erc20Abi
        : ([
              ...erc20Abi,
              {
                  type: 'function',
                  inputs: [
                      { name: 'to', internalType: 'address', type: 'address' },
                      { name: 'amount', internalType: 'uint256', type: 'uint256' },
                  ],
                  name: 'mint',
                  outputs: [],
                  stateMutability: 'nonpayable',
              },
          ] as const)

export default defineConfig({
    out: 'src/types/contracts.ts',
    contracts: [
        {
            name: 'Token',
            abi: tokenAbi,
            address: tokenDeployments,
        },
    ],
    plugins: [
        foundry({
            project: 'contracts',
            include: ['Pool.json'],
            deployments: {
                Pool: poolDeployments,
                Token: tokenDeployments,
            },
        }),
        // react(),
    ],
})
