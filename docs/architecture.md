# Pool Mini-App Core Architecture Documentation

## OnchainKit Integration

The Pool mini-app integrates with OnchainKit for wallet connectivity and blockchain interactions:

### Wallet Connection Components

The primary integration occurs in the `Balance.tsx` component through these OnchainKit imports:

```tsx
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
```

These components provide:

- User authentication via wallet connection
- Display of wallet information (address, balance)
- User identity representation through avatar and name
- Wallet connection/disconnection UI

### Integration Pattern

OnchainKit components are used with a composable pattern:

```tsx
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
```

## State Management Approach

The application uses React's built-in state management:

1. **Component-Level State**:

   - `useState` hooks for local component state

   ```tsx
   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
   const [currentWizardStep, setCurrentWizardStep] = useState(1);
   const [wizardPoolData, setWizardPoolData] = useState<Partial<Pool>>({});
   ```

2. **Data Flow**:

   - Parent-to-child prop passing for configuration
   - Child-to-parent callback functions for data updates

   ```tsx
   // Callback pattern example
   const handleWizardStepChange = (step: number, data?: StepData) => {
     setCurrentWizardStep(step);
     if (data) {
       setWizardPoolData((prevData) => ({ ...prevData, ...data }));
     }
   };
   ```

3. **Form Data Collection**:
   - Incremental data gathering through wizard steps
   - Data preserved between step navigation
   - Final data submission through callback

## Component Architecture

### Core Components

1. **Balance Component** (`Balance.tsx`)

   - Main dashboard view with wallet integration
   - Entry point for pool creation

2. **CreatePoolWizard** (`CreatePoolWizard.tsx`)

   - Multi-step form orchestration
   - Step navigation and data aggregation
   - Configurable through props

3. **Wizard Steps**:

   - `ChooseImageStep.tsx` - Image selection UI
   - `NameDescriptionStep.tsx` - Basic pool information form
   - `DetailsStep.tsx` - Advanced pool configuration
   - `TemplateSelectionStep.tsx` - Template-based creation

4. **UI Elements**:
   - `ProgressBar.tsx` - Visual step indicator
   - `Icon.tsx` - Icon component wrapper
   - `Drawer` from UI component library for modal-like experiences

### Data Model

The core data model is the `Pool` interface defined in `app/types/pool.ts`:

```typescript
export interface Pool {
  id: string;
  selectedImage: string;
  name: string;
  description: string;
  buyIn: number;
  softCap: number;
  rulesLink: string;
  createdAt: Date;
}
```

### Component Relationship Diagram

```
Balance Component
│
├── Wallet Connection (OnchainKit)
│   └── User Identity Display
│
└── CreatePoolWizard
    ├── ProgressBar
    │
    └── Step Components
        ├── ChooseImageStep
        ├── NameDescriptionStep
        └── DetailsStep
```

## Application Flow

1. User connects wallet using OnchainKit components
2. User initiates pool creation from Balance component
3. Drawer opens with CreatePoolWizard component
4. User progresses through wizard steps
5. Each step collects and validates portion of data
6. On completion, aggregated data is saved via poolStorage
7. UI resets for potential next creation

## Implementation Patterns

1. **Controlled Components**:

   - Form inputs tied to React state
   - Validation handled at step level

2. **Component Composition**:

   - OnchainKit components wrapped in custom UI
   - UI library components extended with custom styling

3. **Progressive Disclosure**:

   - Complex form broken into logical steps
   - Progress tracking with visual indicators

4. **Stateful Navigation**:
   - Data preservation between steps
   - Back/forward navigation support

This architecture follows modern React patterns, emphasizing component composition, hooks-based state management, and clean separation between UI and data handling logic.
