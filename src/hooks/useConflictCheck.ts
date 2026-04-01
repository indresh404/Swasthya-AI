import { conflictPairs } from '@/data/mockMedicines';

export function useConflictCheck() {
  function checkConflict(newMed: string, existingMeds: string[]) {
    const newLower = newMed.toLowerCase();
    for (const existing of existingMeds) {
      const existingLower = existing.toLowerCase();
      // Keys are alphabetical to avoid order issues, or both orders are checked
      const key1 = `${newLower}-${existingLower}`;
      const key2 = `${existingLower}-${newLower}`;

      if (conflictPairs[key1]) return { ...conflictPairs[key1], withMed: existing };
      if (conflictPairs[key2]) return { ...conflictPairs[key2], withMed: existing };
    }
    return null;
  }

  return { checkConflict };
}
