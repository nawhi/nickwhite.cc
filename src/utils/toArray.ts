export const toArray = <T>(t: T | T[]): T[] => (Array.isArray(t) ? t : [t]);
