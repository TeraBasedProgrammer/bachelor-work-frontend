'use client';

import { useTranslation } from '@/app/i18n/client';
import { ActivityCategory, UserData } from '@/app/types';
import { Button } from '@/components/ui/button';
import { fileInputValidation } from '@/components/ui/file-upload';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { FileInputComponent } from '@/components/ui/image-input/image-input';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import { toast } from '@/hooks/useToast';
import { axiosInstance } from '@/lib/services/axiosConfig';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

interface BasicInfoFormProps {
  activityCategories: ActivityCategory[];
  userData: UserData | null;
  lng: string;
}

const formSchema = (hasExistingImage: boolean) =>
  z.object({
    userAvatarInput: fileInputValidation(
      ['image/png', 'image/jpeg', 'image/webp'],
      hasExistingImage,
    ),
    emailInput: z.string().optional(),
    fullNameInput: z.string().min(1, 'Name is required').optional(),
    phoneNumberInput: z.string().min(1, 'Phone number is required').optional(),
    categoriesInput: z.array(z.string()).min(1, 'At least one category is required'),
  });

type FormValues = z.infer<ReturnType<typeof formSchema>>;

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ activityCategories, userData, lng }) => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(userData);
  const [isLoading, setIsLoading] = useState(false);
  const { data: sessionData, update: updateSession } = useSession();
  const { t } = useTranslation(lng, 'profile');

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
          Authorization: `Bearer ${sessionData?.accessToken}`,
        },
      });

      setCurrentUser(response.data);

      const updatedSession = {
        ...sessionData,
        user: {
          ...sessionData?.user,
          id: response.data.id,
          email: response.data.email,
          phone_number: response.data.phone_number,
          name: response.data.name,
          profile_picture: response.data.profile_picture,
          id_card_photo: response.data.id_card_photo,
          is_verified: response.data.is_verified,
          balance: response.data.balance,
          cv_link: response.data.cv_link,
          about_me_text: response.data.about_me_text,
          about_me_video_link: response.data.about_me_video_link,
          service_price: response.data.service_price,
          service_price_type: response.data.service_price_type,
          longitude: response.data.longitude,
          latitude: response.data.latitude,
          is_admin: response.data.is_admin,
          created_at: response.data.created_at,
          updated_at: response.data.updated_at,
          activity_categories: response.data.activity_categories,
        },
      };

      await updateSession(updatedSession);

      toast({
        title: t('basicInfo.success'),
        variant: 'success',
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({
          title: t('basicInfo.error'),
          description: `${error.response?.data.detail}`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('basicInfo.error'),
          description: `${error}`,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto py-10">
        <h2 className="text-4xl">{t('basicInfo.title')}</h2>

        <FormField
          control={form.control}
          name="userAvatarInput"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('basicInfo.avatar')}</FormLabel>
              <FormControl>
                <div className="flex gap-4 items-center">
                  <Image
                    className="rounded-md"
                    src={
                      currentUser?.profile_picture
                        ? `${currentUser.profile_picture}?v=${new Date().getTime()}`
                        : 'https://github.com/shadcn.png'
                    }
                    alt="User avatar"
                    width={100}
                    height={100}
                  />
                  <FileInputComponent
                    files={field.value ?? []}
                    onChange={field.onChange}
                    maxFiles={1}
                    inputId="fileInput"
                    placeholder={t('mentorInfo.fileInputPlaceholder')}
                    helpText={t('mentorInfo.fileInputHelpText')}
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
              <FormLabel>{t('basicInfo.email')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('basicInfo.emailPlaceholder')}
                  disabled
                  type="email"
                  {...field}
                />
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
              <FormLabel>{t('basicInfo.fullName')}</FormLabel>
              <FormControl>
                <Input placeholder={t('basicInfo.fullNamePlaceholder')} {...field} />
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
              <FormLabel>{t('basicInfo.phone')}</FormLabel>
              <FormControl>
                <Input placeholder={t('basicInfo.phonePlaceholder')} {...field} />
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
              <FormLabel>{t('basicInfo.categories')}</FormLabel>
              <FormControl>
                <MultiSelect
                  options={activityCategories.map((category) => ({
                    label: category.title,
                    value: category.id.toString(),
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t('basicInfo.categoriesPlaceholder')}
                  variant="inverted"
                  animation={2}
                  maxCount={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            className="bg-blue-brand text-white font-semibold"
            disabled={isLoading}>
            {isLoading ? t('basicInfo.saving') : t('basicInfo.save')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BasicInfoForm;
