'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { toast } from '@/hooks/useToast';
import { axiosInstance } from '@/lib/services/axiosConfig';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import ErrorPage from 'next/error';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const passwordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters long'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const params = useParams();
  const token = searchParams.get('token');
  const lng = params.lng as string;

  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    if (token) {
      axiosInstance
        .post('/users/auth/forgot-password/verify-token', { token })
        .then(() => setIsTokenValid(true))
        .catch(() => setIsNotFound(true));
    }
  }, [token]);

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof passwordSchema>) {
    setIsLoading(true);
    try {
      await axiosInstance.post('/users/auth/forgot-password/reset', {
        token,
        password: values.password,
      });
      toast({
        title: 'Password Reset Successful',
        description: 'Your password has been reset successfully.',
      });
      setIsSubmitted(true);
    } catch (err) {
      console.log(err);
      if (err instanceof AxiosError) {
        if (err.response?.status === 400) {
          toast({
            title: 'Error',
            description: err.response?.data.detail,
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Error',
          description: 'Failed to reset password. Please try again later.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (isNotFound) {
    return <ErrorPage statusCode={404} />;
  }

  if (!token || !isTokenValid) {
    return null;
  }

  if (isSubmitted) {
    return (
      <div className="space-y-6 border-2 border-gray-200 rounded-md py-8 px-14 mx-auto backdrop-blur-sm">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
          Password Reset Successful
        </h2>
        <p className="text-center">Your password has been reset successfully.</p>
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
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">Reset Password</h2>

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PasswordInput
                  placeholder="New Password"
                  control={form.control}
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage className="text-[#ff000d]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PasswordInput
                  control={form.control}
                  placeholder="Confirm Password"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage className="text-[#ff000d]" />
            </FormItem>
          )}
        />

        <Button
          className="bg-blue-brand text-white font-semibold w-full"
          type="submit"
          disabled={isLoading}>
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
    </Form>
  );
}
