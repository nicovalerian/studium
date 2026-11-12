'use client';

import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '@/lib/utils';
import 'highlight.js/styles/github-dark.css';

interface MessageContentProps {
  content: string;
  /** `inverse` renders on the primary-coloured user bubble. */
  variant?: 'default' | 'inverse';
}

export function MessageContent({ content, variant = 'default' }: MessageContentProps) {
  const inverse = variant === 'inverse';

  return (
    <div className="max-w-none break-words leading-relaxed">
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        components={{
          p: ({ children }) => <p className="mb-3 text-pretty last:mb-0">{children}</p>,
          strong: ({ children }) => (
            <strong className={cn('font-semibold', !inverse && 'text-warm-900')}>{children}</strong>
          ),
          h1: ({ children }) => (
            <h3 className="mb-2 mt-4 font-sans text-base font-semibold first:mt-0">{children}</h3>
          ),
          h2: ({ children }) => (
            <h3 className="mb-2 mt-4 font-sans text-base font-semibold first:mt-0">{children}</h3>
          ),
          h3: ({ children }) => (
            <h4 className="mb-1.5 mt-3 font-sans text-[15px] font-semibold first:mt-0">
              {children}
            </h4>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'font-medium underline underline-offset-4',
                inverse
                  ? 'text-white decoration-white/60 hover:decoration-white'
                  : 'text-primary decoration-primary/40 hover:decoration-primary'
              )}
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="mb-3 ml-5 list-disc space-y-1.5 marker:text-warm-400 last:mb-0">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 ml-5 list-decimal space-y-1.5 marker:text-warm-500 last:mb-0">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote
              className={cn(
                'mb-3 rounded-lg px-4 py-3 last:mb-0 [&>p]:mb-0',
                inverse ? 'bg-white/15' : 'bg-secondary/70 text-warm-800'
              )}
            >
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-4 border-warm-200" />,
          table: ({ children }) => (
            <div className="mb-3 overflow-x-auto last:mb-0">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-warm-200 px-2 py-1.5 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-warm-100 px-2 py-1.5 align-top">{children}</td>
          ),
          pre: ({ children }) => (
            <pre className="mb-3 overflow-x-auto rounded-lg bg-warm-900 p-3 text-[13px] leading-relaxed last:mb-0 [&>code]:bg-transparent [&>code]:p-0">
              {children}
            </pre>
          ),
          code: ({
            className,
            children,
            ...props
          }: {
            className?: string;
            children?: React.ReactNode;
          }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            return isInline ? (
              <code
                className={cn(
                  'rounded-md px-1.5 py-0.5 font-mono text-[0.85em]',
                  inverse ? 'bg-white/15 text-white' : 'bg-warm-100 text-warm-800'
                )}
                {...props}
              >
                {children}
              </code>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
