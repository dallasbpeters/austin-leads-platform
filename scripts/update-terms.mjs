import { createClient } from 'next-sanity'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

try {
  const envPath = resolve(import.meta.dirname, '..', '.env.local')
  const envFile = readFileSync(envPath, 'utf-8')
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex).trim()
    const value = trimmed
      .slice(eqIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = value
  }
} catch {
  try {
    const devEnvPath = resolve(import.meta.dirname, '..', '.env.development.local')
    const devEnvFile = readFileSync(devEnvPath, 'utf-8')
    for (const line of devEnvFile.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIndex = trimmed.indexOf('=')
      if (eqIndex === -1) continue
      const key = trimmed.slice(0, eqIndex).trim()
      const value = trimmed
        .slice(eqIndex + 1)
        .trim()
        .replace(/^["']|["']$/g, '')
      if (!process.env[key]) process.env[key] = value
    }
  } catch {}
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = '2025-10-21'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !dataset || !token) {
  console.error('Missing Sanity env.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

function pt(style, text, opts = {}) {
  const children = []
  if (opts.boldBefore) {
    children.push({ _type: 'span', marks: ['strong'], text: opts.boldBefore })
  }
  if (opts.linkBefore) {
    children.push({ _type: 'span', marks: [opts.linkBefore], text: opts.linkBeforeText || '' })
  }
  children.push({ _type: 'span', marks: opts.marks || [], text })
  if (opts.linkAfter) {
    children.push({ _type: 'span', marks: [opts.linkAfter], text: opts.linkAfterText || '' })
  }
  return {
    _type: 'block',
    style,
    _key: opts.key || `${style}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    markDefs: opts.markDefs || [],
    children,
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function tocItem(num, title) {
  const anchor = `#${slugify(`${num}. ${title}`)}`
  const linkKey = `ltoc-${num}`
  return {
    _type: 'block',
    style: 'normal',
    _key: `toc-${num}`,
    markDefs: [{ _key: linkKey, _type: 'link', href: anchor }],
    children: [{ _type: 'span', marks: [linkKey], text: `${num}. ${title}` }],
  }
}

function h2Block(num, title) {
  return {
    _type: 'block',
    style: 'h2',
    _key: `h2-${num}-${slugify(title).slice(0, 20)}`,
    markDefs: [],
    children: [{ _type: 'span', marks: [], text: `${num}. ${title}` }],
  }
}

function pBlock(text, key) {
  return {
    _type: 'block',
    style: 'normal',
    _key: key || `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    markDefs: [],
    children: [{ _type: 'span', marks: [], text }],
  }
}

function pWithBold(text, boldText) {
  return {
    _type: 'block',
    style: 'normal',
    _key: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    markDefs: [],
    children: [
      { _type: 'span', marks: ['strong'], text: boldText },
      { _type: 'span', marks: [], text },
    ],
  }
}

// Build the full body — using the comprehensive legal content from the original paste
const sections = [
  {
    title: 'OUR SERVICES',
    paragraphs: [
      pBlock(
        'The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose to access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.',
      ),
      pBlock(
        'The Services are not tailored to comply with industry-specific regulations (Health Insurance Portability and Accountability Act (HIPAA), Federal Information Security Management Act (FISMA), etc.), so if your interactions would be subjected to such laws, you may not use the Services. You may not use the Services in a way that would violate the Gramm-Leach-Bliley Act (GLBA).',
      ),
    ],
  },
  {
    title: 'INTELLECTUAL PROPERTY RIGHTS',
    paragraphs: [
      pWithBold(
        ' owned by Texas Solar and Roofing Pros or its licensors. All source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Services (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights and unfair competition laws of the United States, foreign jurisdictions, and international conventions.',
        'We are the owner or the licensee of all intellectual property rights in our Services, including all Content and Marks.',
      ),
      pBlock(
        'The Content and Marks are provided in or through the Services "AS IS" for your personal, non-commercial use or internal business purpose only.',
      ),
      pBlock(
        'Subject to your compliance with these Legal Terms, including the "PROHIBITED ACTIVITIES" section below, we grant you a non-exclusive, non-transferable, revocable license to: access the Services; and download or print a copy of any portion of the Content to which you have properly gained access, solely for your personal, non-commercial use or internal business purpose.',
      ),
      pBlock(
        'Except as set out in this section or elsewhere in our Legal Terms, no part of the Services and no Content or Marks may be copied, reproduced, aggregated, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any commercial purpose whatsoever, without our express prior written permission.',
      ),
      pBlock(
        'If you wish to make any use of the Services, Content, or Marks other than as set out in this section, please address your request to info@texassolarandroofingpros.com. If we ever grant you the permission to post, reproduce, or publicly display any part of our Services or Content, you must identify us as the owners or licensors of the Services, Content, or Marks and ensure that any copyright or proprietary notice appears or is visible on posting, reproducing, or displaying our Content.',
      ),
      pBlock(
        'We reserve all rights not expressly granted to you in and to the Services, Content, and Marks.',
      ),
      pBlock(
        'Any breach of these Intellectual Property Rights will constitute a material breach of our Legal Terms and your right to use our Services will terminate immediately.',
      ),
    ],
  },
  {
    title: 'USER REPRESENTATIONS',
    paragraphs: [
      pBlock(
        'By using the Services, you represent and warrant that: (1) you have the legal capacity and you agree to comply with these Legal Terms; (2) you are not a minor in the jurisdiction in which you reside; (3) you will not access the Services through automated or non-human means, whether through a bot, script, or otherwise; (4) you will not use the Services for any illegal or unauthorized purpose; and (5) your use of the Services will not violate any applicable law or regulation.',
      ),
      pBlock(
        'If you provide any information that is untrue, inaccurate, not current, or incomplete, we have the right to suspend or terminate your access to the Services and refuse any and all current or future use of the Services (or any portion thereof).',
      ),
    ],
  },
  {
    title: 'PROHIBITED ACTIVITIES',
    paragraphs: [
      pBlock(
        'You may not access or use the Services for any purpose other than that for which we make the Services available. The Services may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.',
      ),
      pBlock('As a user of the Services, you agree not to:'),
      pBlock(
        'Systematically retrieve data or other content from the Services to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.',
      ),
      pBlock(
        'Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.',
      ),
      pBlock(
        'Circumvent, disable, or otherwise interfere with security-related features of the Services, including features that prevent or restrict the use or copying of any Content or enforce limitations on the use of the Services and/or the Content contained therein.',
      ),
      pBlock('Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Services.'),
      pBlock(
        'Use any information obtained from the Services in order to harass, abuse, or harm another person.',
      ),
      pBlock('Make improper use of our support services or submit false reports of abuse or misconduct.'),
      pBlock('Use the Services in a manner inconsistent with any applicable laws or regulations.'),
      pBlock('Engage in unauthorized framing of or linking to the Services.'),
      pBlock(
        "Upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses, or other material that interferes with any party's uninterrupted use of the Services or modifies, impairs, disrupts, alters, or interferes with the use, features, functions, operation, or maintenance of the Services.",
      ),
      pBlock(
        'Engage in any automated use of the system, such as using scripts to send comments or messages, or using any data mining, robots, or similar data gathering and extraction tools.',
      ),
      pBlock('Delete the copyright or other proprietary rights notice from any Content.'),
      pBlock('Attempt to impersonate another user or person or use the username of another user.'),
      pBlock(
        'Upload or transmit (or attempt to upload or to transmit) any material that acts as a passive or active information collection or transmission mechanism.',
      ),
      pBlock(
        'Interfere with, disrupt, or create an undue burden on the Services or the networks or services connected to the Services.',
      ),
      pBlock(
        'Harass, annoy, intimidate, or threaten any of our employees or agents engaged in providing any portion of the Services to you.',
      ),
      pBlock(
        'Attempt to bypass any measures of the Services designed to prevent or restrict access to the Services, or any portion of the Services.',
      ),
      pBlock(
        "Copy or adapt the Services' software, including but not limited to Flash, PHP, HTML, JavaScript, or other code.",
      ),
      pBlock(
        'Decipher, decompile, disassemble, or reverse engineer any of the software comprising or in any way making up a part of the Services.',
      ),
      pBlock(
        'Use, launch, develop, or distribute any automated system in a manner that sends more request messages to the Servers in a given period of time than a human can reasonably produce.',
      ),
      pBlock(
        'Make any unauthorized use of the Services, including collecting usernames and/or email addresses of users by electronic or other means for the purpose of sending unsolicited email.',
      ),
      pBlock(
        'Use the Services as part of any effort to compete with us or otherwise use the Services and/or the Content for any revenue-generating endeavor or commercial enterprise.',
      ),
      pBlock('Use the Services to advertise or offer to sell goods and services.'),
    ],
  },
  {
    title: 'USER GENERATED CONTRIBUTIONS',
    paragraphs: [
      pBlock(
        'The Services does not offer users to submit or post content. We may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the Services, including but not limited to text, writings, video, audio, photographs, graphics, comments, suggestions, or personal information or other material (collectively, "Contributions"). Contributions may be viewable by other users of the Services and through third-party websites. As such, any Contributions you transmit may be treated as non-confidential and non-proprietary.',
      ),
      pBlock('When you create or make available any Contributions, you thereby represent and warrant that:'),
      pBlock(
        'The creation, distribution, transmission, public display, or performance, and the accessing, downloading, or copying of your Contributions do not and will not infringe the proprietary rights, including but not limited to the copyright, patent, trademark, trade secret, or moral rights of any third party.',
      ),
      pBlock(
        'You are the creator and owner of or have the necessary licenses, rights, consents, releases, and permissions to use and to authorize us, the Services, and other users of the Services to use your Contributions in any manner contemplated by the Services and these Legal Terms.',
      ),
      pBlock(
        'You have the written consent, release, and/or permission of each and every identifiable individual person in your Contributions to use the name or likeness of each and every such identifiable individual person.',
      ),
      pBlock('Your Contributions are not false, inaccurate, or misleading.'),
      pBlock(
        'Your Contributions are not unsolicited or unauthorized advertising, promotional materials, pyramid schemes, chain letters, spam, mass mailings, or other forms of solicitation.',
      ),
      pBlock(
        'Your Contributions are not obscene, lewd, lascivious, filthy, violent, harassing, libelous, slanderous, or otherwise objectionable (as determined by us).',
      ),
      pBlock('Your Contributions do not ridicule, mock, disparage, intimidate, or abuse anyone.'),
      pBlock(
        'Your Contributions are not used to harass or threaten (in the legal sense of those terms) any other person and do not promote violence against a specific person or class of people.',
      ),
      pBlock('Your Contributions do not violate any applicable law, regulation, or rule.'),
      pBlock('Your Contributions do not violate the privacy or publicity rights of any third party.'),
      pBlock(
        'Your Contributions do not violate any applicable law concerning child pornography, or otherwise intended to protect the health or well-being of minors.',
      ),
      pBlock(
        'Your Contributions do not include any offensive comments that are connected to race, national origin, gender, sexual preference, or physical handicap.',
      ),
      pBlock(
        'Your Contributions do not otherwise violate, or link to material that violates, any provision of these Legal Terms, or any applicable law or regulation.',
      ),
      pBlock(
        'Any use of the Services in violation of the foregoing violates these Legal Terms and may result in, among other things, termination or suspension of your rights to use the Services.',
      ),
    ],
  },
  {
    title: 'CONTRIBUTION LICENSE',
    paragraphs: [
      pBlock(
        'You and Services agree that we may access, store, process, and use any information and personal data that you provide following the terms of the Privacy Policy and your choices (including settings).',
      ),
      pBlock(
        'By submitting suggestions or other feedback regarding the Services, you agree that we can use and share such feedback for any purpose without compensation to you.',
      ),
      pBlock(
        'We do not assert any ownership over your Contributions. You retain full ownership of all of your Contributions and any intellectual property rights or other proprietary rights associated with your Contributions.',
      ),
      pBlock(
        'We are not liable for any statements or representations in your Contributions provided by you in any area on the Services. You are solely responsible for your Contributions to the Services and you expressly agree to exonerate us from any and all responsibility and to refrain from any legal action against us regarding your Contributions.',
      ),
    ],
  },
  {
    title: 'SERVICES MANAGEMENT',
    paragraphs: [
      pBlock(
        'We reserve the right, but not the obligation, to: (1) monitor the Services for violations of these Legal Terms; (2) take appropriate legal action against anyone who, in our sole discretion, violates the law or these Legal Terms, including without limitation, reporting such user to law enforcement authorities; (3) in our sole discretion and without limitation, refuse, restrict access to, limit the availability of, or disable (to the extent technologically feasible) any of your Contributions or any portion thereof; (4) in our sole discretion and without limitation, notice, or liability, to remove from the Services or otherwise disable all files and content that are excessive in size or are in any way burdensome to our systems; and (5) otherwise manage the Services in a manner designed to protect our rights and property and to facilitate the proper functioning of the Services.',
      ),
    ],
  },
  {
    title: 'TERM AND TERMINATION',
    paragraphs: [
      pBlock(
        'These Legal Terms shall remain in full force and effect while you use the Services. WITHOUT LIMITING ANY OTHER PROVISION OF THESE LEGAL TERMS, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SERVICES (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, WARRANTY, OR COVENANT CONTAINED IN THESE LEGAL TERMS OR OF ANY APPLICABLE LAW OR REGULATION. WE MAY TERMINATE YOUR USE OR PARTICIPATION IN THE SERVICES OR DELETE YOUR ACCOUNT AND ANY CONTENT OR INFORMATION THAT YOU POSTED AT ANY TIME, WITHOUT WARNING, IN OUR SOLE DISCRETION.',
      ),
      pBlock(
        'If we terminate or suspend your account for any reason, you are prohibited from registering and creating a new account under your name, a fake or borrowed name, or the name of any third party, even if you may be acting on behalf of the third party. In addition to terminating or suspending your account, we reserve the right to take appropriate legal action, including without limitation pursuing civil, criminal, and injunctive redress.',
      ),
    ],
  },
  {
    title: 'MODIFICATIONS AND INTERRUPTIONS',
    paragraphs: [
      pBlock(
        'We reserve the right to change, modify, or remove the contents of the Services at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Services. We also reserve the right to modify or discontinue all or part of the Services without notice at any time.',
      ),
      pBlock(
        'We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Services.',
      ),
      pBlock(
        'We cannot guarantee the Services will be available at all times. We may experience hardware, software, or other problems or need to perform maintenance related to the Services, resulting in interruptions, delays, or errors. We reserve the right to change, revise, update, suspend, discontinue, or otherwise modify the Services at any time or for any reason without notice to you.',
      ),
      pBlock(
        'You agree that we have no liability whatsoever for any loss, damage, or inconvenience caused by your inability to access or use the Services during any downtime or discontinuance of the Services. Nothing in these Legal Terms will be construed to obligate us to maintain and support the Services or to supply any corrections, updates, or releases in connection therewith.',
      ),
    ],
  },
  {
    title: 'GOVERNING LAW',
    paragraphs: [
      pBlock(
        'These Legal Terms shall be governed by and defined following the laws of the United States and the State of Texas. Texas Solar and Roofing Pros and yourself irrevocably consent that the courts of Texas shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these Legal Terms.',
      ),
    ],
  },
  {
    title: 'DISPUTE RESOLUTION',
    paragraphs: [
      pWithBold('', 'Informal Negotiations'),
      pBlock(
        'To expedite resolution and control the cost of any dispute, controversy, or claim related to these Legal Terms (each a "Dispute" and collectively, the "Disputes") brought by either you or us (individually, a "Party" and collectively, the "Parties"), the Parties agree to first attempt to negotiate any Dispute (except those Disputes expressly provided below) informally for at least thirty (30) days before initiating arbitration. Such informal negotiations commence upon written notice from one Party to the other Party.',
      ),
      pWithBold('', 'Binding Arbitration'),
      pBlock(
        'Any dispute arising out of or in connection with these Legal Terms, including any question regarding its existence, validity, or termination, shall be referred to and finally resolved by the American Arbitration Association (AAA) under its Commercial Arbitration Rules. The tribunal shall consist of one arbitrator. The seat of the arbitration shall be Travis County, Texas. The language of the arbitration shall be English.',
      ),
    ],
  },
  {
    title: 'CORRECTIONS',
    paragraphs: [
      pBlock(
        'There may be information on the Services that contains typographical errors, inaccuracies, or omissions, including descriptions, pricing, availability, and various other information. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update the information on the Services at any time, without prior notice.',
      ),
    ],
  },
  {
    title: 'DISCLAIMER',
    paragraphs: [
      pBlock(
        "THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICES AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE MAKE NO WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE SERVICES' CONTENT OR THE CONTENT OF ANY WEBSITES OR MOBILE APPLICATIONS LINKED TO THE SERVICES AND WE WILL ASSUME NO LIABILITY OR RESPONSIBILITY FOR ANY (1) ERRORS, MISTAKES, OR INACCURACIES OF CONTENT AND MATERIALS, (2) PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THE SERVICES, (3) ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION AND/OR FINANCIAL INFORMATION STORED THEREIN, (4) ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THE SERVICES, (5) ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE WHICH MAY BE TRANSMITTED TO OR THROUGH THE SERVICES BY ANY THIRD PARTY, AND/OR (6) ANY ERRORS OR OMISSIONS IN ANY CONTENT AND MATERIALS OR FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF ANY CONTENT POSTED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE SERVICES. WE DO NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR ANY PRODUCT OR SERVICE ADVERTISED OR OFFERED BY A THIRD PARTY THROUGH THE SERVICES, ANY HYPERLINKED WEBSITE, OR ANY WEBSITE OR MOBILE APPLICATION FEATURED IN ANY BANNER OR OTHER ADVERTISING, AND WE WILL NOT BE A PARTY TO OR IN ANY WAY BE RESPONSIBLE FOR MONITORING ANY TRANSACTION BETWEEN YOU AND ANY THIRD-PARTY PROVIDERS OF PRODUCTS OR SERVICES. AS WITH THE PURCHASE OF A PRODUCT OR SERVICE THROUGH ANY MEDIUM OR IN ANY ENVIRONMENT, YOU SHOULD USE YOUR BEST JUDGMENT AND EXERCISE CAUTION WHERE APPROPRIATE.",
      ),
    ],
  },
  {
    title: 'LIMITATIONS OF LIABILITY',
    paragraphs: [
      pBlock(
        'IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.',
      ),
    ],
  },
  {
    title: 'INDEMNIFICATION',
    paragraphs: [
      pBlock(
        "You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or demand, including reasonable attorneys' fees and expenses, made by any third party due to or arising out of: (1) your Contributions; (2) use of the Services; (3) breach of these Legal Terms; (4) any breach of your representations and warranties set forth in these Legal Terms; (5) your violation of the rights of a third party, including but not limited to intellectual property rights; or (6) any overt harmful act toward any other user of the Services with whom you connected via the Services. Notwithstanding the foregoing, we reserve the right, at your expense, to assume the exclusive defense and control of any matter for which you are required to indemnify us, and you agree to cooperate, at your expense, with our defense of such claims. We will use reasonable efforts to notify you of any such claim, action, or proceeding which is subject to this indemnification upon becoming aware of it.",
      ),
    ],
  },
  {
    title: 'ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES',
    paragraphs: [
      pBlock(
        'Visiting the Services, sending us emails, and completing online forms constitute electronic communications. You consent to receive electronic communications, and you agree that all agreements, notices, disclosures, and other communications we provide to you electronically, via email and on the Services, satisfy any legal requirement that such communication be in writing.',
      ),
      pBlock(
        'YOU HEREBY AGREE TO THE USE OF ELECTRONIC SIGNATURES, CONTRACTS, ORDERS, AND OTHER RECORDS, AND TO ELECTRONIC DELIVERY OF NOTICES, POLICIES, AND RECORDS OF TRANSACTIONS INITIATED OR COMPLETED BY US OR VIA THE SERVICES. You hereby waive any rights or requirements under any statutes, regulations, rules, ordinances, or other laws in any jurisdiction which require an original signature or delivery or retention of non-electronic records, or to payments or the granting of credits by any means other than electronic means.',
      ),
    ],
  },
  {
    title: 'MISCELLANEOUS',
    paragraphs: [
      pBlock(
        'These Legal Terms and any policies or operating rules posted by us on the Services or in respect to the Services constitute the entire agreement and understanding between you and us. Our failure to exercise or enforce any right or provision of these Legal Terms shall not operate as a waiver of such right or provision. These Legal Terms operate to the fullest extent permissible by law. We may assign any or all of our rights and obligations to others at any time. We shall not be responsible or liable for any loss, damage, delay, or failure to act caused by any cause beyond our reasonable control. If any provision or part of a provision of these Legal Terms is determined to be unlawful, void, or unenforceable, that provision or part of the provision is deemed severable from these Legal Terms and does not affect the validity and enforceability of any remaining provisions. There is no joint venture, partnership, employment or agency relationship created between you and us as a result of these Legal Terms or use of the Services. You agree that these Legal Terms will not be construed against us by virtue of having drafted them. You hereby waive any and all defenses you may have based on the electronic form of these Legal Terms and the lack of signing by the parties hereto to execute these Legal Terms.',
      ),
    ],
  },
  {
    title: 'CONTACT US',
    paragraphs: [
      pt('normal', 'If you have questions about these Legal Terms, please contact us at:'),
      pt(
        'normal',
        'Texas Solar and Roofing Pros\n1700 Pagedale Cove\nCedar Park, TX 78613\nUnited States\nPhone: (512) 775-0561\nEmail: info@texas-srp.com',
      ),
    ],
  },
]

const body = [
  pt('normal', 'Last updated June 21, 2026'),
  pt('normal', ''), // spacer
  pt('normal', 'AGREEMENT TO OUR LEGAL TERMS'),
  pBlock(
    'These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Texas Solar and Roofing Pros ("Company," "we," "us," or "our"), concerning your access to and use of the https://texassolarandroofingpros.com website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Services").',
  ),
  pBlock(
    'Supplemental terms and conditions or documents that may be posted on the Services from time to time are hereby expressly incorporated herein by reference. We reserve the right, in our sole discretion, to make changes or modifications to these Legal Terms at any time and for any reason.',
  ),
  pBlock(
    'The Services are intended for users who are at least 18 years old. Persons under the age of 18 are not permitted to use or register for the Services.',
  ),
  pt('normal', ''), // spacer

  // TABLE OF CONTENTS
  pt('h2', 'Table of Contents', { key: 'toc-heading' }),
  ...sections.map((s, i) => tocItem(i + 1, s.title)),

  pt('normal', ''), // spacer

  // CONTENT SECTIONS
  ...sections.flatMap((s, i) => [
    h2Block(i + 1, s.title),
    ...s.paragraphs.flatMap((p) => [p, pt('normal', '')]),
  ]),
]

// Also update the fixture placeholder
const fixturePath = resolve(import.meta.dirname, '..', 'src/lib/platform/fixtures.js')
let fixtureSrc = readFileSync(fixturePath, 'utf-8')
// The fixture placeholder is already set — no content update needed
// (seed script skips existing pages, so Sanity content is authoritative)

// Trim trailing empty blocks
while (body.length > 0 && body[body.length - 1].children[0]?.text === '') {
  body.pop()
}

const siteRecord = await client.fetch(`*[_type == "site" && slug.current == $slug][0]{_id}`, {
  slug: 'texas-solar-and-roofing-pros',
})

if (!siteRecord) {
  console.error('Site not found in Sanity')
  process.exit(1)
}

const doc = {
  _id: 'page-terms',
  _type: 'page',
  title: 'Terms of Use',
  description:
    'Terms governing use of the Texas Solar and Roofing Pros website, informational content, and request forms.',
  site: { _type: 'reference', _ref: siteRecord._id },
  pageType: 'page',
  templateLevel: 'hero',
  slug: { _type: 'slug', current: 'terms' },
  sections: [
    {
      _key: 'section-1-terms-of-use',
      _type: 'articleSection',
      type: 'article',
      eyebrow: 'Legal',
      title: 'Terms of Use',
      body,
    },
    {
      _key: 'section-2-terms-questions',
      _type: 'faqSection',
      type: 'faq',
      title: 'Terms questions',
      items: [
        {
          _key: 'faq-item-1',
          _type: 'pageFaqItem',
          question: 'Can site content be outdated or change over time?',
          answer:
            'Yes. We try to keep content current, but programs, incentives, insurance rules, product availability, and pricing can change. The site is not a guarantee that any specific offer, figure, or policy treatment is currently available.',
        },
        {
          _key: 'faq-item-2',
          _type: 'pageFaqItem',
          question: 'Does this site guarantee results or savings?',
          answer:
            'No. Results depend on the property, usage, roof condition, financing, utility rates, weather, workmanship, and other factors outside a simple web page.',
        },
        {
          _key: 'faq-item-3',
          _type: 'pageFaqItem',
          question: 'How do I contact you about these terms?',
          answer:
            'Email info@texassolarandroofingpros.com if you have a question about site use or need to raise an issue related to these terms.',
        },
      ],
    },
  ],
}

await client.createOrReplace(doc)
console.log(
  `Updated Sanity document: page-terms (${body.length} PT blocks, ${sections.length} content sections + TOC)`,
)
