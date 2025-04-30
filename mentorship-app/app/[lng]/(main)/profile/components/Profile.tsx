'use client';

import { ActivityCategory, UserData } from '@/app/types';
import { axiosInstance } from '@/lib/services/axiosConfig';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import BalanceInfo from './BalanceInfo';
import BasicInfoForm from './BasicInfo';
import { ChangePasswordForm } from './ChangePassword';
import MentorInfoForm from './MentorInfoForm';

async function getActivityCategories(accessToken: string): Promise<ActivityCategory[]> {
  try {
    const response = await axiosInstance.get('/activity-categories', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch activity categories:', error);
    return [];
  }
}

async function getUserProfile(accessToken: string): Promise<UserData | null> {
  try {
    const response = await axiosInstance.get('/users/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    return null;
  }
}

export default function Profile() {
  const { data: session, update: updateSession } = useSession();
  const [activityCategories, setActivityCategories] = useState<ActivityCategory[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchDataAndUpdateSession = async () => {
      if (!session?.accessToken) return;

      const [categories, user] = await Promise.all([
        getActivityCategories(session.accessToken),
        getUserProfile(session.accessToken),
      ]);

      setActivityCategories(categories);
      setUserData(user);
      if (
        user &&
        (user.balance !== session.user.balance ||
          user.name !== session.user.name ||
          user.phone_number !== session.user.phone_number ||
          user.profile_picture !== session.user.profile_picture ||
          user.id_card_photo !== session.user.id_card_photo ||
          user.verification_status !== session.user.verification_status ||
          user.cv_link !== session.user.cv_link ||
          user.about_me_text !== session.user.about_me_text ||
          user.about_me_video_link !== session.user.about_me_video_link ||
          user.service_price !== session.user.service_price ||
          user.service_price_type !== session.user.service_price_type ||
          user.longitude !== session.user.longitude ||
          user.latitude !== session.user.latitude ||
          user.is_admin !== session.user.is_admin ||
          JSON.stringify(user.activity_categories) !==
            JSON.stringify(session.user.activity_categories))
      ) {
        await updateSession({
          ...session,
          user,
        });
      }
    };

    fetchDataAndUpdateSession();
  }, [session?.accessToken]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="bg-white shadow-lg rounded-lg p-10 space-y-10">
        <h1 className="text-center text-4xl font-extrabold text-gray-800">User Profile</h1>

        {!userData ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" />
          </div>
        ) : (
          <>
            <section className="space-y-6">
              <BasicInfoForm activityCategories={activityCategories} userData={userData} />
            </section>

            <div className="border-t border-gray-300 my-8" />

            <section className="space-y-6">
              <MentorInfoForm activityCategories={activityCategories} userData={userData} />
            </section>

            <div className="border-t border-gray-300 my-8" />

            <section className="space-y-6">
              <ChangePasswordForm />
            </section>

            <div className="border-t border-gray-300 my-8" />

            <section className="space-y-6">
              <BalanceInfo userData={userData} />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
