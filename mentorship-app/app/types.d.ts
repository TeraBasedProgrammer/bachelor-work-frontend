export interface IconProps {
  width: string;
  height: string;
  fill?: string;
}

export interface ActivityCategory {
  id: string;
  title: string;
}

export interface ActivityCategoryUser {
  id: string;
  title: string;
  type: string;
}

export interface UserData {
  id: string;
  email: string;
  phone_number: string;
  name: string;
  profile_picture: string | null;
  id_card_photo: string | null;
  is_verified: boolean;
  balance: number;
  cv_link: string | null;
  about_me_text: string | null;
  about_me_video_link: string | null;
  service_price: number;
  service_price_type: string;
  longitude: string;
  latitude: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  activity_categories: ActivityCategoryUser[];
}
