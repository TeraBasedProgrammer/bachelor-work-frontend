import { ActivityCategory, UserData } from '@/app/types';
import { axiosInstance } from '@/lib/services/axiosConfig';
import BasicInfoForm from './BasicInfo';

async function getActivityCategories(): Promise<ActivityCategory[]> {
  try {
    const response = await axiosInstance.get('/activity-categories');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch activity categories:', error);
    return [];
  }
}

async function getUserData(): Promise<UserData | null> {
  try {
    const response = await axiosInstance.get('/users/profile');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    return null;
  }
}

export default async function ProfilePage() {
  const activityCategories = await getActivityCategories();
  const userData = await getUserData();

  return (
    <div className="w-2/3 mx-auto bg-[#f7f7f7] mt-10 rounded-lg p-10">
      <h1 className="mx-auto w-fit text-center text-5xl">User profile</h1>
      <BasicInfoForm activityCategories={activityCategories} userData={userData} />
      <hr className="max-w-3xl mx-auto my-10" />
    </div>
  );
}
