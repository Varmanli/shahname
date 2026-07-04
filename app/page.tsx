import { CharactersSection } from "@/components/characters-section";
import { HeroSection } from "@/components/hero-section";
import { HomeHeroSlider } from "@/components/home-hero-slider";
import { SiteLayout } from "@/components/site-layout";
import { StoriesSection } from "@/components/stories-section";
import { readCharacters } from "@/lib/character-store";
import { readActiveHomeHeroSlides } from "@/lib/home-hero-slides-store";
import { readSiteSettings } from "@/lib/site-settings-store";
import { readStories } from "@/lib/story-store";

export const dynamic = "force-dynamic";

function selectFeaturedItems<T extends { id: string }>(items: T[], selectedIds: string[]) {
  if (!selectedIds.length) return items;

  const itemsById = new Map(items.map((item) => [item.id, item]));
  const selectedItems = selectedIds
    .map((id) => itemsById.get(id))
    .filter((item): item is T => Boolean(item));

  return selectedItems.length ? selectedItems : items;
}

export default async function Home() {
  const [characters, stories, settings, heroSlides] = await Promise.all([
    readCharacters(),
    readStories(),
    readSiteSettings(),
    readActiveHomeHeroSlides(),
  ]);
  const featuredCharacters = selectFeaturedItems(
    characters,
    settings.homeCharacterIds,
  );
  const featuredStories = selectFeaturedItems(stories, settings.homeStoryIds);

  return (
    <SiteLayout>
      <main className="w-full">
        {heroSlides.length ? <HomeHeroSlider slides={heroSlides} /> : <HeroSection />}
      </main>

      <CharactersSection
        characters={featuredCharacters}
        limit={6}
        totalCount={characters.length}
        viewAllHref="/characters"
      />
      <StoriesSection stories={featuredStories} />
    </SiteLayout>
  );
}
