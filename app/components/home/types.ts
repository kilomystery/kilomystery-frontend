import type { Kg, Tier } from '@/app/config/shopifyProducts';

export type ShowroomVariant = {
  id: string;
  tier: Tier;
  kg: Kg;
  title: string;
  description: string;
  price: number;
  currency: 'EUR';
  available: boolean;
};
