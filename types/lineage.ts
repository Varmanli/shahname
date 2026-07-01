import type { CharacterSummary } from "@/types/character";
import type { Relationship } from "@/types/relationship";

export type Lineage = {
  id: string;
  title: string;
  description: string;
  isApproved: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type LineageInput = Omit<Lineage, "id" | "createdAt" | "updatedAt">;

export type LineageTreeNode = CharacterSummary & {
  children: LineageTreeNode[];
};

export type ApprovedLineageTree = Pick<
  Lineage,
  "id" | "title" | "description" | "isApproved" | "order"
> & {
  characters: CharacterSummary[];
  relationships: Relationship[];
  roots: LineageTreeNode[];
};
