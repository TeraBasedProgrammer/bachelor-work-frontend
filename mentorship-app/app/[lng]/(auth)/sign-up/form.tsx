// 'use client';

// import { Button } from '@/components/ui/button';
// import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
// import { Input } from '@/components/ui/input';
// import { PasswordInput } from '@/components/ui/PasswordInput';
// import { toast } from '@/hooks/useToast';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { signIn } from 'next-auth/react';
// import Link from 'next/link';
// import { useParams } from 'next/navigation';
// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { FcGoogle } from 'react-icons/fc';
// import * as z from 'zod';

// const formSchema = z
//   .object({
//     emailInput: z.string().email('Please enter a valid email'),
//     fullName: z.string().min(2, 'Full name must be at least 2 characters'),
//     phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'),
//     passwordInput: z.string().min(8, 'Password must be at least 8 characters'),
//     confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
//   })
//   .refine((data) => data.passwordInput === data.confirmPassword, {
//     message: "Passwords don't match",
//     path: ['confirmPassword'],
//   });

// export default function SignUpForm() {
//   const [isLoading, setIsLoading] = useState(false);
//   const params = useParams();
//   const lng = params.lng as string;

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       emailInput: '',
//       fullName: '',
//       phoneNumber: '',
//       passwordInput: '',
//       confirmPassword: '',
//     },
//   });

//   async function onSubmit(values: z.infer<typeof formSchema>) {}

//   async function handleGoogleLogin() {
//     setIsLoading(true);
//     try {
//       await signIn('google', {
//         callbackUrl: `/${lng}/profile`,
//       });
//     } catch {
//       toast({
//         title: 'Google Login Failed',
//         description: 'Unable to sign in with Google. Try again later.',
//         variant: 'destructive',
//       });
//       setIsLoading(false);
//     }
//   }

//   return (
//     <Form {...form}>
//       <form
//         onSubmit={form.handleSubmit(onSubmit)}
//         className="space-y-6 border-2 border-gray-200 rounded-md py-8 px-14 mx-auto backdrop-blur-sm">
//         <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">Sign up</h2>

//         <Button
//           type="button"
//           variant="default"
//           onClick={handleGoogleLogin}
//           className="border-1 border-gray-200 w-full flex gap-2 justify-center items-center text-normal"
//           disabled={isLoading}>
//           <FcGoogle />
//           <p>Continue with Google</p>
//         </Button>

//         <div className="flex items-center justify-center">
//           <hr className="w-full border-gray-200" />
//           <p className="mx-4 text-gray-500 text-sm">OR</p>
//           <hr className="w-full border-gray-200" />
//         </div>

//         <FormField
//           control={form.control}
//           name="emailInput"
//           render={({ field }) => (
//             <FormItem>
//               <FormControl>
//                 <Input placeholder="Email" type="email" {...field} disabled={isLoading} />
//               </FormControl>
//               <FormMessage className="text-red-500" />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name="fullName"
//           render={({ field }) => (
//             <FormItem>
//               <FormControl>
//                 <Input placeholder="Full Name" {...field} disabled={isLoading} />
//               </FormControl>
//               <FormMessage className="text-red-500" />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name="phoneNumber"
//           render={({ field }) => (
//             <FormItem>
//               <FormControl>
//                 <Input placeholder="Phone Number" {...field} disabled={isLoading} />
//               </FormControl>
//               <FormMessage className="text-red-500" />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name="passwordInput"
//           render={() => (
//             <FormItem>
//               <FormControl>
//                 <PasswordInput control={form.control} name="passwordInput" disabled={isLoading} />
//               </FormControl>
//               <FormMessage className="text-red-500" />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name="confirmPassword"
//           render={() => (
//             <FormItem>
//               <FormControl>
//                 <PasswordInput
//                   control={form.control}
//                   name="confirmPassword"
//                   disabled={isLoading}
//                   placeholder="Confirm Password"
//                 />
//               </FormControl>
//               <FormMessage className="text-red-500" />
//             </FormItem>
//           )}
//         />
//         <Button
//           className="bg-blue-brand text-white font-semibold w-full"
//           type="submit"
//           disabled={isLoading}>
//           {isLoading ? 'Signing up...' : 'Sign up'}
//         </Button>
//         <div className="flex justify-center text-sm">
//           <p>Already have an account? </p>
//           <Link className="ml-1 underline" href={`/${lng}/login`}>
//             Login
//           </Link>
//         </div>
//       </form>
//     </Form>
//   );
// }

'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { toast } from '@/hooks/useToast';
import { axiosInstance } from '@/lib/services/axiosConfig';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FcGoogle } from 'react-icons/fc';
import * as z from 'zod';

const formSchema = z
  .object({
    emailInput: z.string().email('Please enter a valid email'),
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'),
    passwordInput: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine((data) => data.passwordInput === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();
  const router = useRouter();
  const lng = params.lng as string;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailInput: '',
      fullName: '',
      phoneNumber: '',
      passwordInput: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const { data } = await axiosInstance.post('/users/auth/sign-up', {
        email: values.emailInput,
        name: values.fullName,
        phone_number: values.phoneNumber,
        password: values.passwordInput,
      });

      const result = await signIn('credentials', {
        redirect: false,
        email: data.user.email,
        password: values.passwordInput,
        callbackUrl: `/${lng}/profile`,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // ✅ Redirect using Next.js router
      router.push(result?.url || `/${lng}/profile`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error);
      toast({
        title: 'Sign up failed',
        description:
          error.response?.data?.detail ||
          error.message ||
          'Something went wrong during registration.',
        variant: 'destructive',
      });
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
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">Sign up</h2>

        <Button
          type="button"
          variant="default"
          onClick={handleGoogleLogin}
          className="border-1 border-gray-200 w-full flex gap-2 justify-center items-center text-normal"
          disabled={isLoading}>
          <FcGoogle />
          <p>Continue with Google</p>
        </Button>

        <div className="flex items-center justify-center">
          <hr className="w-full border-gray-200" />
          <p className="mx-4 text-gray-500 text-sm">OR</p>
          <hr className="w-full border-gray-200" />
        </div>

        <FormField
          control={form.control}
          name="emailInput"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Email" type="email" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Full Name" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Phone Number" {...field} disabled={isLoading} />
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
                <PasswordInput control={form.control} name="passwordInput" disabled={isLoading} />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={() => (
            <FormItem>
              <FormControl>
                <PasswordInput
                  control={form.control}
                  name="confirmPassword"
                  disabled={isLoading}
                  placeholder="Confirm Password"
                />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <Button
          className="bg-blue-brand text-white font-semibold w-full"
          type="submit"
          disabled={isLoading}>
          {isLoading ? 'Signing up...' : 'Sign up'}
        </Button>

        <div className="flex justify-center text-sm">
          <p>Already have an account?</p>
          <Link className="ml-1 underline" href={`/${lng}/login`}>
            Login
          </Link>
        </div>
      </form>
    </Form>
  );
}
