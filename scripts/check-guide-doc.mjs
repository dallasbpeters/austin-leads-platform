import { createClient } from "next-sanity";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-10-21",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const slug = process.argv[2] || "guides/austin-solar-costs-and-savings";

const query = `*[_type in ["page", "post"] && slug.current == $slug][0]{
  _id,
  _type,
  title,
  "slug": slug.current,
  sections[]{
    type,
    title,
    heroImage,
    heroAsset{
      alt,
      asset->{
        url
      }
    },
    items[]{
      title,
      image,
      imageAsset{
        alt,
        asset->{
          url
        }
      }
    }
  }
}`;

const doc = await client.fetch(query, { slug });
console.log(JSON.stringify(doc, null, 2));
