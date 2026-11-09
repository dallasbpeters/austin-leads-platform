'use client'

import { InstagramEmbed } from 'sanity-plugin-sgntech-instagram-embed/render'

/*
 * Instagram posts from rich text (sanity-plugin-sgntech-instagram-embed). Its
 * embed uses effects but ships without "use client", so it is wrapped here to
 * work inside server components too.
 */

/** One post (a portable text `instagramPost` block). */
export const InstagramPost = ({ value }) =>
  value?.url ? <InstagramEmbed url={value.url} captioned={value.captioned} /> : null

/** Two or more posts in a row, side by side (see groupEmbeds in portable-text-content.jsx). */
export const InstagramGrid = ({ value }) => (
  <div className="instagram-grid">
    {value.posts.map((post) => (
      <InstagramEmbed key={post._key} url={post.url} captioned={post.captioned} />
    ))}
  </div>
)
