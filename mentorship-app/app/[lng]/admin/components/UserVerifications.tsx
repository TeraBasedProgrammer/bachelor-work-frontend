'use client';

import { UserVerification, VerificationStatus } from '@/app/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/useToast';
import { axiosInstance } from '@/lib/services/axiosConfig';
import { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const verificationStatusOptions = [
  { value: 'PD', label: 'Pending' },
  { value: 'AP', label: 'Approved' },
  { value: 'DC', label: 'Declined' },
];

const servicePriceTypeOptions = [
  { value: 'PH', label: 'Per Hour' },
  { value: 'PL', label: 'Per Lesson' },
];

export default function UserVerifications() {
  const [verifications, setVerifications] = useState<UserVerification[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<VerificationStatus | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  const fetchVerifications = async (status?: VerificationStatus) => {
    if (!session?.accessToken) return;

    try {
      setIsLoading(true);
      const response = await axiosInstance.get(
        `/user-verification/${status ? `?status=${status}` : ''}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        },
      );
      setVerifications(response.data);
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
          description: 'Failed to fetch verifications',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (verificationId: string) => {
    if (!session?.accessToken) return;

    try {
      await axiosInstance.post(
        `/user-verification/${verificationId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        },
      );
      toast({
        title: 'Success',
        description: 'Verification approved successfully',
        variant: 'success',
      });
      fetchVerifications(selectedStatus === 'ALL' ? undefined : selectedStatus);
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
          description: 'Failed to approve verification',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDecline = async (verificationId: string) => {
    if (!session?.accessToken) return;

    try {
      await axiosInstance.post(
        `/user-verification/${verificationId}/decline`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        },
      );
      toast({
        title: 'Success',
        description: 'Verification declined successfully',
        variant: 'success',
      });
      fetchVerifications(selectedStatus === 'ALL' ? undefined : selectedStatus);
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
          description: 'Failed to decline verification',
          variant: 'destructive',
        });
      }
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchVerifications(selectedStatus === 'ALL' ? undefined : selectedStatus);
    }
  }, [selectedStatus, session?.accessToken]);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">User Verifications</h1>
        <Select
          value={selectedStatus}
          onValueChange={(value) => setSelectedStatus(value as VerificationStatus | 'ALL')}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="ALL">All Statuses</SelectItem>
            {verificationStatusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-gray-300 overflow-x-auto shadow-sm">
        <Table className="min-w-[1200px]">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="text-gray-700 font-semibold">Verification ID</TableHead>
              <TableHead className="text-gray-700 font-semibold">Admin ID</TableHead>
              <TableHead className="text-gray-700 font-semibold">Status</TableHead>
              <TableHead className="text-gray-700 font-semibold">Created At</TableHead>
              <TableHead className="text-gray-700 font-semibold">Updated At</TableHead>
              <TableHead className="text-gray-700 font-semibold">User ID</TableHead>
              <TableHead className="text-gray-700 font-semibold">ID Card Photo</TableHead>
              <TableHead className="text-gray-700 font-semibold">About Me</TableHead>
              <TableHead className="text-gray-700 font-semibold">Video</TableHead>
              <TableHead className="text-gray-700 font-semibold">CV</TableHead>
              <TableHead className="text-gray-700 font-semibold">Service Price</TableHead>
              <TableHead className="text-gray-700 font-semibold">Price Type</TableHead>
              <TableHead className="text-gray-700 font-semibold">Categories</TableHead>
              <TableHead className="text-gray-700 font-semibold text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={14} className="text-center py-10">
                  Loading...
                </TableCell>
              </TableRow>
            ) : verifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={14} className="text-center py-10">
                  No verifications found
                </TableCell>
              </TableRow>
            ) : (
              verifications.map((verification) => (
                <TableRow key={verification.id} className="hover:bg-gray-50">
                  <TableCell>{verification.id}</TableCell>
                  <TableCell>{verification.admin_id || '-'}</TableCell>
                  <TableCell className="capitalize">
                    {
                      verificationStatusOptions.find((opt) => opt.value === verification.status)
                        ?.label
                    }
                  </TableCell>
                  <TableCell>{new Date(verification.created_at).toLocaleString()}</TableCell>
                  <TableCell>{new Date(verification.updated_at).toLocaleString()}</TableCell>
                  <TableCell>{verification.user_id}</TableCell>
                  <TableCell>
                    <Image
                      src={verification.id_card_photo}
                      alt="ID Card"
                      width={80}
                      height={80}
                      className="rounded-md border"
                    />
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {verification.about_me_text}
                  </TableCell>
                  <TableCell>
                    {verification.about_me_video_link ? (
                      <Button
                        variant="outline"
                        onClick={() => window.open(verification.about_me_video_link!, '_blank')}>
                        View
                      </Button>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {verification.cv_link ? (
                      <Button
                        variant="outline"
                        onClick={() => window.open(verification.cv_link, '_blank')}>
                        View
                      </Button>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{verification.service_price} $</TableCell>
                  <TableCell>
                    {
                      servicePriceTypeOptions.find(
                        (opt) => opt.value === verification.service_price_type,
                      )?.label
                    }
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {verification.activity_categories.join(', ')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(verification.id)}
                        disabled={verification.status !== 'PD'}>
                        {isLoading ? 'Approving...' : 'Approve'}
                      </Button>
                      <Button
                        className="bg-red-600 hover:bg-red-700"
                        variant="destructive"
                        onClick={() => handleDecline(verification.id)}
                        disabled={verification.status !== 'PD'}>
                        {isLoading ? 'Declining...' : 'Decline'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
