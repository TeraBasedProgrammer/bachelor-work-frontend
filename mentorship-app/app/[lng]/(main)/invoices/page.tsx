'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/useToast';
import { axiosInstance } from '@/lib/services/axiosConfig';
import { AxiosError } from 'axios';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { PiCoinVerticalFill } from 'react-icons/pi';

interface Invoice {
  id: string;
  amount: number;
  description: string;
  status: 'P' | 'A' | 'C';
  due_date: Date;
  created_at: Date;
  conversation_id: string;
  mentor_id: string;
  mentee_id: string;
  cancellation_reason?: string;
}

interface UserDetails {
  id: string;
  name: string;
}

export default function InvoicesPage() {
  const { data: session } = useSession();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [userDetails, setUserDetails] = useState<Record<string, UserDetails>>({});
  console.log(invoices.map((invoice) => invoice.status));

  const fetchUserDetails = async (userId: string) => {
    if (!session?.accessToken || userDetails[userId]) return;

    try {
      const response = await axiosInstance.get(`/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      setUserDetails((prev) => ({
        ...prev,
        [userId]: {
          id: response.data.id,
          name: response.data.name,
        },
      }));
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    }
  };

  const fetchInvoices = async () => {
    if (!session?.accessToken) return;

    try {
      const response = await axiosInstance.get(`/invoices/mentor/${session.user.id}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      setInvoices(response.data);

      // Fetch user details for all unique users in the invoices
      const uniqueUserIds = new Set([
        ...response.data.map((invoice: Invoice) => invoice.mentor_id),
        ...response.data.map((invoice: Invoice) => invoice.mentee_id),
      ]);

      await Promise.all(Array.from(uniqueUserIds).map(fetchUserDetails));
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
          description: 'Failed to fetch invoices',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateInvoiceStatus = async (invoiceId: string, status: 'A' | 'C', reason?: string) => {
    if (!session?.accessToken) return;

    try {
      await axiosInstance.patch(
        `/invoices/${invoiceId}`,
        { status, cancellation_reason: reason },
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        },
      );

      toast({
        title: 'Success',
        description: 'Invoice status updated successfully',
      });

      fetchInvoices();
      setIsCancelDialogOpen(false);
      setCancellationReason('');
      setSelectedInvoiceId(null);
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
          description: 'Failed to update invoice status',
          variant: 'destructive',
        });
      }
    }
  };

  const handleCancelClick = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setIsCancelDialogOpen(true);
  };

  const handleCancelConfirm = () => {
    if (selectedInvoiceId) {
      updateInvoiceStatus(selectedInvoiceId, 'C', cancellationReason);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [session?.accessToken]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-brand" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">My Invoices</h1>
      <div className="space-y-4">
        {invoices.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No invoices found</p>
        ) : (
          invoices.map((invoice) => {
            const isMentee = session?.user?.id === invoice.mentee_id;
            const otherUserId = isMentee ? invoice.mentor_id : invoice.mentee_id;
            const otherUserName = userDetails[otherUserId]?.name || 'Loading...';

            return (
              <Card key={invoice.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-semibold">
                        {isMentee ? 'From' : 'To'}: {otherUserName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Due: {format(new Date(invoice.due_date), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      <PiCoinVerticalFill className="w-5 h-5 text-yellow-500 inline-block" />
                      {invoice.amount}
                    </p>
                    <p
                      className={`text-sm ${
                        invoice.status === 'A'
                          ? 'text-green-600'
                          : invoice.status === 'C'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}>
                      {invoice.status === 'A'
                        ? 'Paid'
                        : invoice.status === 'C'
                        ? 'Cancelled'
                        : 'Pending'}
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{invoice.description}</p>

                {invoice.status === 'P' && (
                  <div className="flex justify-end gap-2">
                    {isMentee ? (
                      <>
                        <Button
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleCancelClick(invoice.id)}>
                          Cancel
                        </Button>
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => updateInvoiceStatus(invoice.id, 'A')}>
                          Mark as Paid
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleCancelClick(invoice.id)}>
                          Cancel Invoice
                        </Button>
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => updateInvoiceStatus(invoice.id, 'A')}>
                          Mark as Paid
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {invoice.status === 'C' && invoice.cancellation_reason && (
                  <div className="mt-4 p-3 bg-red-50 rounded-md">
                    <p className="text-sm text-red-600">
                      <span className="font-semibold">Cancellation Reason:</span>{' '}
                      {invoice.cancellation_reason}
                    </p>
                  </div>
                )}

                <div className="mt-4 text-sm text-gray-500">
                  Created: {format(new Date(invoice.created_at), 'MMM d, yyyy')}
                </div>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Invoice</DialogTitle>
            <DialogDescription>
              Please provide a reason for canceling this invoice.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Cancellation Reason</Label>
              <Input
                id="reason"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Enter reason for cancellation"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={!cancellationReason.trim()}>
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
