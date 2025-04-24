import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/useToast';
import { axiosInstance } from '@/lib/services/axiosConfig';
import { loadStripe } from '@stripe/stripe-js';
import { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

const creditsVariants = [
  {
    title: '25 credits',
    description: 'Enough credits to pay for 1-2 lessons. Suitable for beginner learners.',
    amount: 25,
    price: 4,
  },
  {
    title: '200 credits',
    description: 'Enough credits to pay for 10-12 lessons. Suitable for intermediate learners.',
    amount: 200,
    price: 30,
  },
  {
    title: '500 credits',
    description: 'Enough credits to pay for 25-30 lessons. Suitable for advanced learners.',
    amount: 500,
    price: 70,
  },
];

export default function CreditsChoiceDialog() {
  const [isLoading, setIsLoading] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { data: session } = useSession();

  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

  const handlePurchase = async (variant: (typeof creditsVariants)[number]) => {
    setIsLoading(variant.amount);
    try {
      const stripe = await stripePromise;
      const stripeSessionResponse = await axiosInstance.post(
        '/billing/create-checkout-session',
        {
          credits_amount: variant.amount,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );

      const error = await stripe?.redirectToCheckout({
        sessionId: stripeSessionResponse.data.session_id,
      });
      if (error) {
        toast({
          title: 'Purchase failed',
          description: 'Please try again',
          variant: 'destructive',
        });
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({
          title: 'Error',
          description: `${error.response?.data.detail}`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: `Failed to purchase credits: ${error}`,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-brand text-white">Increase Balance</Button>
      </DialogTrigger>
      <DialogContent className="w-3xl max-w-full mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Choose credits amount</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {creditsVariants.map((variant) => (
            <Card key={variant.title} className="h-full">
              <CardHeader>
                <CardTitle>{variant.title}</CardTitle>
                <CardDescription className="min-h-[60px]">{variant.description}</CardDescription>
                <p className="text-xl font-bold text-center">${variant.price}</p>
              </CardHeader>
              <CardFooter className="flex justify-center items-center">
                <Button
                  className="bg-blue-brand text-white w-full"
                  onClick={() => handlePurchase(variant)}
                  disabled={isLoading === variant.amount}>
                  {isLoading === variant.amount ? 'Processing...' : 'Buy'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
