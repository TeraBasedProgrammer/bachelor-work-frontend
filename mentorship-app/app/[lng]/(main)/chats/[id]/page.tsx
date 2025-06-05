'use client';

import { useTranslation } from '@/app/i18n/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/useToast';
import { axiosInstance } from '@/lib/services/axiosConfig';
import { zodResolver } from '@hookform/resolvers/zod';
import { Chatbox, Session } from '@talkjs/react';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { PiCoinVerticalFill } from 'react-icons/pi';
import * as z from 'zod';

const invoiceFormSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  description: z.string().min(1, 'Description is required'),
  due_date: z.string().min(1, 'Due date is required'),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export default function ChatPage() {
  const [conversationData, setConversationData] = useState<unknown | null>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const { data: session } = useSession();
  const { id } = useParams();
  const lng = useParams().lng;
  const { t } = useTranslation(lng as string, 'chats');

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      amount: '',
      description: '',
      due_date: '',
    },
  });

  useEffect(() => {
    const fetchConversationData = async () => {
      const response = await axios.get(
        `https://api.talkjs.com/v1/${process.env.NEXT_PUBLIC_TALKJS_APP_ID}/conversations/${id}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TALKJS_SECRET_KEY}`,
          },
        },
      );
      setConversationData(response.data);
    };
    fetchConversationData();
  }, [id]);

  console.log(conversationData);

  const onSubmit = async (values: InvoiceFormValues) => {
    if (!session?.accessToken) return;

    try {
      await axiosInstance.post(
        '/invoices',
        {
          ...values,
          amount: Number(values.amount),
          mentor_id: session.user.id,
          // @ts-expect-error conversationData is not typed
          mentee_id: Object.entries(conversationData!.participants).find(
            ([id]) => id !== session.user.id,
          )[0],
        },
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        },
      );

      toast({
        title: 'Success',
        description: 'Invoice created successfully',
        variant: 'success',
      });
      setIsInvoiceDialogOpen(false);
      form.reset();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({
          title: 'Error',
          description: error.response?.data.detail,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create invoice',
          variant: 'destructive',
        });
      }
    }
  };

  if (!session || !conversationData) {
    return <p className="text-2xl font-bold text-center mt-10">{t('loading')}</p>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t('chat')}</h1>
          <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-brand hover:bg-blue-brand/90 text-white font-semibold">
                {t('createInvoice')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('createInvoice')}</DialogTitle>
                <DialogDescription>{t('createInvoiceDescription')}</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('amount')}
                          <PiCoinVerticalFill className="w-5 h-5 text-yellow-500 inline-block" />
                        </FormLabel>
                        <FormControl>
                          <Input type="number" placeholder={t('amountPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('description')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('descriptionPlaceholder')}
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="due_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('dueDate')}</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsInvoiceDialogOpen(false)}>
                      {t('cancel')}
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-brand hover:bg-blue-brand/90 text-white font-semibold">
                      {t('createInvoice')}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        <Card className="p-4">
          <Session appId={process.env.NEXT_PUBLIC_TALKJS_APP_ID!} userId={session.user.id}>
            <Chatbox className="w-full h-[600px]" conversationId={id as string}></Chatbox>
          </Session>
        </Card>
      </div>
    </div>
  );
}
