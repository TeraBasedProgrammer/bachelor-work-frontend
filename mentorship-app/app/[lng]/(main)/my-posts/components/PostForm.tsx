'use client';

import { useTranslation } from '@/app/i18n/client';
import { ActivityCategory, Post } from '@/app/types';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

interface PostFormProps {
  activityCategories: ActivityCategory[];
  post?: Post;
}

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  service_price: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number({ invalid_type_error: 'Price must be a number' }).positive('Price must be positive'),
  ),
  service_type: z.enum(['S', 'P']),
  category_ids: z.array(z.string()).min(1, 'At least one category is required'),
});
type FormValues = z.input<typeof formSchema>;

const serviceTypeOptions = [
  { value: 'S', label: 'Seeking Mentor' },
  { value: 'P', label: 'Offering Mentorship' },
];

export default function PostForm({ activityCategories, post }: PostFormProps) {
  const { data: session } = useSession();
  const lng = useParams().lng;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation(lng as string, 'posts');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post?.title || '',
      description: post?.description || '',
      service_price: post?.service_price ?? 0,
      service_type: post?.service_type || 'S',
      category_ids: post?.categories.map((category) => category.id) || [],
    },
  });
  const onSubmit = async (values: FormValues) => {
    if (!session?.accessToken) return;

    setIsLoading(true);
    try {
      if (post) {
        await axiosInstance.put(
          `/posts/${post.id}`,
          {
            ...values,
            service_price: Number(values.service_price),
          },
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          },
        );

        toast({
          title: 'Success',
          description: 'Post updated successfully',
        });
      } else {
        await axiosInstance.post(
          '/posts/',
          {
            ...values,
            service_price: Number(values.service_price),
          },
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          },
        );

        toast({
          title: 'Success',
          description: 'Post created successfully',
        });
      }

      router.push(`/${lng}/my-posts`);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({
          title: 'Error',
          description: error.response?.data.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: post ? 'Failed to update post' : 'Failed to create post',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('postForm.title')}</FormLabel>
              <FormControl>
                <Input placeholder={t('postForm.titlePlaceholder')} {...field} />
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
              <FormLabel>{t('postForm.description')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('postForm.descriptionPlaceholder')}
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
          name="service_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('postForm.price')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={t('postForm.pricePlaceholder')}
                  {...field}
                  value={field.value?.toString() || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="service_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('postForm.serviceType')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('postForm.selectServiceType')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white">
                  {serviceTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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
          name="category_ids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('postForm.categories')}</FormLabel>
              <FormControl>
                <MultiSelect
                  options={activityCategories.map((category) => ({
                    label: category.title,
                    value: category.id,
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t('postForm.selectCategories')}
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
            type="button"
            variant="secondary"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold"
            onClick={() => router.push(`/${lng}/my-posts`)}>
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-brand hover:bg-blue-brand/90 text-white font-semibold">
            {isLoading ? t('saving') : post ? t('updatePost') : t('createNewPost')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
