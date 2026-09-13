export type CategoryResponse = {
  slug: string;
  name: string;
  description: string;
  group: string;
  keywords: string[];
};

export type Address = {
  street?: string;
  number?: string;
  neighborhood?: string;
  postalCode?: string;
};

export type Location = {
  name?: string;
  reference?: string;
  type?: string;
  address?: Address | string;
  coordinates?: [number, number];
  latitude?: number;
  longitude?: number;
};

export type PrepareColabResponse = {
  imageKey: string;
  colabId: string;
  url: string;
};

export type LocationRequest = {
  name: string;
  reference: string;
  street: string;
  number: string;
  neighborhood: string;
  postalCode: string;
  coordinates: [number, number];
};

export type CreateColabRequest = {
  colabId: string;
  title: string;
  description: string;
  categoriesSlugs: string[];
  location: LocationRequest;
  imageKey: string;
};

export type ColabResponse = {
  id: string;
  userId: string;
  username: string;
  title: string;
  description: string;
  categories: CategoryResponse[];
  status: string;
  supportCount: number;
  supportedByMe: boolean;
  location: Location;
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
  distanceMeters?: number | null;
};

export type SupportResponse = {
  supportCount: number;
  supportedByMe: boolean;
};

export type FeedPage = {
  items: ColabResponse[];
  nextPageToken: string | null;
};
