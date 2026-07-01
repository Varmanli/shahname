import { buildApprovedLineageTrees } from "@/lib/character-relations";
import { readCharacters } from "@/lib/character-store";
import { readLineages } from "@/lib/lineage-store";
import { readRelationships } from "@/lib/relationship-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const [lineages, characters, relationships] = await Promise.all([
    readLineages(),
    readCharacters(),
    readRelationships(),
  ]);

  return Response.json({
    lineages: buildApprovedLineageTrees(lineages, characters, relationships),
  });
}
