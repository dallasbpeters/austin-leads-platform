import { PortableText } from '@portabletext/react'

import { portableTextToPlainText } from '@/lib/sanity/portableText'
import { cn } from '@/lib/utils'

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getBlockText(value) {
  return value?.children?.map((child) => child.text).join('') || ''
}

const portableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h2: ({ children, value }) => (
      <h2 id={slugify(getBlockText(value))} className="text-xl font-bold">
        {children}
      </h2>
    ),
    h3: ({ children, value }) => (
      <h3 id={slugify(getBlockText(value))} className="text-lg font-semibold">
        {children}
      </h3>
    ),
    h4: ({ children }) => <h4 className="text-base font-semibold">{children}</h4>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-current pl-4 opacity-75">{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc space-y-1.5 pl-5 marker:text-current">{children}</ul>,
    number: ({ children }) => (
      <ol className="list-decimal space-y-1.5 pl-5 marker:text-current">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="pl-1">{children}</li>,
    number: ({ children }) => <li className="pl-1">{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => (
      <code className="rounded bg-black/10 px-1 py-0.5 font-mono text-sm">{children}</code>
    ),
    link: ({ value, children }) => (
      <a
        href={value?.href}
        target={value?.blank ? '_blank' : undefined}
        rel={value?.blank ? 'noopener noreferrer' : undefined}
        className="underline underline-offset-2 opacity-90 hover:opacity-100"
      >
        {children}
      </a>
    ),
  },
}

export default function PortableTextContent({ value, className, as: Tag = 'div', style }) {
  if (!value) return null

  if (Array.isArray(value)) {
    return (
      <Tag className={cn('portable-text-content [&>*+*]:mt-4', className)} style={style}>
        <PortableText value={value} components={portableTextComponents} />
      </Tag>
    )
  }

  const text = portableTextToPlainText(value)
  if (!text) return null

  return (
    <Tag className={cn('whitespace-pre-line', className)} style={style}>
      {text}
    </Tag>
  )
}
