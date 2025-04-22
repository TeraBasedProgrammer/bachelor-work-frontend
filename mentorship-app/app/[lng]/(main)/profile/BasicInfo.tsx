'use client';

import { ActivityCategory, UserData } from '@/app/types';
import { Button } from '@/components/ui/button';
import { imageInputValidation } from '@/components/ui/file-upload';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ImageInput } from '@/components/ui/image-input/image-input';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import { toast } from '@/hooks/useToast';
import { axiosInstance } from '@/lib/services/axiosConfig';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

interface BasicInfoFormProps {
  activityCategories: ActivityCategory[];
  userData: UserData | null;
}

const formSchema = (hasExistingImage: boolean) =>
  z.object({
    userAvatarInput: imageInputValidation(hasExistingImage),
    emailInput: z.string().optional(),
    fullNameInput: z.string().min(1, 'Name is required').optional(),
    phoneNumberInput: z.string().min(1, 'Phone number is required').optional(),
    categoriesInput: z.array(z.string()).min(1, 'At least one category is required'),
  });

type FormValues = z.infer<ReturnType<typeof formSchema>>;

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ activityCategories, userData }) => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(userData);
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema(currentUser?.profile_picture !== null)),
    defaultValues: {
      userAvatarInput: [],
      categoriesInput:
        currentUser?.activity_categories
          .filter((category) => category.type === 'S')
          .map((category) => category.id.toString()) || [],
    },
  });

  useEffect(() => {
    if (currentUser) {
      form.reset({
        emailInput: currentUser.email,
        fullNameInput: currentUser.name,
        phoneNumberInput: currentUser.phone_number,
        categoriesInput: currentUser.activity_categories
          .filter((category) => category.type === 'S')
          .map((category) => category.id.toString()),
      });
    }
  }, [currentUser, form]);

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      const formData = new FormData();

      // Add file if present
      if (values.userAvatarInput?.[0]) {
        formData.append('profile_picture', values.userAvatarInput[0]);
      }

      // Add other fields
      formData.append('name', values.fullNameInput || '');
      formData.append('phone_number', values.phoneNumberInput || '');
      formData.append('activity_categories', JSON.stringify(values.categoriesInput));

      const response = await axiosInstance.patch(`/users/${currentUser?.id}/update`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${session?.data?.accessToken}`,
        },
      });

      setCurrentUser(response.data);

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update profile: ${error}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto py-10">
        <h2 className="text-4xl">Basic info</h2>

        <FormField
          control={form.control}
          name="userAvatarInput"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover image</FormLabel>
              <FormControl>
                <div className="flex gap-4 items-center">
                  <Image
                    className="rounded-md"
                    src={currentUser?.profile_picture || 'https://github.com/shadcn.png'}
                    alt="User avatar"
                    width={100}
                    height={100}
                  />
                  <ImageInput
                    files={field.value ?? []}
                    onChange={field.onChange}
                    maxFiles={1}
                    inputId="fileInput"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="emailInput"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" disabled type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fullNameInput"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumberInput"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone number</FormLabel>
              <FormControl>
                <Input placeholder="Enter phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoriesInput"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categories</FormLabel>
              <FormControl>
                <MultiSelect
                  options={activityCategories.map((category) => ({
                    label: category.title,
                    value: category.id.toString(),
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select categories"
                  variant="inverted"
                  animation={2}
                  maxCount={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="bg-blue-brand text-white font-semibold"
          disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update'}
        </Button>
      </form>
    </Form>
  );
};

export default BasicInfoForm;
