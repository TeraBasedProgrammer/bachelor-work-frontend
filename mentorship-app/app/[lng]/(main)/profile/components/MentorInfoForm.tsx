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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/useToast';
import { axiosInstance } from '@/lib/services/axiosConfig';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

interface MentorInfoFormProps {
  activityCategories: ActivityCategory[];
  userData: UserData | null;
  lng: string;
}

const formSchema = (hasExistingIdCard: boolean, hasExistingCV: boolean) =>
  z.object({
    idCardInput: fileInputValidation(['image/png', 'image/jpeg', 'image/webp'], hasExistingIdCard),
    cvInput: fileInputValidation(['application/pdf'], hasExistingCV),
    aboutMeVideoInput: fileInputValidation(['video/mp4'], true),
    aboutMeText: z.string().min(1, 'About me text is required'),
    servicePrice: z.string().min(1, 'Service price is required'),
    servicePriceType: z.enum(['PH', 'PL']),
    categoriesInput: z.array(z.string()).min(1, 'At least one category is required'),
  });

type FormValues = z.infer<ReturnType<typeof formSchema>>;

const priceTypeOptions = [
  { value: 'PH', label: 'Per Hour' },
  { value: 'PL', label: 'Per Lesson' },
];

const verificationStatusOptions = [
  { value: 'UV', tag: <p className="text-red-500">Unverified</p> },
  { value: 'VR', tag: <p className="text-green-500">Verified</p> },
  { value: 'PD', tag: <p className="text-yellow-600">Pending</p> },
];

const MentorInfoForm: React.FC<MentorInfoFormProps> = ({ activityCategories, userData, lng }) => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(userData);
  const [isLoading, setIsLoading] = useState(false);
  const { data: sessionData, update: updateSession } = useSession();
  const { t } = useTranslation(lng as string, 'profile');
  const form = useForm<FormValues>({
    resolver: zodResolver(
      formSchema(currentUser?.id_card_photo !== null, currentUser?.cv_link !== null),
    ),
    defaultValues: {
      idCardInput: [],
      cvInput: [],
      aboutMeVideoInput: [],
      categoriesInput:
        currentUser?.activity_categories
          .filter((category) => category.type === 'P')
          .map((category) => category.id.toString()) || [],
    },
  });

  useEffect(() => {
    if (currentUser) {
      form.reset({
        aboutMeText: currentUser.about_me_text || '',
        servicePrice: currentUser.service_price?.toString() || '',
        servicePriceType: (currentUser.service_price_type as 'PH' | 'PL') || 'PH',
        categoriesInput: currentUser.activity_categories
          .filter((category) => category.type === 'P')
          .map((category) => category.id.toString()),
      });
    }
  }, [currentUser, form]);

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      const formData = new FormData();

      if (values.idCardInput?.[0]) {
        formData.append('id_card_photo', values.idCardInput[0]);
      }
      if (values.cvInput?.[0]) {
        formData.append('cv_link', values.cvInput[0]);
      }
      if (values.aboutMeVideoInput?.[0]) {
        formData.append('about_me_video_link', values.aboutMeVideoInput[0]);
      }

      formData.append('user_id', currentUser?.id.toString() || '');
      formData.append('about_me_text', values.aboutMeText);
      formData.append('service_price', values.servicePrice);
      formData.append('service_price_type', values.servicePriceType);
      formData.append('activity_categories', JSON.stringify(values.categoriesInput));

      await axiosInstance.post(`/user-verification/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${sessionData?.accessToken}`,
        },
      });

      toast({
        title: 'Awaiting verification',
        description:
          'Your mentor info has been updated successfully. Please wait for verification.\nYou will be notified via email when your mentor info is verified.',
        variant: 'success',
      });

      setCurrentUser({
        ...currentUser!,
        verification_status: 'PD',
      });

      await updateSession({
        ...sessionData,
        user: {
          ...currentUser!,
          verification_status: 'PD',
        },
      });
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
          description: `Failed to update mentor info: ${error}`,
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
        <h2 className="text-4xl">{t('mentorInfo.title')}</h2>

        <div className="flex gap-4 items-center">
          <p className="text-sm text-gray-500">{t('mentorInfo.verificationStatus')}</p>
          {
            verificationStatusOptions.find(
              (option) => option.value === currentUser?.verification_status,
            )?.tag
          }
        </div>

        <FormField
          control={form.control}
          name="idCardInput"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('mentorInfo.idCard')}</FormLabel>
              <FormControl>
                <div className="flex gap-4 items-center">
                  {currentUser?.id_card_photo && (
                    <Image
                      className="rounded-md"
                      src={currentUser.id_card_photo}
                      alt="ID Card"
                      width={100}
                      height={100}
                    />
                  )}
                  <FileInputComponent
                    files={field.value ?? []}
                    onChange={field.onChange}
                    maxFiles={1}
                    inputId="idCardInput"
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
          name="cvInput"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('mentorInfo.cv')}</FormLabel>
              <FormControl>
                <div className="flex gap-4 items-center">
                  {currentUser?.cv_link && (
                    <a
                      href={currentUser.cv_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-brand">
                      {t('mentorInfo.currentCV')}
                    </a>
                  )}
                  <FileInputComponent
                    files={field.value ?? []}
                    onChange={field.onChange}
                    maxFiles={1}
                    inputId="cvInput"
                    accept="application/pdf"
                    placeholder={t('mentorInfo.cvPlaceholder')}
                    helpText={t('mentorInfo.cvHelpText')}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="aboutMeText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('mentorInfo.aboutMe')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('mentorInfo.aboutMePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="aboutMeVideoInput"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('mentorInfo.aboutMeVideo')}</FormLabel>
              <FormControl>
                <div className="flex gap-4 items-center">
                  {currentUser?.about_me_video_link && (
                    <video width="200" controls>
                      <track kind="captions" />
                      <source src={currentUser.about_me_video_link} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                  <FileInputComponent
                    files={field.value ?? []}
                    onChange={field.onChange}
                    maxFiles={1}
                    inputId="aboutMeVideoInput"
                    accept="video/mp4"
                    placeholder={t('mentorInfo.uploadVideo')}
                    helpText={t('mentorInfo.videoHelpText')}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="servicePrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('mentorInfo.servicePrice')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={t('mentorInfo.servicePricePlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="servicePriceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('mentorInfo.priceType')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('mentorInfo.priceTypePlaceholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white">
                  {priceTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(`mentorInfo.${option.label}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoriesInput"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('mentorInfo.categories')}</FormLabel>
              <FormControl>
                <MultiSelect
                  options={activityCategories.map((category) => ({
                    label: category.title,
                    value: category.id.toString(),
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t('mentorInfo.categoriesPlaceholder')}
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
          disabled={currentUser?.verification_status === 'PD' || isLoading}
          className="bg-blue-brand text-white font-semibold">
          {isLoading ? t('mentorInfo.saving') : t('mentorInfo.save')}
        </Button>
      </form>
    </Form>
  );
};

export default MentorInfoForm;
