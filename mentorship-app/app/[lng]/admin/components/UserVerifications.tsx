'use client';

import { UserVerification, VerificationStatus } from '@/app/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/useToast';
import { axiosInstance } from '@/lib/services/axiosConfig';
import { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const verificationStatusOptions = [
  { value: 'PD', label: 'Очікує на розгляд' },
  { value: 'AP', label: 'Прийнято' },
  { value: 'DC', label: 'Відхилено' },
];

const servicePriceTypeOptions = [
  { value: 'PH', label: 'За годину' },
  { value: 'PL', label: 'За заняття' },
];

export default function UserVerifications() {
  const [verifications, setVerifications] = useState<UserVerification[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<VerificationStatus | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [selectedVerificationId, setSelectedVerificationId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');
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
        if (error.response?.status === 500) {
          toast({
            title: 'Success',
            description: 'Verification approved successfully',
            variant: 'success',
          });
        } else {
          toast({
            title: 'Error',
            description: error.response?.data.message,
            variant: 'destructive',
          });
        }
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
        { reason: declineReason },
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
      setIsDeclineModalOpen(false);
      setDeclineReason('');
      setSelectedVerificationId(null);
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

  const openDeclineModal = (verificationId: string) => {
    setSelectedVerificationId(verificationId);
    setIsDeclineModalOpen(true);
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchVerifications(selectedStatus === 'ALL' ? undefined : selectedStatus);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus, session?.accessToken]);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Перевірки користувачів</h1>
        <Select
          value={selectedStatus}
          onValueChange={(value) => setSelectedStatus(value as VerificationStatus | 'ALL')}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Фільтр за статусом" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="ALL">Всі статуси</SelectItem>
            {verificationStatusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Dialog open={isDeclineModalOpen} onOpenChange={setIsDeclineModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Відхилення перевірки</DialogTitle>
            <DialogDescription>
              Будь ласка, надайте причину відхилення цього запиту на перевірку.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Введіть причину відхилення..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeclineModalOpen(false);
                setDeclineReason('');
                setSelectedVerificationId(null);
              }}>
              Скасувати
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => selectedVerificationId && handleDecline(selectedVerificationId)}
              disabled={!declineReason.trim()}>
              Відхилити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="rounded-lg border border-gray-300 overflow-x-auto shadow-sm">
        <Table className="min-w-[1200px]">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="text-gray-700 font-semibold">ID верифікації</TableHead>
              <TableHead className="text-gray-700 font-semibold">ID адміністратора</TableHead>
              <TableHead className="text-gray-700 font-semibold">Статус</TableHead>
              <TableHead className="text-gray-700 font-semibold">Дата створення</TableHead>
              <TableHead className="text-gray-700 font-semibold">Дата оновлення</TableHead>
              <TableHead className="text-gray-700 font-semibold">ID користувача</TableHead>
              <TableHead className="text-gray-700 font-semibold">Фото ID</TableHead>
              <TableHead className="text-gray-700 font-semibold">Про мене</TableHead>
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
                  Завантаження...
                </TableCell>
              </TableRow>
            ) : verifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={14} className="text-center py-10">
                  Перевірки не знайдені
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
                    <a
                      href={verification.id_card_photo}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer">
                      <Image
                        src={verification.id_card_photo}
                        alt="ID Card"
                        width={80}
                        height={80}
                        className="rounded-md border hover:opacity-80 transition-opacity"
                      />
                    </a>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {verification.about_me_text}
                  </TableCell>
                  <TableCell>
                    {verification.about_me_video_link ? (
                      <Button
                        variant="outline"
                        onClick={() => window.open(verification.about_me_video_link!, '_blank')}>
                        Переглянути
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
                        Переглянути
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
                        {isLoading ? 'Обробка...' : 'Прийняти'}
                      </Button>
                      <Button
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => openDeclineModal(verification.id)}
                        disabled={verification.status !== 'PD'}>
                        {isLoading ? 'Обробка...' : 'Відхилити'}
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
