'use client'

import { definePlugin, useClient, useEditState } from 'sanity'

import {
  refreshAllGuideGridImagesFromPosts,
  syncGuideGridCardImagesToHeroes,
  syncGuideHeroToGuideGridItems,
} from '../lib/syncGuideListingImages'

function SyncHeroToListing(props) {
  const { id, type, onComplete } = props
  const client = useClient({ apiVersion: '2024-08-01' })
  const edit = useEditState(id, type)
  const slug = edit?.draft?.slug?.current || edit?.published?.slug?.current || ''

  if (type !== 'post' || !String(slug).startsWith('guides/')) {
    return null
  }

  return {
    label: 'Sync hero → guides listing',
    title: 'Copy this guide’s hero image onto its card on the Guides page',
    onHandle: async () => {
      try {
        const doc = await client.fetch(
          `*[_id == $id][0]{title,description,"slug":slug.current,sections,site}`,
          { id },
        )
        if (doc?.site?._ref) {
          await syncGuideHeroToGuideGridItems(client, doc)
        }
      } finally {
        onComplete()
      }
    },
  }
}

function PushListingImagesToGuideHeroes(props) {
  const { id, type, onComplete } = props
  const client = useClient({ apiVersion: '2024-08-01' })
  const edit = useEditState(id, type)
  const slug = edit?.draft?.slug?.current || edit?.published?.slug?.current || ''

  if (type !== 'page' || slug !== 'guides') {
    return null
  }

  return {
    label: 'Push card images → guide heroes',
    title: 'Update each guide post’s hero to match its card image on this page',
    onHandle: async () => {
      try {
        const doc = await client.fetch(`*[_id == $id][0]{sections,site}`, { id })
        const siteRef = doc?.site?._ref
        if (siteRef && doc) {
          await syncGuideGridCardImagesToHeroes(client, { siteRef, guidesPageDoc: doc })
        }
      } finally {
        onComplete()
      }
    },
  }
}

function RefreshListingFromGuideHeroes(props) {
  const { id, type, onComplete } = props
  const client = useClient({ apiVersion: '2024-08-01' })
  const edit = useEditState(id, type)
  const slug = edit?.draft?.slug?.current || edit?.published?.slug?.current || ''

  if (type !== 'page' || slug !== 'guides') {
    return null
  }

  return {
    label: 'Refresh cards from guide heroes',
    title: 'Copy every guide’s hero image onto its Guides page card',
    onHandle: async () => {
      try {
        const doc = await client.fetch(`*[_id == $id][0]{site}`, { id })
        const siteRef = doc?.site?._ref
        if (siteRef) {
          await refreshAllGuideGridImagesFromPosts(client, siteRef)
        }
      } finally {
        onComplete()
      }
    },
  }
}

export const guideImageSyncPlugin = definePlugin({
  name: 'guide-image-sync',
  document: {
    actions: (prev) => [
      ...prev,
      SyncHeroToListing,
      PushListingImagesToGuideHeroes,
      RefreshListingFromGuideHeroes,
    ],
  },
})
