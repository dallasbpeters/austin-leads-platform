function toKeyPart(value) {
  return String(value || '')
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')
    .slice(0, 40)
}

function withChecklistKeys(checklist) {
  return {
    ...checklist,
    sections: (checklist.sections || []).map((section, sectionIndex) => ({
      _key: `section-${sectionIndex + 1}-${toKeyPart(section.title) || 'untitled'}`,
      ...section,
      tasks: (section.tasks || []).map((task, taskIndex) => ({
        _key: `task-${sectionIndex + 1}-${taskIndex + 1}-${toKeyPart(task.title) || 'untitled'}`,
        ...task,
      })),
    })),
  }
}

const launchChecklistDefinition = {
  title: 'Austin Leads Platform Launch Checklist',
  summary:
    'Core launch work required to make the multi-tenant platform production-ready, secure, content-ready, and operational on Vercel.',
  sections: [
    {
      title: 'Platform hardening',
      description:
        'Lock down admin surfaces, remove transitional code paths, and stabilize production behavior.',
      tasks: [
        {
          title: 'Verify auth protection on all admin routes and APIs in production',
          notes:
            'Test /dashboard, /publish, /domains, /hero-pages, /analytics, /studio, and related APIs in an incognito session.',
          status: 'todo',
          owner: 'Engineering',
          priority: 'high',
        },
        {
          title: 'Refactor the homepage/content model from slug-first to domain-first',
          notes:
            'Homepages should be resolved by connected domain/site, not by transitional slug conventions.',
          status: 'todo',
          owner: 'Engineering',
          priority: 'high',
        },
        {
          title: 'Add production-safe error logging and request tracing',
          notes:
            'At minimum capture auth failures, Sanity write failures, Unsplash failures, and domain API failures.',
          status: 'todo',
          owner: 'Engineering',
          priority: 'medium',
        },
      ],
    },
    {
      title: 'Sanity and content operations',
      description: 'Make Sanity the working editorial system for launch content and admin workflows.',
      tasks: [
        {
          title: 'Register the production Studio URL and confirm it is private',
          notes:
            'Production /studio must require sign-in and be properly connected in the Sanity project settings.',
          status: 'todo',
          owner: 'Content Ops',
          priority: 'high',
        },
        {
          title: 'Create domain/site records for the initial launch domains',
          notes:
            'Start with the hero domains that will be live first, with primaryDomain, aliases, tier, and brand metadata filled in.',
          status: 'todo',
          owner: 'Content Ops',
          priority: 'high',
        },
        {
          title: 'Create homepage content records and hero content for each launch domain',
          notes:
            'Hero title, body, CTA, proof points, image, overlay, and text treatment need to be complete before launch.',
          status: 'todo',
          owner: 'Content Ops',
          priority: 'high',
        },
        {
          title: 'Write and review launch copy for hero, service, FAQ, and conversion sections',
          notes: 'Remove placeholders, weak claims, and duplicated copy before any domain goes live.',
          status: 'todo',
          owner: 'Content',
          priority: 'high',
        },
      ],
    },
    {
      title: 'Domain and infrastructure',
      description:
        'Connect the real domains and make sure Vercel and the platform resolve each one correctly.',
      tasks: [
        {
          title: 'Add all launch domains in Vercel and verify DNS',
          notes:
            'Use the Domains admin route where possible, and confirm pending, verified, and active states against Vercel.',
          status: 'todo',
          owner: 'Operations',
          priority: 'high',
        },
        {
          title: 'Configure redirect domains to 301 to the correct hero domains',
          notes:
            'Validate redirect targets in both Vercel and app-layer behavior so no redirect inventory leaks to public routes.',
          status: 'todo',
          owner: 'Operations',
          priority: 'high',
        },
        {
          title: 'Set all required Vercel environment variables for production and preview',
          notes:
            'Sanity project settings, Sanity write token, Auth.js secrets, Unsplash access key, and Vercel API credentials must all be present.',
          status: 'todo',
          owner: 'Operations',
          priority: 'high',
        },
      ],
    },
    {
      title: 'SEO and discovery',
      description: 'Finish the pieces that let the first domains rank and be crawled correctly.',
      tasks: [
        {
          title: 'Review metadata, canonicals, sitemap, and robots output per live domain',
          notes:
            'Spot check each hero domain after DNS is active to ensure it resolves the correct site identity.',
          status: 'todo',
          owner: 'SEO',
          priority: 'high',
        },
        {
          title: 'Add structured data for local business, FAQ, article, and reviews where applicable',
          notes: 'Confirm the JSON-LD emitted by each template actually matches the content on the page.',
          status: 'todo',
          owner: 'SEO',
          priority: 'medium',
        },
        {
          title: 'Publish the first wave of service pages and supporting content',
          notes: 'Launch content should cover the initial target queries, not just the homepage.',
          status: 'todo',
          owner: 'Content',
          priority: 'high',
        },
      ],
    },
    {
      title: 'Go-live operations',
      description:
        'Handle the launch tasks that turn a technically ready site into a live, reviewable, and reachable business property.',
      tasks: [
        {
          title: 'Submit the live sitemap to Google Search Console and Bing Webmaster Tools',
          notes:
            'Verify the production domain, submit `/sitemap.xml`, and confirm crawl/index coverage after launch.',
          status: 'todo',
          owner: 'SEO',
          priority: 'high',
        },
        {
          title: 'Complete Google Business Profile and align site links, services, and photos',
          notes:
            'Make sure the site URL, service categories, phone, photos, and service-area details match the live business profile.',
          status: 'todo',
          owner: 'Operations',
          priority: 'high',
        },
        {
          title: 'Confirm citation consistency across major local profiles',
          notes:
            'Check name, address, phone, website URL, and service-area details on Yelp, Apple Business Connect, Facebook, BBB, and other live profiles.',
          status: 'todo',
          owner: 'Operations',
          priority: 'medium',
        },
        {
          title: 'Run a live lead-routing test from form, click-to-call, and direct email paths',
          notes:
            'Confirm that launch traffic can actually reach Kathy, that CRM attribution survives, and that failures are visible.',
          status: 'todo',
          owner: 'Operations',
          priority: 'high',
        },
      ],
    },
    {
      title: 'Analytics and lead capture',
      description:
        'Replace placeholders with the live measurement and lead routing needed to operate the platform.',
      tasks: [
        {
          title: 'Connect real analytics providers and verify event collection',
          notes:
            'Vercel Analytics is mounted, but the dashboard still needs live provider-backed reporting and verified goal events.',
          status: 'todo',
          owner: 'Engineering',
          priority: 'high',
        },
        {
          title: 'Define and track launch KPIs',
          notes:
            'At minimum track sessions, form submits, click-to-call, AI referral traffic, and per-domain conversion rate.',
          status: 'todo',
          owner: 'Operations',
          priority: 'medium',
        },
        {
          title: 'Wire lead forms to the real destination workflow',
          notes:
            'Confirm where submissions go, how failures are reported, and how domain/source attribution is preserved.',
          status: 'todo',
          owner: 'Operations',
          priority: 'high',
        },
      ],
    },
    {
      title: 'Exposure and distribution',
      description: 'Get the live site into real local channels so it is not waiting passively for discovery.',
      tasks: [
        {
          title:
            'Publish and distribute the first wave of guides through email, social, and partner channels',
          notes:
            'Use the launch guides as shareable assets, not just SEO pages. Add UTMs so traffic sources can be measured.',
          status: 'todo',
          owner: 'Content',
          priority: 'high',
        },
        {
          title: 'Create a review request workflow for homeowners and recent customers',
          notes:
            'Ask for Google reviews with direct links, then surface the strongest language back into page proof and sales follow-up.',
          status: 'todo',
          owner: 'Operations',
          priority: 'high',
        },
        {
          title:
            'Build referral and partner outreach with roofers, insurance-facing contacts, and local home-service relationships',
          notes:
            'Use the site as the destination for referrals, inspection follow-up, and educational content handoff.',
          status: 'todo',
          owner: 'Business Development',
          priority: 'medium',
        },
        {
          title: 'Launch a small paid search and retargeting test against the highest-intent service pages',
          notes:
            'Start with tightly scoped search terms, branded protection, and remarketing audiences so early spend stays measurable.',
          status: 'todo',
          owner: 'Marketing',
          priority: 'medium',
        },
        {
          title:
            'Review weekly lead quality and tighten the pages that are getting traffic but not producing consultations',
          notes:
            'Use CRM status, service-interest selection, and page attribution to decide which pages need stronger proof, better CTAs, or different traffic sources.',
          status: 'todo',
          owner: 'Operations',
          priority: 'high',
        },
      ],
    },
  ],
}

export const defaultLaunchChecklist = withChecklistKeys(launchChecklistDefinition)
export { withChecklistKeys }
