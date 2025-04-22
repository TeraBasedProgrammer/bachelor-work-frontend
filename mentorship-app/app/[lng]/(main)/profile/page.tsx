import { ActivityCategory, UserData } from '@/app/types';
import { auth } from '@/auth';
import { axiosInstance } from '@/lib/services/axiosConfig';
import BasicInfoForm from './BasicInfo';

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

async function getUserData(accessToken: string): Promise<UserData | null> {
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

export default async function ProfilePage() {
  const session = await auth();
  const activityCategories = await getActivityCategories(session?.accessToken ?? '');
  const userData = await getUserData(session?.accessToken ?? '');

  return (
    <div className="w-2/3 mx-auto bg-[#f7f7f7] mt-10 rounded-lg p-10">
      <h1 className="mx-auto w-fit text-center text-5xl">User profile</h1>
      <BasicInfoForm activityCategories={activityCategories} userData={userData} />
      <hr className="max-w-3xl mx-auto my-10" />
    </div>
  );
}
