import { Button, Card, Flex, Stack, Text } from '@sanity/ui'
import { useState } from 'react'

import { toolApiOrigin } from '../env'

/*
 * The site's two video tools inside Studio:
 *   Reels  (/reels)  - the reel studio for social posts
 *   Videos (/videos) - video projects and YouTube uploads
 * Both are pages of the Next.js app, shown in a frame. They need the staff
 * sign-in cookie, which browsers only send when Studio runs on the same site
 * as the app (local dev, or a Studio on the app's own domain). The hosted
 * *.sanity.studio is another site, so there the tool offers a button that
 * opens the page in a new tab instead.
 */

const PAGES = [
  { id: 'reels', title: 'Reels', path: '/reels' },
  { id: 'videos', title: 'Videos', path: '/videos' },
]

const ToolIcon = () => (
  <span aria-hidden="true" style={{ display: 'inline-flex', fontSize: '0.95rem', lineHeight: 1 }}>
    🎬
  </span>
)

/** The last two parts of a host name ("www.example.com" -> "example.com"); ports do not count. */
const siteOf = (hostname) => hostname.split('.').slice(-2).join('.')

/* Same site, so the browser sends the sign-in cookie to the frame (localhost:3334 and :3000 count). */
const sameSite = () => {
  try {
    return siteOf(new URL(toolApiOrigin).hostname) === siteOf(window.location.hostname)
  } catch {
    return false
  }
}

const VideoTool = () => {
  const [pageId, setPageId] = useState(PAGES[0].id)
  // Bumped by Reload, to load the frame again after signing in in another tab.
  const [reloads, setReloads] = useState(0)
  const page = PAGES.find((item) => item.id === pageId) || PAGES[0]
  const url = `${toolApiOrigin}${page.path}`
  const inline = sameSite()

  return (
    <Flex direction="column" style={{ height: '100%' }}>
      <Card padding={2} borderBottom>
        <Flex align="center" gap={2}>
          {PAGES.map((item) => (
            <Button
              key={item.id}
              text={item.title}
              mode={item.id === page.id ? 'default' : 'bleed'}
              tone="primary"
              fontSize={1}
              onClick={() => setPageId(item.id)}
            />
          ))}
          <Flex flex={1} justify="flex-end" gap={2}>
            {inline ? (
              <Button text="Reload" mode="bleed" fontSize={1} onClick={() => setReloads((n) => n + 1)} />
            ) : null}
            <Button
              as="a"
              href={url}
              target="_blank"
              rel="noopener"
              text="Open in new tab"
              mode="ghost"
              fontSize={1}
            />
          </Flex>
        </Flex>
      </Card>
      {inline ? (
        // The app's own page on the same origin: it needs its scripts and the sign-in cookie.
        <iframe
          key={`${page.id}-${reloads}`}
          title={page.title}
          src={url}
          // oxlint-disable-next-line react/iframe-missing-sandbox
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals"
          style={{ flex: 1, width: '100%', border: 0 }}
        />
      ) : (
        <Card padding={5} flex={1}>
          <Stack gap={4} style={{ maxWidth: '32rem' }}>
            <Text size={2} weight="semibold">
              {page.title} opens in its own tab here
            </Text>
            <Text size={1} muted>
              This Studio runs on a different site than {toolApiOrigin}, so your site sign-in does not carry
              into Studio. The tool opens in a new tab, already signed in.
            </Text>
            <Flex>
              <Button
                as="a"
                href={url}
                target="_blank"
                rel="noopener"
                text={`Open ${page.title}`}
                tone="primary"
              />
            </Flex>
          </Stack>
        </Card>
      )}
    </Flex>
  )
}

export function videoTool() {
  return {
    name: 'video',
    title: 'Video',
    icon: ToolIcon,
    component: VideoTool,
  }
}
