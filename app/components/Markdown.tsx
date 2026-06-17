import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

/**
 * Remove HTML comments (e.g. the generator's `<!-- ... -->` placeholders) from
 * prose so they stay in the source file for editing guidance but never render.
 * Comments inside fenced code blocks are preserved.
 */
function stripHtmlComments(markdown: string): string {
  return markdown
    .split(/(```[\s\S]*?```)/g)
    .map((part, index) =>
      index % 2 === 1 ? part : part.replace(/<!--[\s\S]*?-->/g, "")
    )
    .join("");
}

export function Markdown({ content }: { content: string }) {
  return (
    <div className="prose-notes">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
      >
        {stripHtmlComments(content)}
      </ReactMarkdown>
    </div>
  );
}
