export type HomeHeroContentPosition = "left" | "right";

export type HomeHeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  primaryButtonLabel: string;
  primaryButtonHref: string;
  secondaryButtonLabel: string;
  secondaryButtonHref: string;
  contentPosition: HomeHeroContentPosition;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type HomeHeroSlideInput = Omit<
  HomeHeroSlide,
  "id" | "createdAt" | "updatedAt"
>;
