'use client';

import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/useToast';
import { axiosInstance } from '@/lib/services/axiosConfig';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { PiCoinVerticalFill } from 'react-icons/pi';
import CreditsChoiceDialog from './CreditsChoiceDialog';

const BalanceInfo = () => {
  const { data: session, update: updateSession } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleIncreaseBalance = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post(
        `/users/${session?.user?.id}/increase-balance`,
        { amount: 100 }, // You can make this configurable
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );

      // Update session with new balance
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          balance: response.data.balance,
        },
      });

      toast({
        title: 'Success',
        description: 'Balance increased successfully',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to increase balance',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-4xl max-w-3xl mx-auto mb-8">Balance info</h2>
      <Card className="max-w-3xl mx-auto">
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Current Balance</p>
              <p className="text-2xl font-bold flex items-center gap-1">
                {session?.user?.balance || 0} <PiCoinVerticalFill />{' '}
              </p>
            </div>
            <CreditsChoiceDialog />
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default BalanceInfo;
