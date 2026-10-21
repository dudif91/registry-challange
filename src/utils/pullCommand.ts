/** Official images (namespace "library") are pulled without a namespace. */
export function pullCommand(namespace: string, name: string, tag?: string): string {
  const repo = namespace === 'library' ? name : `${namespace}/${name}`
  return `docker pull ${repo}${tag ? `:${tag}` : ''}`
}
