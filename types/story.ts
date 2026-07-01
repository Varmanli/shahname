export type StorySection = {
  id: string;
  title: string;
  content: string;
  image?: string;
};

export type StoryCharacterReference = {
  name: string;
  slug: string;
};

export type StoryScene = {
  id: string;
  image: string;
  title?: string;
};

export type Story = {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  shortDescription: string;
  content: string;
  sections: StorySection[];
  characters: StoryCharacterReference[];
  coverImage: string;
  scenes: StoryScene[];
  quote: string;
  order: number;
  readingTimeMinutes?: number;
  createdAt: string;
  updatedAt: string;
};

export type StoryInput = Omit<Story, "id" | "createdAt" | "updatedAt">;
