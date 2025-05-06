'use client';

import { Post } from '@/app/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/useToast';
import { axiosInstance } from '@/lib/services/axiosConfig';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

interface PaginatedResponse {
  items: Post[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

const filterSchema = z.object({
  title: z.string().optional(),
  min_price: z.string().optional(),
  max_price: z.string().optional(),
  service_type: z.enum(['ALL', 'S', 'P']).optional(),
  sort_field: z.enum(['created_at', 'service_price', 'number_of_views', 'title']),
  sort_order: z.enum(['asc', 'desc']),
});

type FilterValues = z.infer<typeof filterSchema>;

const serviceTypeOptions = [
  { value: 'ALL', label: 'All Types' },
  { value: 'S', label: 'Seeking Mentor' },
  { value: 'P', label: 'Offering Mentorship' },
];

const sortFieldOptions = [
  { value: 'created_at', label: 'Date' },
  { value: 'service_price', label: 'Price' },
  { value: 'number_of_views', label: 'Views' },
  { value: 'title', label: 'Title' },
];

export default function Home() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const lng = useParams().lng;

  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      title: '',
      min_price: '',
      max_price: '',
      service_type: 'ALL',
      sort_field: 'created_at',
      sort_order: 'desc',
    },
  });

  const fetchPosts = async (page: number, filters: FilterValues) => {
    if (!session?.accessToken) return;

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: '9',
        sort_field: filters.sort_field,
        sort_order: filters.sort_order,
      });

      if (filters.title) queryParams.append('title', filters.title);
      if (filters.min_price) queryParams.append('min_price', filters.min_price);
      if (filters.max_price) queryParams.append('max_price', filters.max_price);
      if (filters.service_type && filters.service_type !== 'ALL')
        queryParams.append('service_type', filters.service_type);

      const response = await axiosInstance.get<PaginatedResponse>(`/posts/?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      setPosts(response.data.items);
      setTotalPages(response.data.total_pages);
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
          description: 'Failed to fetch posts',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (values: FilterValues) => {
    setCurrentPage(1);
    fetchPosts(1, values);
  };

  useEffect(() => {
    fetchPosts(currentPage, form.getValues());
  }, [currentPage, session?.accessToken]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Search by title" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Price</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Min price" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Price</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Max price" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="service_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {serviceTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sort_field"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort By</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sortFieldOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sort_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sort order" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button className="bg-blue-brand text-white font-semibold" type="submit">
                Apply Filters
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <Link href={`/${lng}/posts/${post.id}`}>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Image
                    src={post.user.profile_picture || 'https://github.com/shadcn.png'}
                    alt={`${post.user.name}'s avatar`}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold">{post.user.name}</h3>
                    <p className="text-sm text-gray-500">
                      {format(new Date(post.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>

                <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2">{post.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      ${post.service_price}{' '}
                      <span className="text-gray-500">
                        {post.service_type === 'P' ? 'Offering' : 'Seeking'}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{post.number_of_views} views</span>
                  </div>
                </div>

                {post.categories.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.categories.map((category) => (
                      <span
                        key={category.id}
                        className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {category.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <Button
            className="bg-blue-brand text-white font-semibold"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}>
            Previous
          </Button>
          <Button
            className="bg-blue-brand text-white font-semibold"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
