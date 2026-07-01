export type RelationshipType =
  | "parent_child"
  | "spouse"
  | "indirect_lineage"
  | "ally"
  | "other";

export type RelationshipConfidence = "confirmed" | "inferred" | "legendary";

export type Relationship = {
  id: string;
  sourceCharacterId: string;
  targetCharacterId: string;
  type: RelationshipType;
  label?: string;
  description?: string;
  confidence?: RelationshipConfidence;
  order?: number;
};

export type RelationshipInput = Omit<Relationship, "id">;
