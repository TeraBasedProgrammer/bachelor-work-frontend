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
  verification_status: 'UV' | 'VR' | 'PD';
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

export type VerificationStatus = 'PD' | 'AP' | 'DC';
export type ServicePriceType = 'PH' | 'PL';

export interface UserVerification {
  id: string;
  admin_id: string | null;
  status: VerificationStatus;
  created_at: string;
  updated_at: string;
  user_id: string;
  id_card_photo: string;
  about_me_text: string;
  about_me_video_link: string | null;
  cv_link: string;
  service_price: number;
  service_price_type: ServicePriceType;
  activity_categories: string[];
}
