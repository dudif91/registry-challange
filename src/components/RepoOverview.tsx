import Markdown from 'react-markdown'

/** Rendered README. Kept in its own module so the markdown renderer is lazy-loaded. */
export default function RepoOverview({ markdown }: { markdown: string }) {
  return (
    <div className="markdown">
      <Markdown components={{ a: ({ node: _node, ...props }) => <a {...props} target="_blank" rel="noreferrer noopener" /> }}>
        {markdown}
      </Markdown>
    </div>
  )
}
