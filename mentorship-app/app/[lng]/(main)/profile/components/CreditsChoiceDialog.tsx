import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const creditsVariants = [
  {
    title: '25 credits',
    description: 'Enough credits to pay for 1-2 lessons. Suitable for beginner learners.',
    price: 10,
  },
  {
    title: '200 credits',
    description: 'Enough credits to pay for 10-12 lessons. Suitable for intermediate learners.',
    price: 10,
  },
  {
    title: '500 credits',
    description: 'Enough credits to pay for 25-30 lessons. Suitable for advanced learners.',
    price: 10,
  },
];

export default function CreditsChoiceDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-blue-brand text-white">Increase Balance</Button>
      </DialogTrigger>
      <DialogContent className="w-2/3">
        <DialogHeader>
          <DialogTitle className="text-center">Choose credits amount</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center items-center gap-4 w-3xl">
          {creditsVariants.map((variant) => (
            <Card key={variant.title} className="w-1/3 h-full">
              <CardHeader>
                <CardTitle>{variant.title}</CardTitle>
                <CardDescription className="">{variant.description}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center items-center">
                <Button className="bg-blue-brand text-white">Buy</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
