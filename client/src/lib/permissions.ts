import { User } from '@/types/User';

export const canManageUsers = (
  user: Pick<User, 'process' | 'sub_process'> | null | undefined
): boolean => {
  if (!user) return false;
  return (
    user.sub_process === 'Director_Tecnologia' ||
    user.process === 'Desarrollo_Informatíco'
  );
};
