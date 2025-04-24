'use client';

import { UserData } from '@/app/types';
import { Card, CardContent } from '@/components/ui/card';
import { PiCoinVerticalFill } from 'react-icons/pi';
import CreditsChoiceDialog from './CreditsChoiceDialog';

const BalanceInfo = ({ userData }: { userData: UserData | null }) => {
  return (
    <>
      <h2 className="text-4xl max-w-3xl mx-auto mb-8">Balance info</h2>
      <Card className="max-w-3xl mx-auto">
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Current Balance</p>
              <p className="text-2xl font-bold flex items-center gap-1">
                {userData?.balance || 0} <PiCoinVerticalFill />{' '}
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
