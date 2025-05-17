import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { getChainConfig } from '@/config/chainConfig'
import type { Pool } from '@/types/pool'
import { CheckCircle2 } from 'lucide-react'
import React from 'react'

interface JoinPoolSuccessReceiptProps {
    pool: Pool
    txHash: string
    onClose: () => void
}

export const JoinPoolSuccessReceipt: React.FC<JoinPoolSuccessReceiptProps> = ({ pool, txHash, onClose }) => {
    const chainConfig = getChainConfig(pool.chainId)
    const explorerLink = `${chainConfig.explorerUrl}/tx/${txHash}`

    return (
        <Card className='w-full max-w-md'>
            <CardHeader>
                <div className='flex items-center space-x-2'>
                    <CheckCircle2 className='h-8 w-8 text-green-500' />
                    <CardTitle>Successfully Joined Pool!</CardTitle>
                </div>
                <CardDescription>You have successfully deposited into {pool.name}.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
                <Alert variant='default'>
                    {' '}
                    {/* 'default' or undefined should give a standard look */}
                    <CheckCircle2 className='h-4 w-4' />
                    <AlertTitle>Deposit Confirmed</AlertTitle>
                    <AlertDescription className='space-y-1'>
                        <p>
                            <strong>Pool:</strong> {pool.name}
                        </p>
                        <p>
                            <strong>Amount Deposited:</strong> {pool.depositAmountPerPerson} {pool.onChainTokenSymbol}
                        </p>
                        <p>
                            <strong>Transaction Hash:</strong>
                            <a
                                href={explorerLink}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='ml-1 break-all text-blue-600 hover:underline'>
                                {txHash}
                            </a>
                        </p>
                        {/* Consider adding a timestamp if available/relevant */}
                    </AlertDescription>
                </Alert>
            </CardContent>
            <CardFooter>
                <Button onClick={onClose} className='w-full'>
                    Close
                </Button>
            </CardFooter>
        </Card>
    )
}
