import { formatEnumLabel, normalizeText } from '@/lib/formatters';
import { User } from '@/types/User';

export const canManageUsers = (
  user: Pick<User, 'process' | 'sub_process'> | null | undefined
): boolean => {
  if (!user) return false;

  const normalizedSubProcess = normalizeText(formatEnumLabel(user.sub_process));
  const normalizedProcess = normalizeText(formatEnumLabel(user.process));

  return (
    normalizedSubProcess === 'director tecnologia' ||
    normalizedProcess === 'desarrollo informatico'
  );
};
