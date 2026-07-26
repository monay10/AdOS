import { useApp } from '../app/context';
import { content, type Content } from './content';

/** Returns the full content dictionary for the active locale. */
export function useT(): Content {
  const { locale } = useApp();
  return content[locale];
}
