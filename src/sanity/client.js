import { createClient } from "next-sanity";

import { apiVersion, dataset, isSanityConfigured, projectId, useCdn } from "./env";

const baseConfig = {
  projectId,
  dataset,
  apiVersion,
  useCdn,
};

export const sanityClient = isSanityConfigured() ? createClient(baseConfig) : null;

export const sanityWriteClient =
  isSanityConfigured() && process.env.SANITY_API_WRITE_TOKEN
    ? createClient({
        ...baseConfig,
        token: process.env.SANITY_API_WRITE_TOKEN,
        useCdn: false,
      })
    : null;

export const sanityServerClient = sanityWriteClient || sanityClient;
