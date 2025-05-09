# CreatePoolWizard Flow Analysis

This document analyzes the existing CreatePoolWizard implementation to serve as a template for the new giveaway feature. It documents the multi-step form flow, state management patterns, and component architecture that can be reused.

## Wizard Architecture Overview

The CreatePoolWizard implements a multi-step form pattern with these key components:

1. **Parent Container** (Balance.tsx)

   - Controls the drawer opening/closing
   - Manages top-level wizard state
   - Handles the form submission

2. **Wizard Coordinator** (CreatePoolWizard.tsx)

   - Renders the appropriate step component based on currentStep
   - Passes data and callbacks to step components
   - Handles navigation between steps
   - Consolidates data for final submission

3. **Step Components** (in app/components/steps/)

   - Individual form steps with focused UI and validation
   - Self-contained components that receive and return data
   - Handle their own state and validation

4. **Progress Indicator** (ProgressBar.tsx)
   - Visual representation of progress through the wizard
   - Updates as the user navigates between steps

## Data Flow & State Management

The wizard uses a unidirectional data flow with state lifted to the parent component:

```
Balance Component (Parent)
       │
       ▼
   Wizard State
  (currentStep,
   wizardPoolData)
       │
       ▼
CreatePoolWizard Component
       │
       ▼
  Step Components
```

### State Management Pattern

1. **State Declaration** (in Balance.tsx):

   ```tsx
   const [currentWizardStep, setCurrentWizardStep] = useState(1);
   const [wizardPoolData, setWizardPoolData] = useState<Partial<Pool>>({});
   ```

2. **State Update Handler** (in Balance.tsx):

   ```tsx
   const handleWizardStepChange = (step: number, data?: StepData) => {
     setCurrentWizardStep(step);
     if (data) {
       setWizardPoolData((prevData) => ({ ...prevData, ...data }));
     }
   };
   ```

3. **Completion Handler** (in Balance.tsx):
   ```tsx
   const handleWizardComplete = (
     completedPoolData: Omit<Pool, "id" | "createdAt">,
   ) => {
     const newPool = savePool(completedPoolData);
     setIsDrawerOpen(false);
   };
   ```

### Flow Control Pattern

1. **Next/Back Navigation** (in CreatePoolWizard.tsx):

   ```tsx
   const handleNext = (stepSpecificData: StepData) => {
     const updatedDataForParent = { ...poolData, ...stepSpecificData };
     if (currentStep < TOTAL_STEPS_WIZARD) {
       onStepChange(currentStep + 1, stepSpecificData);
     } else {
       onComplete(updatedDataForParent as Omit<Pool, "id" | "createdAt">);
     }
   };

   const handleBack = () => {
     if (currentStep > 1) {
       onStepChange(currentStep - 1);
     }
   };
   ```

2. **Conditional Rendering** (in CreatePoolWizard.tsx):
   ```tsx
   {
     currentStep === 1 && (
       <ChooseImageStep onNext={(data) => handleNext(data)} />
     );
   }
   {
     currentStep === 2 && (
       <NameDescriptionStep
         initialData={{
           name: poolData.name,
           description: poolData.description,
         }}
         onNext={(data) => handleNext(data)}
         onBack={handleBack}
       />
     );
   }
   ```

## Step Component Implementation Pattern

Each step follows a consistent pattern:

1. **Props Interface**:

   ```tsx
   interface NameDescriptionStepProps {
     initialData?: { name?: string; description?: string };
     onNext: (data: { name: string; description: string }) => void;
     onBack?: () => void;
   }
   ```

2. **Internal State Management**:

   ```tsx
   const [name, setName] = useState(initialData?.name || "");
   const [description, setDescription] = useState(
     initialData?.description || "",
   );
   ```

3. **Validation Logic**:

   ```tsx
   const isFormValid = () => {
     // Step-specific validation logic
     return conditionsAreMet;
   };
   ```

4. **Data Submission**:

   ```tsx
   const handleSubmit = () => {
     if (isFormValid()) {
       onNext({ name, description });
     }
   };
   ```

5. **UI Structure**:
   - Title and description for the step
   - Form fields with labels and validation
   - Back/Continue button row
   - Consistent styling

## Drawer Integration Pattern

The wizard is contained within a drawer component:

1. **Drawer Opening**:

   ```tsx
   const openDrawerAndResetState = () => {
     setCurrentWizardStep(1); // Reset to the first step
     setWizardPoolData({}); // Clear any previous pool data
     setIsDrawerOpen(true);
   };
   ```

2. **Drawer Structure**:
   ```tsx
   <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
     <DrawerTrigger asChild>
       <Button onClick={openDrawerAndResetState}>Create an Event</Button>
     </DrawerTrigger>
     <DrawerContent>
       <DrawerHeader>
         <DrawerTitle>Farcaster Frame</DrawerTitle>
         <DrawerClose />
       </DrawerHeader>
       <ProgressBar
         currentStep={currentWizardStep}
         totalSteps={TOTAL_STEPS_WIZARD}
       />
       <CreatePoolWizard
         currentStep={currentWizardStep}
         poolData={wizardPoolData}
         onStepChange={handleWizardStepChange}
         onComplete={handleWizardComplete}
       />
     </DrawerContent>
   </Drawer>
   ```

## Data Model

The Pool data model that informs the wizard structure:

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

## Recommended Extension for Giveaway Feature

### Giveaway Wizard Adaptation

1. **New Data Model**:

   ```typescript
   export interface Giveaway {
     id: string;
     title: string;
     description: string;
     prize: string;
     startDate: Date;
     endDate: Date;
     eligibility: string;
     selectedImage: string;
     createdAt: Date;
   }
   ```

2. **Step Structure**:

   - **Step 1**: Choose Image (can reuse existing component with minor modifications)
   - **Step 2**: Title and Description (can adapt NameDescriptionStep)
   - **Step 3**: Prize Details
   - **Step 4**: Date and Eligibility Settings

3. **Component Architecture**:

   ```
   GiveawayContainer (parent)
   │
   ├── Drawer
   │   ├── DrawerHeader
   │   ├── ProgressBar
   │   └── GiveawayWizard
   │       ├── ChooseImageStep (adapted)
   │       ├── TitleDescriptionStep (adapted)
   │       ├── PrizeDetailsStep (new)
   │       └── EligibilityStep (new)
   ```

4. **State Management**:
   - Use the same pattern of lifting state to the parent
   - Maintain unidirectional data flow
   - Keep form validation at the step level

## Sequence Diagram

```
User                        Balance                   CreatePoolWizard           Step Component
 │                             │                             │                         │
 ├─Click "Create Event"────────►                             │                         │
 │                             │                             │                         │
 │                             ├─Reset wizard state─────────►│                         │
 │                             │                             │                         │
 │                             ├─Open drawer─────────────────┼────────────────────────►
 │                             │                             │                         │
 │                             │                             ├─Render appropriate step─►
 │                             │                             │                         │
 │                             │                             │                         │
 ├─Complete step form──────────┼─────────────────────────────┼─────────────────────────►
 │                             │                             │                         │
 │                             │                             ◄─Return step data────────┤
 │                             │                             │                         │
 │                             ◄─Update wizardPoolData───────┤                         │
 │                             │                             │                         │
 │                             ├─Increment currentStep───────►                         │
 │                             │                             │                         │
 │                             │                             ├─Render next step────────►
 │                             │                             │                         │
 ├─ ... (repeat for each step)─┼─────────────────────────────┼─────────────────────────►
 │                             │                             │                         │
 ├─Submit final step───────────┼─────────────────────────────┼─────────────────────────►
 │                             │                             │                         │
 │                             │                             ◄─Complete wizard─────────┤
 │                             │                             │                         │
 │                             ├─Process completed data──────┤                         │
 │                             │ (savePool)                  │                         │
 │                             │                             │                         │
 │                             ├─Close drawer────────────────┤                         │
 │                             │                             │                         │
```

## Implementation Recommendations

1. **Reuse Patterns**:

   - Follow the same state management pattern
   - Adapt the drawer integration
   - Use the same step component structure

2. **Improvements to Consider**:

   - Add form validation feedback (currently minimal)
   - Consider form library integration for complex validation
   - Add loading states for async operations
   - Implement error handling for failed submissions

3. **Component Reuse**:

   - The ProgressBar can be reused directly
   - ChooseImageStep may be reused with minor modifications
   - The drawer pattern should be replicated
   - Form input styling should be maintained for consistency

4. **Testing Strategy**:
   - Test each step component in isolation
   - Test the full wizard flow integration
   - Verify state persistence between steps
   - Test validation logic and error states

By following these patterns and recommendations, the giveaway feature can maintain consistency with the existing codebase while implementing the new functionality.
