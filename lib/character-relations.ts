import type {
  Character,
  CharacterFamilyRelations,
  CharacterInput,
  CharacterRelation,
  CharacterRelationType,
  CharacterSummary,
  CharacterWithRelations,
  LineageGroup,
  LineageNode,
} from "@/types/character";
import type { ApprovedLineageTree, Lineage, LineageTreeNode } from "@/types/lineage";
import type { Relationship } from "@/types/relationship";

const relationTypes = new Set<CharacterRelationType>([
  "father",
  "mother",
  "child",
  "spouse",
  "sibling",
  "ancestor",
  "descendant",
]);

export function toCharacterSummary(character: Character): CharacterSummary {
  return {
    id: character.id,
    name: character.name,
    slug: character.slug,
    avatar: character.portraitImage,
    shortTitle: character.title || character.role,
    dynasty: character.lineageGroup || character.dynasty,
    fatherId: character.fatherId,
    motherId: character.motherId,
    role: character.role,
    visualRole: character.visualRole,
    tags: [
      character.role,
      character.title,
      ...character.epithets,
      ...character.traits.map((trait) => trait.key),
    ].filter(Boolean),
    shortDescription: character.shortDescription,
  };
}

function uniqueIds(ids: Array<string | undefined>) {
  return [...new Set(ids.map((id) => id?.trim()).filter((id): id is string => Boolean(id)))];
}

function sortByName(characters: CharacterSummary[]) {
  return [...characters].sort((a, b) => a.name.localeCompare(b.name, "fa"));
}

export function getCharacterOptions(characters: Character[]) {
  return characters
    .map(toCharacterSummary)
    .sort((a, b) => a.name.localeCompare(b.name, "fa"));
}

export function validateCharacterRelations(
  input: CharacterInput,
  characters: Character[],
  currentId?: string,
) {
  const existingIds = new Set(characters.map((character) => character.id));
  const scopedExistingIds = currentId
    ? new Set([...existingIds].filter((id) => id !== currentId))
    : existingIds;
  const relationIds = uniqueIds([
    input.fatherId,
    input.motherId,
    ...input.spouseIds,
    ...input.childrenIds,
    ...input.siblingIds,
    ...input.relations.map((relation) => relation.targetCharacterId),
  ]);

  if (currentId && relationIds.includes(currentId)) {
    return "شخصیت نمی‌تواند با خودش رابطه تبارنامه‌ای داشته باشد.";
  }

  const missingId = relationIds.find((id) => !scopedExistingIds.has(id));
  if (missingId) {
    return "یکی از شخصیت‌های انتخاب‌شده برای رابطه وجود ندارد.";
  }

  const duplicates = [
    ["همسر", input.spouseIds],
    ["فرزند", input.childrenIds],
    ["خواهر/برادر", input.siblingIds],
  ].find(([, ids]) => uniqueIds(ids as string[]).length !== (ids as string[]).length);

  if (duplicates) {
    return `رابطه ${duplicates[0]} تکراری انتخاب شده است.`;
  }

  const relationKeys = new Set<string>();
  for (const relation of input.relations) {
    if (!relationTypes.has(relation.type)) {
      return "نوع یکی از رابطه‌ها معتبر نیست.";
    }

    const key = `${relation.sourceCharacterId}:${relation.targetCharacterId}:${relation.type}`;
    if (relationKeys.has(key)) {
      return "رابطه تکراری ثبت شده است.";
    }
    relationKeys.add(key);
  }

  return null;
}

function makeRelation(
  sourceCharacterId: string,
  targetCharacterId: string,
  type: CharacterRelationType,
): CharacterRelation {
  const now = new Date().toISOString();

  return {
    id: `${sourceCharacterId}:${targetCharacterId}:${type}`,
    sourceCharacterId,
    targetCharacterId,
    type,
    createdAt: now,
    updatedAt: now,
  };
}

export function normalizeInputRelations(
  input: CharacterInput,
  sourceCharacterId: string,
) {
  const fatherId = input.fatherId || undefined;
  const motherId = input.motherId || undefined;
  const spouseIds = uniqueIds(input.spouseIds).filter((id) => id !== sourceCharacterId);
  const childrenIds = uniqueIds(input.childrenIds).filter((id) => id !== sourceCharacterId);
  const siblingIds = uniqueIds(input.siblingIds).filter((id) => id !== sourceCharacterId);
  const relationMap = new Map<string, CharacterRelation>();

  for (const relation of input.relations) {
    if (
      relation.sourceCharacterId === sourceCharacterId &&
      relation.targetCharacterId !== sourceCharacterId
    ) {
      relationMap.set(
        `${relation.sourceCharacterId}:${relation.targetCharacterId}:${relation.type}`,
        relation,
      );
    }
  }

  for (const relation of [
    fatherId ? makeRelation(sourceCharacterId, fatherId, "father") : null,
    motherId ? makeRelation(sourceCharacterId, motherId, "mother") : null,
    ...spouseIds.map((id) => makeRelation(sourceCharacterId, id, "spouse")),
    ...childrenIds.map((id) => makeRelation(sourceCharacterId, id, "child")),
    ...siblingIds.map((id) => makeRelation(sourceCharacterId, id, "sibling")),
  ]) {
    if (relation) {
      relationMap.set(
        `${relation.sourceCharacterId}:${relation.targetCharacterId}:${relation.type}`,
        relation,
      );
    }
  }

  return {
    ...input,
    fatherId,
    motherId,
    spouseIds,
    childrenIds,
    siblingIds,
    relations: [...relationMap.values()],
  };
}

function getByIds(ids: string[], charactersById: Map<string, Character>) {
  return sortByName(
    uniqueIds(ids)
      .map((id) => charactersById.get(id))
      .filter((character): character is Character => Boolean(character))
      .map(toCharacterSummary),
  );
}

export function getFamilyRelations(
  character: Character,
  characters: Character[],
): CharacterFamilyRelations {
  const charactersById = new Map(characters.map((item) => [item.id, item]));
  const fatherIds = uniqueIds([character.fatherId]);
  const motherIds = uniqueIds([character.motherId]);
  const spouseIds = uniqueIds([
    ...character.spouseIds,
    ...characters
      .filter((item) => item.spouseIds.includes(character.id))
      .map((item) => item.id),
  ]);
  const childrenIds = uniqueIds([
    ...character.childrenIds,
    ...characters
      .filter(
        (item) =>
          item.fatherId === character.id ||
          item.motherId === character.id ||
          item.relations.some(
            (relation) =>
              relation.targetCharacterId === character.id && relation.type === "child",
          ),
      )
      .map((item) => item.id),
  ]);
  const siblingIds = uniqueIds([
    ...character.siblingIds,
    ...characters
      .filter(
        (item) =>
          item.id !== character.id &&
          (item.siblingIds.includes(character.id) ||
            (Boolean(character.fatherId) && item.fatherId === character.fatherId) ||
            (Boolean(character.motherId) && item.motherId === character.motherId)),
      )
      .map((item) => item.id),
  ]);
  const directLineage = buildDirectLineage(character, characters);

  return {
    father: getByIds(fatherIds, charactersById)[0],
    mother: getByIds(motherIds, charactersById)[0],
    spouses: getByIds(spouseIds, charactersById),
    children: getByIds(childrenIds, charactersById),
    siblings: getByIds(siblingIds, charactersById),
    directLineage,
  };
}

export function withFamilyRelations(
  character: Character,
  characters: Character[],
): CharacterWithRelations {
  return {
    ...character,
    family: getFamilyRelations(character, characters),
  };
}

function buildDirectLineage(character: Character, characters: Character[]) {
  const byId = new Map(characters.map((item) => [item.id, item]));
  const chain: Character[] = [];
  const seen = new Set<string>();
  let current: Character | undefined = character;

  while (current && !seen.has(current.id)) {
    chain.unshift(current);
    seen.add(current.id);
    current = current.fatherId ? byId.get(current.fatherId) : undefined;
  }

  return chain.map(toCharacterSummary);
}

export function buildLineageGroups(characters: Character[]): LineageGroup[] {
  const byGroup = new Map<string, Character[]>();

  for (const character of characters) {
    const groupName = character.lineageGroup || character.dynasty || "بدون گروه";
    const group = byGroup.get(groupName) ?? [];
    group.push(character);
    byGroup.set(groupName, group);
  }

  return [...byGroup.entries()]
    .map(([name, groupCharacters]) => ({
      name,
      characters: getCharacterOptions(groupCharacters),
      roots: buildTrees(groupCharacters),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "fa"));
}

export function buildApprovedLineageTrees(
  lineages: Lineage[],
  characters: Character[],
  relationships: Relationship[] = [],
): ApprovedLineageTree[] {
  return lineages
    .filter((lineage) => lineage.isApproved)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "fa"))
    .map((lineage) => {
      const lineageCharacters = characters.filter(
        (character) => character.lineageId === lineage.id,
      );
      const lineageCharacterIds = new Set(
        lineageCharacters.map((character) => character.id),
      );
      const lineageRelationships = relationships.filter(
        (relationship) =>
          lineageCharacterIds.has(relationship.sourceCharacterId) &&
          lineageCharacterIds.has(relationship.targetCharacterId),
      );
      const spouseCharacterIds = new Set<string>();
      for (const relationship of lineageRelationships) {
        if (relationship.type === "spouse") {
          spouseCharacterIds.add(relationship.sourceCharacterId);
          spouseCharacterIds.add(relationship.targetCharacterId);
        }
      }
      const addRelationshipTags = <T extends CharacterSummary>(summary: T): T => ({
        ...summary,
        tags: spouseCharacterIds.has(summary.id)
          ? [...summary.tags, "spouse", "همسر"]
          : summary.tags,
      });

      return {
        id: lineage.id,
        title: lineage.title,
        description: lineage.description,
        isApproved: lineage.isApproved,
        order: lineage.order,
        characters: getCharacterOptions(lineageCharacters).map(addRelationshipTags),
        relationships: lineageRelationships,
        roots: buildLineageTrees(lineageCharacters).map((node) =>
          addRelationshipTagsToNode(node, addRelationshipTags),
        ),
      };
    })
    .filter((lineage) => lineage.characters.length > 0 || lineage.roots.length > 0);
}

function addRelationshipTagsToNode(
  node: LineageTreeNode,
  addRelationshipTags: <T extends CharacterSummary>(summary: T) => T,
): LineageTreeNode {
  return {
    ...addRelationshipTags(node),
    children: node.children.map((child) =>
      addRelationshipTagsToNode(child, addRelationshipTags),
    ),
  };
}

export function buildLineageTrees(characters: Character[]): LineageTreeNode[] {
  const byId = new Map(characters.map((character) => [character.id, character]));
  const roots = characters.filter(
    (character) => !character.fatherId || !byId.has(character.fatherId),
  );

  return roots
    .sort(compareCharactersForTree)
    .map((character) => buildLineageTreeNode(character, characters, new Set()));
}

function compareCharactersForTree(a: Character, b: Character) {
  return (
    a.createdAt.localeCompare(b.createdAt) ||
    a.name.localeCompare(b.name, "fa")
  );
}

function buildLineageTreeNode(
  character: Character,
  characters: Character[],
  visited: Set<string>,
): LineageTreeNode {
  const nextVisited = new Set(visited);
  nextVisited.add(character.id);

  return {
    ...toCharacterSummary(character),
    children: characters
      .filter(
        (item) => item.fatherId === character.id && !nextVisited.has(item.id),
      )
      .sort(compareCharactersForTree)
      .map((child) => buildLineageTreeNode(child, characters, nextVisited)),
  };
}

function buildTrees(characters: Character[]): LineageNode[] {
  const byId = new Map(characters.map((character) => [character.id, character]));

  const roots = characters.filter((character) => {
    return !character.fatherId || !byId.has(character.fatherId);
  });

  return roots
    .sort((a, b) => a.name.localeCompare(b.name, "fa"))
    .map((character) => buildNode(character, characters, new Set()));
}

function buildNode(
  character: Character,
  characters: Character[],
  visited: Set<string>,
): LineageNode {
  const nextVisited = new Set(visited);
  nextVisited.add(character.id);

  return {
    ...toCharacterSummary(character),
    children: getFamilyRelations(character, characters).children
      .map((child) => characters.find((item) => item.id === child.id))
      .filter(
        (child): child is Character =>
          child !== undefined && !nextVisited.has(child.id),
      )
      .sort((a, b) => a.name.localeCompare(b.name, "fa"))
      .map((child) => buildNode(child, characters, nextVisited)),
  };
}
