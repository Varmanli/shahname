import type { ElementType } from "react";
import {
  GiBloodySword,
  GiBrokenHeart,
  GiBurningDot,
  GiCrown,
  GiDaemonSkull,
  GiDeathSkull,
  GiEvilBat,
  GiFireGem,
  GiFangs,
  GiLaurelCrown,
  GiLion,
  GiMountainCave,
  GiPoisonBottle,
  GiRoyalLove,
  GiScales,
  GiSharpSmile,
  GiShield,
  GiSnake,
  GiSpellBook,
  GiSpikedDragonHead,
  GiStarFormation,
  GiSun,
  GiSwordClash,
  GiWingedSword,
} from "react-icons/gi";

export type TraitKey =
  | "wise"
  | "brave"
  | "king"
  | "warrior"
  | "powerful"
  | "divine"
  | "magical"
  | "demon_binder"
  | "demon_slayer"
  | "just"
  | "heroic"
  | "mythic"
  | "tragic"
  | "royal"
  | "immortal_fame"
  | "evil"
  | "tyrant"
  | "cruel"
  | "deceiver"
  | "cursed"
  | "demonic"
  | "corrupted"
  | "serpent_mark"
  | "bloodthirsty";

export type TraitTone = "gold" | "lapis" | "red" | "emerald" | "violet";
export type TraitCategory = "positive" | "negative" | "neutral";
export type TraitLevel = 1 | 2 | 3 | 4 | 5;

export type TraitPreset = {
  key: TraitKey;
  label: string;
  description: string;
  icon: ElementType;
  tone: TraitTone;
  category: TraitCategory;
};

export type CharacterTrait = {
  key: TraitKey;
  level: TraitLevel;
  featured?: boolean;
};

export const TRAIT_PRESETS: TraitPreset[] = [
  {
    key: "wise",
    label: "خردمند",
    description: "دارای خرد، بینش و رای روشن",
    icon: GiSpellBook,
    tone: "lapis",
    category: "positive",
  },
  {
    key: "brave",
    label: "دلیر",
    description: "بی‌باک در میدان نبرد و تصمیم‌های دشوار",
    icon: GiShield,
    tone: "gold",
    category: "positive",
  },
  {
    key: "king",
    label: "پادشاه",
    description: "فرمانروا، صاحب تخت و آیین پادشاهی",
    icon: GiCrown,
    tone: "gold",
    category: "positive",
  },
  {
    key: "warrior",
    label: "جنگجو",
    description: "آزموده در نبرد، سلاح و پیکار",
    icon: GiSwordClash,
    tone: "red",
    category: "positive",
  },
  {
    key: "powerful",
    label: "نیرومند",
    description: "دارای نیروی بدنی یا هیبت پهلوانی",
    icon: GiLion,
    tone: "gold",
    category: "positive",
  },
  {
    key: "divine",
    label: "فرهمند",
    description: "دارای فره و شکوه ایزدی",
    icon: GiFireGem,
    tone: "gold",
    category: "positive",
  },
  {
    key: "magical",
    label: "جادوآشنا",
    description: "آشنا با نیروهای رازآلود و آیین‌های نهانی",
    icon: GiWingedSword,
    tone: "violet",
    category: "neutral",
  },
  {
    key: "demon_binder",
    label: "دیوبند",
    description: "چیره بر دیوان و بندکننده نیروهای اهریمنی",
    icon: GiMountainCave,
    tone: "violet",
    category: "positive",
  },
  {
    key: "demon_slayer",
    label: "دیوکش",
    description: "نبردکننده و نابودگر دیوان",
    icon: GiSpikedDragonHead,
    tone: "red",
    category: "positive",
  },
  {
    key: "just",
    label: "دادگر",
    description: "پایبند به داد، آیین و راستی",
    icon: GiScales,
    tone: "emerald",
    category: "positive",
  },
  {
    key: "heroic",
    label: "پهلوان",
    description: "نامدار در پهلوانی، رزم و بزرگی",
    icon: GiLaurelCrown,
    tone: "gold",
    category: "positive",
  },
  {
    key: "mythic",
    label: "اسطوره‌ای",
    description: "آمیخته با شگفتی، رمز و روایت‌های کهن",
    icon: GiStarFormation,
    tone: "lapis",
    category: "neutral",
  },
  {
    key: "tragic",
    label: "تراژیک",
    description: "سرنوشتی تلخ، اندوهناک یا عبرت‌آموز",
    icon: GiBrokenHeart,
    tone: "red",
    category: "neutral",
  },
  {
    key: "royal",
    label: "شاهانه",
    description: "دارای شکوه، نژاد یا منش شاهی",
    icon: GiRoyalLove,
    tone: "gold",
    category: "positive",
  },
  {
    key: "immortal_fame",
    label: "جاودان‌نام",
    description: "نامی ماندگار در روایت‌ها و حافظه شاهنامه",
    icon: GiSun,
    tone: "gold",
    category: "positive",
  },
  {
    key: "evil",
    label: "اهریمنی",
    description: "دارای سرشتی تاریک و شرارت‌آمیز",
    icon: GiEvilBat,
    tone: "red",
    category: "negative",
  },
  {
    key: "tyrant",
    label: "ستمگر",
    description: "فرمانروایی همراه با ظلم و بی‌رحمی",
    icon: GiBloodySword,
    tone: "red",
    category: "negative",
  },
  {
    key: "cruel",
    label: "بی‌رحم",
    description: "فاقد شفقت و مروت در رفتار",
    icon: GiFangs,
    tone: "red",
    category: "negative",
  },
  {
    key: "deceiver",
    label: "فریبکار",
    description: "متوسل به نیرنگ و حیله",
    icon: GiSharpSmile,
    tone: "violet",
    category: "negative",
  },
  {
    key: "cursed",
    label: "نفرین‌شده",
    description: "دارای سرنوشت شوم یا نفرین الهی",
    icon: GiDeathSkull,
    tone: "violet",
    category: "negative",
  },
  {
    key: "demonic",
    label: "دیوگونه",
    description: "ماهیتی نزدیک به دیوان و نیروهای تاریک",
    icon: GiDaemonSkull,
    tone: "red",
    category: "negative",
  },
  {
    key: "corrupted",
    label: "فاسد",
    description: "آلوده به قدرت، طمع یا شرارت",
    icon: GiPoisonBottle,
    tone: "violet",
    category: "negative",
  },
  {
    key: "serpent_mark",
    label: "نشان مار",
    description: "نماد ضحاک؛ وابسته به شر و خون",
    icon: GiSnake,
    tone: "red",
    category: "negative",
  },
  {
    key: "bloodthirsty",
    label: "خون‌ریز",
    description: "تمایل شدید به کشتار و خون‌ریزی",
    icon: GiBurningDot,
    tone: "red",
    category: "negative",
  },
];

export function getTraitPreset(key: TraitKey) {
  return TRAIT_PRESETS.find((trait) => trait.key === key) ?? null;
}

function isTraitKey(value: unknown): value is TraitKey {
  return (
    typeof value === "string" &&
    TRAIT_PRESETS.some((trait) => trait.key === value)
  );
}

function normalizeTraitLevel(value: unknown): TraitLevel {
  return typeof value === "number" && value >= 1 && value <= 5
    ? (Math.trunc(value) as TraitLevel)
    : 3;
}

export function normalizeCharacterTraits(traits: unknown): CharacterTrait[] {
  if (!Array.isArray(traits)) return [];

  const normalized = traits.map((trait): CharacterTrait | null => {
    if (typeof trait === "string") {
      const preset =
        TRAIT_PRESETS.find((item) => item.key === trait) ??
        TRAIT_PRESETS.find((item) => item.label === trait);

      if (!preset) return null;

      return {
        key: preset.key,
        level: 3,
        featured: false,
      } satisfies CharacterTrait;
    }

    if (trait && typeof trait === "object" && "key" in trait) {
      const item = trait as {
        key?: unknown;
        level?: unknown;
        featured?: unknown;
      };

      if (!isTraitKey(item.key)) return null;

      return {
        key: item.key,
        level: normalizeTraitLevel(item.level),
        featured: Boolean(item.featured),
      } satisfies CharacterTrait;
    }

    return null;
  });

  return normalized.filter((trait): trait is CharacterTrait => trait !== null);
}
