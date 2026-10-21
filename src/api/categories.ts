/** Docker Hub catalog categories (slug is the `categories` search parameter). */
export const CATEGORIES = [
  { slug: 'api-management', name: 'API management' },
  { slug: 'content-management-system', name: 'Content management system' },
  { slug: 'data-science', name: 'Data science' },
  { slug: 'databases-and-storage', name: 'Databases & storage' },
  { slug: 'developer-tools', name: 'Developer tools' },
  { slug: 'integration-and-delivery', name: 'Integration & delivery' },
  { slug: 'internet-of-things', name: 'Internet of things' },
  { slug: 'languages-and-frameworks', name: 'Languages & frameworks' },
  { slug: 'machine-learning-and-ai', name: 'Machine learning & AI' },
  { slug: 'message-queues', name: 'Message queues' },
  { slug: 'monitoring-and-observability', name: 'Monitoring & observability' },
  { slug: 'networking', name: 'Networking' },
  { slug: 'operating-systems', name: 'Operating systems' },
  { slug: 'security', name: 'Security' },
  { slug: 'web-analytics', name: 'Web analytics' },
  { slug: 'web-servers', name: 'Web servers' },
] as const

export function categoryName(slug: string): string | undefined {
  return CATEGORIES.find((c) => c.slug === slug)?.name
}
