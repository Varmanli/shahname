import { getCharacterOptions } from "@/lib/character-relations";
import { readCharacters } from "@/lib/character-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const characters = await readCharacters();

  return Response.json({ characters: getCharacterOptions(characters) });
}
