import { defineEnableDraftMode } from "next-sanity/draft-mode";

import { getSanityServerClient } from "@/sanity/client";

const client = getSanityServerClient({ preview: true, stega: false });

if (!client) {
  throw new Error("Sanity is not configured for draft mode.");
}

export const { GET } = defineEnableDraftMode({
  client,
});
