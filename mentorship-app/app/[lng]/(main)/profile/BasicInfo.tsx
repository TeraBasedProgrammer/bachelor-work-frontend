'use client';

import { ActivityCategory, ActivityCategoryUser, UserData } from '@/app/types';
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
import { zodResolver } from '@hookform/resolvers/zod';
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
    fullNameInput: z.string().min(1).optional(),
    phoneNumberInput: z.string().min(1).optional(),
    categoriesInput: z.array(z.string()).optional(),
  });

type FormValues = z.infer<ReturnType<typeof formSchema>>;

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ activityCategories, userData }) => {
  const [selectedCategories, setSelectedCategories] = useState<ActivityCategoryUser[]>(
    userData?.activity_categories.filter((category) => category.type === 'S') ?? [],
  );
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema(userData?.profile_picture !== null)),
    defaultValues: {
      userAvatarInput: [],
    },
  });

  useEffect(() => {
    if (userData) {
      form.reset({
        emailInput: userData.email,
        fullNameInput: userData.name,
        phoneNumberInput: userData.phone_number,
        categoriesInput: [],
      });
    }
  }, [userData, form]);

  function onSubmit(values: z.infer<ReturnType<typeof formSchema>>) {
    console.log(values);
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
                    src="https://github.com/shadcn.png"
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
                <Input placeholder="Enter you email" disabled type="email" {...field} />
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
                <Input placeholder="Enter your name" type="" {...field} />
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
                <Input placeholder="Enter phone number" type="" {...field} />
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
                  onValueChange={(value) => {
                    setSelectedCategories(
                      value
                        .map((id) => activityCategories.find((category) => category.id === id))
                        .filter(
                          (category): category is ActivityCategoryUser => category !== undefined,
                        ),
                    );
                  }}
                  defaultValue={selectedCategories.map((category) => category.title)}
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

        <Button type="submit" className="bg-blue-brand text-white font-semibold">
          Update
        </Button>
      </form>
    </Form>
  );
};

export default BasicInfoForm;
