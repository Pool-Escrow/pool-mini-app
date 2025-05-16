import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PREDEFINED_TOKENS } from '@/config/tokens'
import { PoolConfigStepSchema, type PoolConfigStepValues } from '@/lib/validators/poolCreationSchemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

interface PoolConfigStepProps {
    initialData?: Partial<PoolConfigStepValues>
    onNext: (data: PoolConfigStepValues) => void
    onBack?: () => void
}

const CUSTOM_TOKEN_KEY = 'custom'

export function PoolConfigStep({ initialData, onNext, onBack }: PoolConfigStepProps) {
    const form = useForm<PoolConfigStepValues>({
        resolver: zodResolver(PoolConfigStepSchema),
        defaultValues: {
            depositAmount: initialData?.depositAmount ?? undefined,
            limit: initialData?.limit ?? undefined,
            rulesLink: initialData?.rulesLink ?? '',
            selectedTokenKey: initialData?.selectedTokenKey ?? Object.keys(PREDEFINED_TOKENS)[0] ?? CUSTOM_TOKEN_KEY,
            customTokenAddress: initialData?.customTokenAddress ?? '',
            customTokenSymbol: initialData?.customTokenSymbol ?? '',
            customTokenDecimals: initialData?.customTokenDecimals ?? undefined,
            winnerCount: initialData?.winnerCount ?? 1,
            amountPerWinner: initialData?.amountPerWinner ?? undefined,
        },
    })

    const selectedTokenKey = form.watch('selectedTokenKey')

    useEffect(() => {
        if (selectedTokenKey !== CUSTOM_TOKEN_KEY) {
            form.setValue('customTokenAddress', '')
            form.setValue('customTokenSymbol', '')
            form.setValue('customTokenDecimals', undefined)
        }
    }, [selectedTokenKey, form])

    const handleFormSubmit = (data: PoolConfigStepValues): void => {
        const finalData = { ...data }
        if (data.selectedTokenKey !== CUSTOM_TOKEN_KEY && PREDEFINED_TOKENS[data.selectedTokenKey]) {
            const predefined = PREDEFINED_TOKENS[data.selectedTokenKey]
            finalData.customTokenAddress = predefined.address
            finalData.customTokenSymbol = predefined.symbol
            finalData.customTokenDecimals = predefined.decimals
        }
        onNext(finalData)
    }

    return (
        <Form {...form}>
            <form
                onSubmit={e => {
                    void form.handleSubmit(handleFormSubmit)(e)
                }}
                className='mx-auto flex w-full max-w-md flex-col items-center space-y-6 p-4 sm:p-8'>
                <h2 className='mb-2 text-center text-2xl font-semibold'>Pool Configuration</h2>
                <p className='text-muted-foreground mb-6 text-center text-sm'>
                    Define deposit amounts, limits, token, and prize details.
                </p>

                <FormField
                    control={form.control}
                    name='depositAmount'
                    render={({ field }) => (
                        <FormItem className='w-full'>
                            <FormLabel>Deposit Amount (per entry)</FormLabel>
                            <FormControl>
                                <Input
                                    type='number'
                                    placeholder='e.g., 10'
                                    {...field}
                                    onChange={event => field.onChange(+event.target.value)}
                                />
                            </FormControl>
                            <FormDescription>Required token amount for one entry.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='selectedTokenKey'
                    render={({ field }) => (
                        <FormItem className='w-full'>
                            <FormLabel>Choose Token</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select a token' />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {Object.entries(PREDEFINED_TOKENS).map(([key, token]) => (
                                        <SelectItem key={key} value={key}>
                                            {token.symbol}
                                        </SelectItem>
                                    ))}
                                    <SelectItem value={CUSTOM_TOKEN_KEY}>Custom Token</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {selectedTokenKey === CUSTOM_TOKEN_KEY && (
                    <>
                        <FormField
                            control={form.control}
                            name='customTokenAddress'
                            render={({ field }) => (
                                <FormItem className='w-full'>
                                    <FormLabel>Custom Token Contract Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder='0x...' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='customTokenSymbol'
                            render={({ field }) => (
                                <FormItem className='w-full'>
                                    <FormLabel>Custom Token Symbol</FormLabel>
                                    <FormControl>
                                        <Input placeholder='e.g., MYT' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='customTokenDecimals'
                            render={({ field }) => (
                                <FormItem className='w-full'>
                                    <FormLabel>Custom Token Decimals</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='number'
                                            placeholder='e.g., 18'
                                            {...field}
                                            onChange={event => field.onChange(+event.target.value)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                )}

                <FormField
                    control={form.control}
                    name='limit' // maxEntries in old form
                    render={({ field }) => (
                        <FormItem className='w-full'>
                            <FormLabel>Max Entries (Optional)</FormLabel>
                            <FormControl>
                                <Input
                                    type='number'
                                    placeholder='e.g., 100 (leave blank for unlimited)'
                                    {...field}
                                    onChange={event =>
                                        field.onChange(event.target.value === '' ? undefined : +event.target.value)
                                    }
                                />
                            </FormControl>
                            <FormDescription>
                                Maximum number of entries allowed. Leave blank for no limit.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='winnerCount'
                    render={({ field }) => (
                        <FormItem className='w-full'>
                            <FormLabel>Number of Winners</FormLabel>
                            <FormControl>
                                <Input
                                    type='number'
                                    placeholder='e.g., 1'
                                    {...field}
                                    onChange={event => field.onChange(+event.target.value)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='amountPerWinner'
                    render={({ field }) => (
                        <FormItem className='w-full'>
                            <FormLabel>Amount Per Winner</FormLabel>
                            <FormControl>
                                <Input
                                    type='number'
                                    placeholder='e.g., 1000'
                                    {...field}
                                    onChange={event => field.onChange(+event.target.value)}
                                />
                            </FormControl>
                            <FormDescription>The amount each winner will receive.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='rulesLink'
                    render={({ field }) => (
                        <FormItem className='w-full'>
                            <FormLabel>Rules Link (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder='https://example.com/pool-rules' {...field} />
                            </FormControl>
                            <FormDescription>Link to a page detailing the pool rules.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className='mt-8 flex w-full flex-col gap-4 sm:flex-row'>
                    {onBack && (
                        <Button type='button' onClick={onBack} variant='outline' className='w-full'>
                            Back
                        </Button>
                    )}
                    <Button type='submit' className='w-full'>
                        Continue
                    </Button>
                </div>
            </form>
        </Form>
    )
}
