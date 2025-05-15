import { FlatCompat } from '@eslint/eslintrc'
import eslintJs from '@eslint/js'
import tanstackQueryPlugin from '@tanstack/eslint-plugin-query'
import prettierConfig from 'eslint-config-prettier'
// import storybookPlugin from 'eslint-plugin-storybook'
import { dirname } from 'path'
import tseslint from 'typescript-eslint'
import { fileURLToPath } from 'url'
// import globals from "globals"; // Uncomment if you need to define global environments like browser/node explicitly

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
    baseDirectory: __dirname,
})

const eslintConfig = [
    // Base ESLint recommended rules
    eslintJs.configs.recommended,

    // Next.js configurations using FlatCompat
    ...compat.extends('next/core-web-vitals'),
    // next/typescript is often included in core-web-vitals or handled by tseslint directly.
    // If you still need specific rules from it, you can add it.
    // ...compat.extends("next/typescript"),

    // TypeScript configuration
    ...tseslint.config({
        // This is equivalent to plugin:@typescript-eslint/recommended-type-checked
        // It applies recommended rules that require type information.
        extends: [...tseslint.configs.recommendedTypeChecked, ...tseslint.configs.stylisticTypeChecked],
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: './tsconfig.json', // Adjusted from tsconfig.eslint.json as per common practice with new @typescript-eslint
                tsconfigRootDir: __dirname,
            },
        },
        rules: {
            // Your specific TypeScript rules
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/consistent-type-imports': 'warn',
            // Add other TypeScript specific rules here if needed
        },
    }),

    // TanStack Query configuration
    {
        files: ['**/*.ts', '**/*.tsx'], // Apply only to relevant files
        plugins: {
            '@tanstack/query': tanstackQueryPlugin,
        },
        rules: {
            ...tanstackQueryPlugin.configs.recommended.rules,
        },
    },

    // Tailwind CSS configuration - disabled for now, not compatible with eslint 9
    // {
    //     files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'], // Apply to relevant files
    //     plugins: {
    //         tailwindcss: tailwindcssPlugin,
    //     },
    //     rules: {
    //         ...tailwindcssPlugin.configs.recommended.rules,
    //     },
    // },

    // Storybook configuration
    // {
    //     // For Storybook files, typically in .stories.ts/tsx or .storybook/
    //     files: ['**/*.stories.@(ts|tsx|js|jsx|mjs|cjs)', '.storybook/**'],
    //     plugins: {
    //         storybook: storybookPlugin,
    //     },
    //     processor: storybookPlugin.processors.storiesMd, // if you use .stories.md files
    //     rules: {
    //         // Using spread for rules from storybookPlugin.configs.recommended.rules
    //         // is safer as 'extends' is not a standard property in flat config objects directly
    //         ...storybookPlugin.configs.recommended.rules,
    //     },
    // },
    // If you have .stories.mdx files:
    // {
    //     files: ['**/*.stories.mdx'],
    //     extends: ['plugin:mdx/recommended'],
    //     rules: {
    //         'react/jsx-filename-extension': [1, { extensions: ['.mdx'] }],
    //     },
    // },

    // General rules (can be in a separate object or merged)
    {
        rules: {
            'react/self-closing-comp': 'warn',
            // Add other global/JS/React rules here
        },
    },

    // Prettier configuration (should be last to override other styling rules)
    prettierConfig,

    // Ignore patterns
    {
        ignores: [
            'node_modules/',
            '.next/',
            '.vercel/',
            'contracts/*/*', // Your custom ignore pattern
            // Add other global ignore patterns here
        ],
    },
]

export default eslintConfig
