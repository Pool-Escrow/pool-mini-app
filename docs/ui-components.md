# UI Component Structure and Styling Conventions

## Component Libraries

The Pool mini-app uses a carefully selected combination of UI libraries and custom components:

1. **Shadcn UI Components**

   - Used for core UI primitives like Drawer
   - Based on Radix UI primitives with custom styling
   - Located in `/components/ui/` directory
   - Examples: Drawer component from `vaul`

2. **OnchainKit UI Components**

   - Used for wallet connection and blockchain identity
   - Located in external package `@coinbase/onchainkit`
   - Examples: `Wallet`, `ConnectWallet`, `Avatar`, `Identity`

3. **Custom Application Components**
   - Located in `/app/components/`
   - Examples: `Balance`, `CreatePoolWizard`, `ProgressBar`, `Icon`

## Styling Methodology

### 1. Tailwind CSS

The primary styling approach uses Tailwind CSS utility classes:

```tsx
<Avatar className="w-8 h-8 rounded-full" />
<DrawerTitle className="text-sm font-medium text-gray-500">
```

Key aspects of the Tailwind implementation:

- Direct utility classes in component JSX
- Color scheme uses both theme colors and explicit colors
- Responsive design with screen size prefixes
- Flexbox and Grid layouts for positioning

### 2. Class Name Utility

The codebase uses a `cn` utility function (from `/lib/utils`) for conditional class merging:

```tsx
className={cn(
  "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
  className
)}
```

This pattern enables:

- Base styles to be applied consistently
- Props to override or extend base styles
- Conditional class application

### 3. CSS Variables

Theme colors and design tokens are defined through CSS variables:

- Base colors with semantic naming (primary, secondary)
- UI state variations (hover, active, disabled)
- Consistent spacing, typography, and radius values

## Component Structure Patterns

### 1. Compound Component Pattern

UI components are structured using the compound component pattern:

```tsx
<Drawer>
  <DrawerTrigger />
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle />
    </DrawerHeader>
  </DrawerContent>
</Drawer>
```

Benefits:

- Clear parent-child relationships
- Encapsulated component logic
- Flexible composition

### 2. Forward Ref Pattern

Complex components utilize `React.forwardRef` for DOM reference passing:

```tsx
const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  // Component implementation
))
```

This enables:

- DOM manipulation from parent components
- Focus management
- Animation control

### 3. Props Spreading Pattern

Components accept and spread additional props:

```tsx
const Drawer = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
);
```

This provides:

- Extensibility for custom use cases
- Default prop values with override capability
- Type safety through TypeScript interfaces

## Form Components and Patterns

### 1. Controlled Components

Form elements are implemented as controlled components:

```tsx
const [name, setName] = useState(initialData?.name || "");

<input
  value={name}
  onChange={(e) => setName(e.target.value)}
  className="w-full p-2 border rounded"
/>;
```

### 2. Validation Approach

Form validation combines:

- Client-side validation before submission
- Inline validation feedback
- Disabled submit buttons until validation passes

### 3. Multi-step Forms

The wizard pattern breaks complex forms into manageable steps:

- Each step has its own validation
- Data is collected incrementally
- Navigation preserves entered data

## Layout and Responsive Design

### 1. Mobile-First Approach

Components are designed with mobile as the base case:

- Core functionality works on smallest screens
- Progressive enhancement for larger screens
- Media query classes (sm:, md:, lg:) for responsive adjustments

### 2. Flex and Grid Layouts

Layout predominantly uses:

- Flexbox for one-dimensional layouts (`flex flex-col`)
- Grid for two-dimensional layouts
- Auto-placement and responsive grid templates

### 3. Spacing System

Consistent spacing using Tailwind's scale:

- Margin and padding follow consistent patterns
- Responsive spacing adjustments at breakpoints
- Gap utilities for child element spacing

## Component Hierarchy

The overall component hierarchy follows this structure:

```
Page Components
│
├── Layout Components
│   └── Balance, Header, etc.
│
├── Feature Components
│   ├── CreatePoolWizard
│   └── Step Components
│
├── UI Primitives (from Shadcn/Radix)
│   ├── Drawer
│   ├── Button
│   └── Other UI components
│
└── OnchainKit Components
    ├── Wallet Connection
    └── Identity Display
```

## Best Practices Observed

1. **Component Naming**

   - Clear, descriptive names
   - PascalCase for components
   - Prefixing related components (Drawer\*)

2. **Code Organization**

   - Separation of UI primitives from feature components
   - Logical grouping of related components
   - Consistent file structure and exports

3. **Accessibility**

   - ARIA attributes on interactive elements
   - Semantic HTML elements
   - Keyboard navigation support

4. **Performance Considerations**
   - Component memoization where appropriate
   - Efficient prop passing
   - State management at appropriate component levels

These patterns provide a solid foundation for extending the UI with new features while maintaining consistency with the existing design system.
