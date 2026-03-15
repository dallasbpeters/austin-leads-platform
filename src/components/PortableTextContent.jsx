import { PortableText } from '@portabletext/react'

import { portableTextToPlainText } from '@/lib/sanity/portableText'
import { cn } from '@/lib/utils'

const portableTextComponents = {
  block: {
    normal: ({ children }) => <div>{children}</div>,
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
