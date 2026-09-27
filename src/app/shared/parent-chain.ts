import { ComboOption, ParentLevel } from "./database-table";

/**
 * Codebooks that hang off another table are chosen level by level: country, then region, then city.
 * The value that is stored is only the last level; the ones above narrow the choice down to it.
 */

/** One level of the chain, in the order it is shown: the root first, the column itself last. */
export interface ChainLevel {
  name: string;
  options: ComboOption[];
}

/**
 * The chain for display. The server sends the levels above bottom-up (direct parent first), so they
 * are turned around, and the column itself is added as the last level.
 */
export function chainLevels(parents: ParentLevel[] | undefined, own: ChainLevel): ChainLevel[] {
  const levels = (parents ?? [])
    .map((parent) => ({ name: parent.name, options: parent.comboboxDTO ?? [] }))
    .reverse();
  return [...levels, own];
}

/** Records of one level that belong to the record chosen on the level above. */
export function optionsOf(levels: ChainLevel[], index: number, chosen: string[]): ComboOption[] {
  const options = levels[index]?.options ?? [];
  if (index === 0) {
    return options;
  }
  const above = chosen[index - 1];
  return above ? options.filter((option) => option.parent === above) : [];
}

/**
 * Editing an existing record: only the value of the last level is known, so the chain is walked
 * upwards through the parent of each record.
 */
export function chainOfValue(levels: ChainLevel[], value: string): string[] {
  const chosen: string[] = new Array(levels.length).fill("");
  if (!value) {
    return chosen;
  }

  chosen[levels.length - 1] = value;
  for (let index = levels.length - 1; index > 0; index--) {
    const record = levels[index].options.find((option) => option.value === chosen[index]);
    if (!record?.parent) {
      break;
    }
    chosen[index - 1] = record.parent;
  }
  return chosen;
}
