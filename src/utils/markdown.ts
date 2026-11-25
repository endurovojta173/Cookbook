import DOMPurify from 'dompurify';
import { marked } from 'marked';

/**
 * Renders Markdown to sanitized HTML safe for rendering in the browser.
 */
export function renderMarkdownToSafeHtml(markdown: string): string {
  const rawHtml = marked.parse(markdown, {
    async: false,
    gfm: true,
    breaks: false,
  });
  return DOMPurify.sanitize(rawHtml);
}
