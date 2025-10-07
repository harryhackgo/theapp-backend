import { randomUUID } from 'crypto';

export function getUniqIdValue(prefix = ''): string {
  return prefix + randomUUID();
}
