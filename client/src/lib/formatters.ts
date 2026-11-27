export const formatEnumLabel = (value?: string | null): string => {
  if (!value) return '-';
  const formatted = value.trim().replace(/_/g, ' ');
  return formatted || '-';
};

export const formatCompany = (value?: string | null): string => {
  if (!value) return '-';
  const formatted = value
    .trim()
    .replace(/([a-z])Y([A-Z])/g, '$1 y $2')
    .replace(/_/g, ' ');
  return formatted || '-';
};

export const formatDate = (value?: string | null): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const getInitials = (names?: string, lastnames?: string): string => {
  const first = names?.trim().charAt(0) ?? '';
  const second = lastnames?.trim().charAt(0) ?? '';
  const initials = `${first}${second}`.toUpperCase();
  return initials.slice(0, 2) || 'US';
};

export const normalizeText = (value?: string | number | null): string => {
  if (value === null || value === undefined) return '';
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};
