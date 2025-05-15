//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Pool
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5CA11740144513897Be27e3E82D75Aa75067F712)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5C22662210E48D0f5614cACA6f7a6a938716Ea26)
 */
export const poolAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [],
    name: 'ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'TIME_DELAY',
    outputs: [{ name: '', internalType: 'uint40', type: 'uint40' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
      { name: 'winner', internalType: 'address', type: 'address' },
    ],
    name: 'claimWinning',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolIds', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '_winners', internalType: 'address[]', type: 'address[]' },
    ],
    name: 'claimWinnings',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'claimablePools',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'collectRemainingBalance',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'timeStart', internalType: 'uint40', type: 'uint40' },
      { name: 'timeEnd', internalType: 'uint40', type: 'uint40' },
      { name: 'poolName', internalType: 'string', type: 'string' },
      {
        name: 'depositAmountPerPerson',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'totalWinners', internalType: 'uint16', type: 'uint16' },
      { name: 'amountPerWinner', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'createPool',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'createdPools',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'deposit',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'contract IERC20', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'emergencyWithdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'getAllPoolInfo',
    outputs: [
      {
        name: '_poolDetail',
        internalType: 'struct IPool.PoolDetail',
        type: 'tuple',
        components: [
          { name: 'timeStart', internalType: 'uint40', type: 'uint40' },
          { name: 'timeEnd', internalType: 'uint40', type: 'uint40' },
          { name: 'poolAdmin', internalType: 'address', type: 'address' },
          { name: 'totalWinners', internalType: 'uint16', type: 'uint16' },
          { name: 'poolName', internalType: 'string', type: 'string' },
          {
            name: 'depositAmountPerPerson',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'amountPerWinner', internalType: 'uint256', type: 'uint256' },
        ],
      },
      {
        name: '_poolBalance',
        internalType: 'struct IPool.PoolBalance',
        type: 'tuple',
        components: [
          { name: 'totalDeposits', internalType: 'uint256', type: 'uint256' },
          { name: 'feesAccumulated', internalType: 'uint256', type: 'uint256' },
          { name: 'feesCollected', internalType: 'uint256', type: 'uint256' },
          { name: 'balance', internalType: 'uint256', type: 'uint256' },
          { name: 'sponsored', internalType: 'uint256', type: 'uint256' },
        ],
      },
      { name: '_poolToken', internalType: 'address', type: 'address' },
      { name: '_participants', internalType: 'address[]', type: 'address[]' },
      { name: '_winners', internalType: 'address[]', type: 'address[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'winner', internalType: 'address', type: 'address' }],
    name: 'getClaimablePools',
    outputs: [
      { name: '', internalType: 'uint256[]', type: 'uint256[]' },
      { name: '', internalType: 'bool[]', type: 'bool[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'getHost',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'participant', internalType: 'address', type: 'address' },
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getParticipantDeposit',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'participant', internalType: 'address', type: 'address' },
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getParticipantDetail',
    outputs: [
      {
        name: '',
        internalType: 'struct IPool.ParticipantDetail',
        type: 'tuple',
        components: [
          { name: 'deposit', internalType: 'uint256', type: 'uint256' },
          { name: 'feesCharged', internalType: 'uint256', type: 'uint256' },
          {
            name: 'participantIndex',
            internalType: 'uint120',
            type: 'uint120',
          },
          {
            name: 'joinedPoolsIndex',
            internalType: 'uint120',
            type: 'uint120',
          },
          { name: 'refunded', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'participant', internalType: 'address', type: 'address' },
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getParticipantIndex',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'getParticipants',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'getPoolBalance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'getPoolDeposits',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'getPoolDetail',
    outputs: [
      {
        name: '',
        internalType: 'struct IPool.PoolDetail',
        type: 'tuple',
        components: [
          { name: 'timeStart', internalType: 'uint40', type: 'uint40' },
          { name: 'timeEnd', internalType: 'uint40', type: 'uint40' },
          { name: 'poolAdmin', internalType: 'address', type: 'address' },
          { name: 'totalWinners', internalType: 'uint16', type: 'uint16' },
          { name: 'poolName', internalType: 'string', type: 'string' },
          {
            name: 'depositAmountPerPerson',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'amountPerWinner', internalType: 'uint256', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'getPoolEndTime',
    outputs: [{ name: '', internalType: 'uint40', type: 'uint40' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'getPoolName',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'getPoolStartTime',
    outputs: [{ name: '', internalType: 'uint40', type: 'uint40' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'getPoolToken',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'host', internalType: 'address', type: 'address' }],
    name: 'getPoolsCreatedBy',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'participant', internalType: 'address', type: 'address' }],
    name: 'getPoolsJoinedBy',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'getSponsorMessages',
    outputs: [{ name: '', internalType: 'string[]', type: 'string[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'getSponsors',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'getSponsorshipAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
      { name: 'winner', internalType: 'address', type: 'address' },
    ],
    name: 'getWinnerAmountClaimed',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
      { name: 'winner', internalType: 'address', type: 'address' },
    ],
    name: 'getWinnerDetail',
    outputs: [
      {
        name: '',
        internalType: 'struct IPool.WinnerDetail',
        type: 'tuple',
        components: [
          { name: 'amountWon', internalType: 'uint256', type: 'uint256' },
          { name: 'amountClaimed', internalType: 'uint256', type: 'uint256' },
          { name: 'timeWon', internalType: 'uint40', type: 'uint40' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
      { name: 'winner', internalType: 'address', type: 'address' },
    ],
    name: 'getWinnerTimeWon',
    outputs: [{ name: '', internalType: 'uint40', type: 'uint40' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'getWinners',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'poolId', internalType: 'uint256', type: 'uint256' }],
    name: 'getWinnersDetails',
    outputs: [
      { name: '', internalType: 'address[]', type: 'address[]' },
      {
        name: '',
        internalType: 'struct IPool.WinnerDetail[]',
        type: 'tuple[]',
        components: [
          { name: 'amountWon', internalType: 'uint256', type: 'uint256' },
          { name: 'amountClaimed', internalType: 'uint256', type: 'uint256' },
          { name: 'timeWon', internalType: 'uint40', type: 'uint40' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
      { name: 'winner', internalType: 'address', type: 'address' },
    ],
    name: 'getWinningAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'isHost',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'isParticipant',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'joinedPools',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'latestPoolId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'participantDetail',
    outputs: [
      { name: 'deposit', internalType: 'uint256', type: 'uint256' },
      { name: 'feesCharged', internalType: 'uint256', type: 'uint256' },
      { name: 'participantIndex', internalType: 'uint120', type: 'uint120' },
      { name: 'joinedPoolsIndex', internalType: 'uint120', type: 'uint120' },
      { name: 'refunded', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'participants',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'poolBalance',
    outputs: [
      { name: 'totalDeposits', internalType: 'uint256', type: 'uint256' },
      { name: 'feesAccumulated', internalType: 'uint256', type: 'uint256' },
      { name: 'feesCollected', internalType: 'uint256', type: 'uint256' },
      { name: 'balance', internalType: 'uint256', type: 'uint256' },
      { name: 'sponsored', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'poolDetail',
    outputs: [
      { name: 'timeStart', internalType: 'uint40', type: 'uint40' },
      { name: 'timeEnd', internalType: 'uint40', type: 'uint40' },
      { name: 'poolAdmin', internalType: 'address', type: 'address' },
      { name: 'totalWinners', internalType: 'uint16', type: 'uint16' },
      { name: 'poolName', internalType: 'string', type: 'string' },
      {
        name: 'depositAmountPerPerson',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: 'amountPerWinner', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'poolToken',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
      { name: 'winner', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setWinner',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
      { name: '_winners', internalType: 'address[]', type: 'address[]' },
      { name: 'amounts', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'setWinners',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
      { name: '_winners', internalType: 'address[]', type: 'address[]' },
    ],
    name: 'setWinnersEvenly',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'oneTimeShortMessage', internalType: 'string', type: 'string' },
    ],
    name: 'sponsor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'sponsorAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'sponsorMessages',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'sponsors',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: 'poolId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'winnerDetail',
    outputs: [
      { name: 'amountWon', internalType: 'uint256', type: 'uint256' },
      { name: 'amountClaimed', internalType: 'uint256', type: 'uint256' },
      { name: 'timeWon', internalType: 'uint40', type: 'uint40' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'winners',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'participant',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Deposit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'participant',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ExtraDeposit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'host', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'poolName',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'depositAmountPerPerson',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'PoolCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'host', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RemainingBalanceCollected',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'sponsor',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'oneTimeShortMessage',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'SponsorshipAdded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'winner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'WinnerSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'poolId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'winner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'WinningsClaimed',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  {
    type: 'error',
    inputs: [{ name: 'caller', internalType: 'address', type: 'address' }],
    name: 'Unauthorized',
  },
] as const

/**
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5CA11740144513897Be27e3E82D75Aa75067F712)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5C22662210E48D0f5614cACA6f7a6a938716Ea26)
 */
export const poolAddress = {
  8453: '0x5CA11740144513897Be27e3E82D75Aa75067F712',
  84532: '0x5C22662210E48D0f5614cACA6f7a6a938716Ea26',
} as const

/**
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x5CA11740144513897Be27e3E82D75Aa75067F712)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x5C22662210E48D0f5614cACA6f7a6a938716Ea26)
 */
export const poolConfig = { address: poolAddress, abi: poolAbi } as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Token
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x833589fcd6edb6e08f4c7c32d4f71b54bda02913)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xfD2Ec58cE4c87b253567Ff98ce2778de6AF0101b)
 */
export const tokenAbi = [
  {
    type: 'event',
    inputs: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'spender', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
    name: 'Transfer',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'sender', type: 'address' },
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
  },
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
] as const

/**
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x833589fcd6edb6e08f4c7c32d4f71b54bda02913)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xfD2Ec58cE4c87b253567Ff98ce2778de6AF0101b)
 */
export const tokenAddress = {
  8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  84532: '0xfD2Ec58cE4c87b253567Ff98ce2778de6AF0101b',
} as const

/**
 * - [__View Contract on Base Basescan__](https://basescan.org/address/0x833589fcd6edb6e08f4c7c32d4f71b54bda02913)
 * - [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0xfD2Ec58cE4c87b253567Ff98ce2778de6AF0101b)
 */
export const tokenConfig = { address: tokenAddress, abi: tokenAbi } as const
