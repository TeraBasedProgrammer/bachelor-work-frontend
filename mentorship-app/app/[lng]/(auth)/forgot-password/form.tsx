'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/useToast';
import { axiosInstance } from '@/lib/services/axiosConfig';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  emailInput: z.string().email('Please enter a valid email'),
});

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const params = useParams();
  const lng = params.lng as string;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailInput: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await axiosInstance.post(
        '/users/auth/forgot-password/request',
        {
          email: values.emailInput,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      toast({
        title: 'Reset email sent',
        description: 'Check your inbox for instructions to reset your password.',
      });
      setIsSubmitted(true);
    } catch (err) {
      console.log(err);
      toast({
        title: 'Error',
        description: 'Failed to send reset email. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="space-y-6 border-2 border-gray-200 rounded-md py-8 px-14 mx-auto backdrop-blur-sm">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">Check your email</h2>
        <p className="text-center">
          We&apos;ve sent password reset instructions to your email address. Please check your inbox
          and follow the link to reset your password.
        </p>
        <div className="flex justify-center">
          <Link href={`/${lng}/login`}>
            <Button className="mt-4 bg-blue-brand font-semibold">Return to login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 border-2 border-gray-200 rounded-md py-8 px-14 mx-auto backdrop-blur-sm">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">Forgot Password</h2>

        <p className="text-center">
          Enter your email address and we&apos;ll send you instructions to reset your password.
        </p>

        <FormField
          control={form.control}
          name="emailInput"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Email" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage className="text-[#ff000d]" />
            </FormItem>
          )}
        />

        <Button
          className="bg-blue-brand text-white font-semibold w-full"
          type="submit"
          disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Reset Instructions'}
        </Button>

        <div className="flex justify-center text-sm">
          <p>Remember your password? </p>
          <Link className="ml-1 underline" href={`/${lng}/login`}>
            Login
          </Link>
        </div>
      </form>
    </Form>
  );
}
