import { z } from 'zod'

// Schema for ChooseImageStep
export const ChooseImageStepSchema = z.object({
    selectedImage: z.string().min(1, { message: 'Please select or upload an image for the pool.' }),
    // Optionally, if it must be a URL, add .url({ message: "Invalid image URL provided." })
    // For simplicity, starting with min(1) to ensure something is selected/uploaded.
})

export type ChooseImageStepValues = z.infer<typeof ChooseImageStepSchema>

// Schema for NameDescriptionStep
export const NameDescriptionStepSchema = z.object({
    name: z
        .string()
        .min(3, { message: 'Pool name must be at least 3 characters long.' })
        .max(100, { message: 'Pool name must be no more than 100 characters long.' }),
    description: z
        .string()
        .min(10, { message: 'Description must be at least 10 characters long.' })
        .max(500, { message: 'Description must be no more than 500 characters long.' }),
})

export type NameDescriptionStepValues = z.infer<typeof NameDescriptionStepSchema>

// Schema for RegistrationTimeStep
export const RegistrationTimeStepSchema = z.object({
    registrationEnd: z
        .date({
            required_error: 'Registration end date is required.',
            invalid_type_error: "That's not a valid date!",
        })
        .min(new Date(), { message: 'Registration end date must be in the future.' }),
    // poolVisibility can be 'public' or 'private' (or other values you define)
    poolVisibility: z.enum(['public', 'private'], {
        required_error: 'Pool visibility is required.',
        invalid_type_error: 'Invalid pool visibility selected.',
    }),
})

export type RegistrationTimeStepValues = z.infer<typeof RegistrationTimeStepSchema>

// Schema for PoolConfigStep
// This schema now more closely matches the fields in the PoolConfigStep.tsx component
export const PoolConfigStepSchema = z
    .object({
        depositAmount: z.coerce
            .number({
                required_error: 'Deposit amount is required.',
                invalid_type_error: 'Deposit amount must be a number.',
            })
            .positive({ message: 'Deposit amount must be greater than 0.' }),
        limit: z.coerce // Formerly maxEntries
            .number({
                invalid_type_error: 'Max entries must be a number.',
            })
            .int({ message: 'Max entries must be a whole number.' })
            .positive({ message: 'Max entries must be greater than 0.' })
            .optional(), // Still optional for unlimited entries
        rulesLink: z.string().url({ message: 'Please enter a valid URL for the rules.' }).optional(), // Making optional for now, can be required later

        selectedTokenKey: z.string({ required_error: 'Please select a token.' }), // e.g., 'eth', 'usdc', 'custom'

        // Custom token fields - conditionally validated in the component or via refine/superRefine if needed
        customTokenAddress: z.string().optional(), // Basic string, regex for 0x... can be added
        customTokenSymbol: z.string().optional(),
        customTokenDecimals: z.coerce.number().int().min(0).max(18).optional(),

        winnerCount: z.coerce
            .number({
                required_error: 'Number of winners is required.',
                invalid_type_error: 'Number of winners must be a number.',
            })
            .int({ message: 'Number of winners must be a whole number.' })
            .positive({ message: 'Number of winners must be greater than 0.' }),
        amountPerWinner: z.coerce
            .number({
                required_error: 'Amount per winner is required.',
                invalid_type_error: 'Amount per winner must be a number.',
            })
            .positive({ message: 'Amount per winner must be greater than 0.' }),
    })
    .superRefine((data, ctx) => {
        if (data.selectedTokenKey === 'custom') {
            if (!data.customTokenAddress || !/^0x[a-fA-F0-9]{40}$/.test(data.customTokenAddress)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['customTokenAddress'],
                    message: 'A valid custom token address (0x...) is required.',
                })
            }
            if (!data.customTokenSymbol || data.customTokenSymbol.trim() === '') {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['customTokenSymbol'],
                    message: 'Custom token symbol is required.',
                })
            }
            if (
                data.customTokenDecimals === undefined ||
                data.customTokenDecimals === null ||
                data.customTokenDecimals < 0 ||
                data.customTokenDecimals > 18
            ) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['customTokenDecimals'],
                    message: 'Custom token decimals (0-18) are required.',
                })
            }
        }
        // Ensure total prize amount does not exceed depositAmount * limit (if limit is defined)
        // This logic might be complex if limit is optional or if multiple winners
        // For now, focusing on individual field validation
    })

export type PoolConfigStepValues = z.infer<typeof PoolConfigStepSchema>

// Schemas for other steps will be added here
