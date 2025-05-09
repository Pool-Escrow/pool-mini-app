---
description: 
globs: 
alwaysApply: false
---
# Preserving Existing Codebase Functionality

- **Critical Preservation Rule**
  - The existing codebase structure and functionality must be preserved
  - Extensions and new components should follow established patterns
  - All existing code must remain functional without changes to core behavior

## Core Protected Components

- **OnchainKit Integration**
  - The OnchainKit wallet integration must remain intact
  - ```typescript
    // ✅ DO: Import and use the existing OnchainKit components
    import {
      ConnectWallet,
      Wallet,
      WalletDropdown,
      WalletDropdownDisconnect,
    } from "@coinbase/onchainkit/wallet";
    
    // ❌ DON'T: Replace or modify OnchainKit integration
    // Do not remove or replace existing wallet functionality
    ```

- **Balance Component**
  - The `Balance.tsx` component must be preserved
  - Only extend or add new components alongside it
  - ```typescript
    // ✅ DO: Add new components that work alongside Balance
    <div>
      <Balance /> {/* Keep existing Balance component */}
      <NewComponent /> {/* Add new components alongside */}
    </div>
    
    // ❌ DON'T: Modify the internals of the Balance component
    // Don't change its core functionality or UI structure
    ```

- **Wizard Component Pattern**
  - Reuse the existing `CreatePoolWizard` pattern for new wizards
  - ```typescript
    // ✅ DO: Follow the existing wizard pattern
    export function NewWizard({
      currentStep,
      data,
      onStepChange,
      onComplete,
    }) {
      // Similar structure to CreatePoolWizard
    }
    
    // ❌ DON'T: Create wizards with completely different patterns
    // Don't introduce new step management approaches
    ```

## UI and Styling Standards

- **Design System**
  - Use the existing color system and typography
  - Maintain consistency with established component styling
  - Don't introduce alternative styling approaches or libraries

- **Component Structure**
  - Follow the existing component organization patterns
  - Place new wizard steps in the appropriate directory
  - Maintain similar prop patterns and component interfaces

## Pattern Recognition and Extension

- **Before Creating New Components:**
  - Analyze similar existing components
  - Understand their structure, props, and styling
  - Replicate patterns when creating new components

- **When Extending Functionality:**
  - Add to existing patterns rather than replacing them
  - Complement current behavior without disrupting it
  - Ensure backward compatibility with existing code

## Implementation Guidelines

- **Code Analysis First**
  - Always start by understanding relevant existing code 
  - Review file structure, imports, and component organization
  - Look for reusable patterns before creating new ones

- **Additive Changes Only**
  - Add new files and components alongside existing ones
  - Only modify existing files when absolutely necessary
  - Never delete existing functionality or components

- **Testing Considerations**
  - Ensure existing functionality remains working
  - Test interactions between new and existing components
  - Verify that extensions don't break current behavior
