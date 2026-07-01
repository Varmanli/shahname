import type { CharacterTrait } from "@/lib/traits";

export type CharacterRelationType =
  | "father"
  | "mother"
  | "child"
  | "spouse"
  | "sibling"
  | "ancestor"
  | "descendant";

export type CharacterRelation = {
  id: string;
  sourceCharacterId: string;
  targetCharacterId: string;
  type: CharacterRelationType;
  note?: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
};

export type CharacterSummary = {
  id: string;
  name: string;
  slug: string;
  avatar: string;
  shortTitle: string;
  dynasty: string;
  fatherId?: string;
  motherId?: string;
  role: string;
  visualRole?: CharacterVisualRole;
  tags: string[];
  shortDescription: string;
};

export type CharacterVisualRole =
  | "king"
  | "queen"
  | "hero"
  | "sage"
  | "royal-family"
  | "notable";

export type CharacterFamilyRelations = {
  father?: CharacterSummary;
  mother?: CharacterSummary;
  spouses: CharacterSummary[];
  children: CharacterSummary[];
  siblings: CharacterSummary[];
  directLineage: CharacterSummary[];
};

export type Character = {
  id: string;
  name: string;
  slug: string;
  title: string;
  epithets: string[];
  role: string;
  visualRole?: CharacterVisualRole;
  nationality: string;
  nameMeaning: string;
  father?: string;
  mother?: string;
  fatherId?: string;
  motherId?: string;
  spouseIds: string[];
  childrenIds: string[];
  siblingIds: string[];
  relations: CharacterRelation[];
  dynasty: string;
  lineageGroup: string;
  lineageId?: string;
  enemies: string[];
  shortDescription: string;
  fullDescription: string;
  traits: CharacterTrait[];
  achievements: string[];
  quote: string;
  portraitImage: string;
  sceneImage: string;
  createdAt: string;
  updatedAt: string;
};

export type CharacterInput = Omit<Character, "id" | "createdAt" | "updatedAt">;

export type CharacterWithRelations = Character & {
  family: CharacterFamilyRelations;
};

export type LineageNode = CharacterSummary & {
  children: LineageNode[];
};

export type LineageGroup = {
  name: string;
  characters: CharacterSummary[];
  roots: LineageNode[];
};
