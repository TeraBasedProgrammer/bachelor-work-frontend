'use client';

import { useTranslation } from '@/app/i18n/client';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { toast } from '@/hooks/useToast';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FcGoogle } from 'react-icons/fc';
import * as z from 'zod';

const formSchema = z.object({
  emailInput: z.string().email('Please enter a valid email'),
  passwordInput: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function LoginForm({ lng }: { lng: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation(lng, 'auth');
  const { t: tg } = useTranslation(lng, 'general');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailInput: '',
      passwordInput: '',
    },
  });

  if (!t || !tg) return null;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const res = await signIn('credentials', {
        email: values.emailInput,
        password: values.passwordInput,
        redirect: false,
      });

      if (!res) {
        toast({
          title: 'Unexpected Error',
          description: 'Something went wrong. Please try again later.',
          variant: 'destructive',
        });
      } else if (res.error) {
        toast({
          title: 'Login Failed',
          description: res.code,
          variant: 'destructive',
        });
      } else if (res.ok) {
        router.push(`/${lng}/profile`);
      } else {
        toast({
          title: 'Login Failed',
          description: 'Invalid email or password. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Network Error',
        description: 'Could not connect to the server. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setIsLoading(true);
    try {
      await signIn('google', {
        callbackUrl: `/${lng}/profile`,
      });
    } catch {
      toast({
        title: 'Google Login Failed',
        description: 'Unable to sign in with Google. Try again later.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 border-2 border-gray-200 rounded-md py-8 px-14 mx-auto backdrop-blur-sm">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">{t('loginTitle')}</h2>

        <Button
          type="button"
          variant="default"
          onClick={handleGoogleLogin}
          className="border-1 border-gray-200 w-full flex gap-2 justify-center items-center text-normal"
          disabled={isLoading}>
          <FcGoogle />
          <p>{t('continueWithGoogle')}</p>
        </Button>

        <div className="flex items-center justify-center">
          <hr className="w-full border-gray-200" />
          <p className="mx-4 text-gray-500 text-sm">{t('OR')}</p>
          <hr className="w-full border-gray-200" />
        </div>

        <FormField
          control={form.control}
          name="emailInput"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder={tg('emailPlaceholder')}
                  type="email"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="passwordInput"
          render={() => (
            <FormItem>
              <FormControl>
                <PasswordInput
                  placeholder={tg('passwordPlaceholder')}
                  control={form.control}
                  name="passwordInput"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <div className="flex justify-end text-sm">
          <Link className="underline" href={`/${lng}/forgot-password`}>
            {t('forgotPassword')}
          </Link>
        </div>
        <Button
          className="bg-blue-brand text-white font-semibold w-full"
          type="submit"
          disabled={isLoading}>
          {isLoading ? t('loginIn') + '...' : t('loginTitle')}
        </Button>
        <div className="flex justify-center text-sm">
          <p>{t('dontHaveAccount')} </p>
          <Link className="ml-1 underline" href={`/${lng}/sign-up`}>
            {t('signUp')}
          </Link>
        </div>
      </form>
    </Form>
  );
}
