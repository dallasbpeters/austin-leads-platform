import { Fragment } from 'react'

import CaseStudyGallery from '@/components/case-study-gallery'
import { getImageUrl } from '@/lib/platform/imageSource'
import { cleanRuntimeString } from '@/lib/sanity/stega'
import { getSanityEditAttributes } from '@/lib/sanity/visualEditing'
import { summarizeBilling } from '@/sanity/lib/caseStudies'

/* ── shared class recipes ─────────────────────────────────────────────────────
   Tailwind utilities rather than bespoke class names: the original markup
   referenced a `case-study` / `ds-table` stylesheet that was never written, so
   every block rendered unstyled. These constants keep the repetition down while
   staying in the same utility vocabulary as the rest of the site sections.   */

const SHELL = 'mx-auto w-full max-w-5xl pt-20 px-4 md:px-6'
const SECTION = 'py-4'
const META = 'text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase'
const H2 = 'text-foreground mb-8 text-2xl font-medium tracking-normal md:text-3xl'
const SUBKEY = 'text-muted-foreground mb-2 block text-[11px] font-semibold tracking-[0.16em] uppercase'
const TH = 'text-muted-foreground px-3 py-3 text-[11px] font-semibold tracking-[0.12em] uppercase'
const TD = 'text-foreground px-3 py-3 align-top'
const NUM_COL = 'text-right tabular-nums'

/* ── visual editing ───────────────────────────────────────────────────────────
   This site drives click-to-edit with `data-sanity` attributes rather than stega,
   so every editable block has to opt in explicitly. `edit(path)` is threaded down
   to each section instead of using context, which React server components cannot
   consume.                                                                     */

const makeEdit = (documentId) => (path) =>
  getSanityEditAttributes({ documentId, documentType: 'caseStudy', path })

/** Address one row of a Sanity array by its stable `_key`. */
const itemPath = (field, key) => `${field}[_key=="${String(key).replaceAll('"', '\\"')}"]`

/* ── formatters ──────────────────────────────────────────────────────────── */

/** Two letters for the field-note chip, derived when the record has none. */
const initialsFor = (person) => {
  if (person?.initials) {
    return person.initials
  }
  if (!person?.name) {
    return '··'
  }
  return String(cleanRuntimeString(person.name) || '')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

const money = (value) => (typeof value === 'number' ? `$${value}` : '—')
const kwh = (value) => (typeof value === 'number' ? value.toLocaleString('en-US') : '—')
const roleLabel = (role) => (role ? role.replaceAll('-', ' ') : '')

const placeLine = (location) =>
  [location?.city, location?.neighborhood, location?.utility].filter(Boolean).join(' · ')

/** Fixed locale + UTC so the server and client agree on the rendered date. */
const longDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-US', { dateStyle: 'long', timeZone: 'UTC' }) : ''

/** "IRC 2021 · NEC 2020" — only the editions that are actually set. */
const formatEditions = (codeEditions) =>
  [
    codeEditions?.irc && `IRC ${codeEditions.irc}`,
    codeEditions?.ifc && `IFC ${codeEditions.ifc}`,
    codeEditions?.nec && `NEC ${codeEditions.nec}`,
  ]
    .filter(Boolean)
    .join(' · ')

const creditFor = (person) => [person.name, roleLabel(person.role)].filter(Boolean).join(' · ')

/* ── sections ────────────────────────────────────────────────────────────────
   Each section owns its own empty check and returns null, so the root
   component composes them with no branching of its own. This is what keeps
   every function under the complexity ceiling.                              */

const Byline = ({ crew, publishedAt, edit }) => {
  const credits = crew.map(creditFor).join(' · ')
  const stamp = longDate(publishedAt)
  const line = [credits, stamp].filter(Boolean).join(' · ')
  if (!line) {
    return null
  }
  return (
    <p className={`${META} mt-6`} {...edit('crew')}>
      {line}
    </p>
  )
}

const KeyStats = ({ stats, edit }) => {
  if (!stats.length) {
    return null
  }
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          className="border-border bg-card rounded-xl border p-5"
          key={stat._key}
          {...edit(itemPath('keyStats', stat._key))}
        >
          <div className="text-foreground text-2xl font-semibold tabular-nums">{stat.value}</div>
          <div className={`${META} mt-1`}>{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

const ArticleHeader = ({ title, dek, location, publishedAt, crew, keyStats, edit }) => {
  const place = placeLine(location)
  return (
    <header className={`${SHELL} pb-6`}>
      {place ? (
        <p className={META} {...edit('location')}>
          {place}
        </p>
      ) : null}
      <h1
        className="text-foreground mt-4 text-4xl leading-tight font-medium tracking-tight md:text-5xl"
        {...edit('title')}
      >
        {title}
      </h1>
      {dek ? (
        <p className="text-muted-foreground mt-5 max-w-3xl text-lg leading-relaxed" {...edit('dek')}>
          {dek}
        </p>
      ) : null}
      <Byline crew={crew} edit={edit} publishedAt={publishedAt} />
      <KeyStats edit={edit} stats={keyStats} />
    </header>
  )
}

const DrivewayNotes = ({ notes, edit }) => {
  if (!notes.length) {
    return null
  }
  return (
    <section className={`${SHELL} ${SECTION}`} data-od-id="case-driveway-notes">
      <h2 className={H2}>What you can see from the ground, and what we found once we were up there</h2>
      <div className="grid gap-8">
        {notes.map((note) => (
          <div
            className="border-border grid gap-6 border-t pt-6 md:grid-cols-2"
            key={note._key}
            {...edit(itemPath('drivewayNotes', note._key))}
          >
            <div>
              <span className={SUBKEY}>From the driveway</span>
              <p className="text-muted-foreground leading-relaxed">{note.seenFromGround}</p>
            </div>
            <div>
              <span className={SUBKEY}>On the roof</span>
              <p className="text-foreground leading-relaxed">{note.foundOnRoof}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

const FieldNoteAuthor = ({ author }) => {
  if (!author) {
    return null
  }
  return (
    <span className="mb-3 flex items-center gap-2">
      <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-full text-[10px] font-semibold tracking-[0.08em]">
        {initialsFor(author)}
      </span>
      <span className={META}>{creditFor(author)}</span>
    </span>
  )
}

const FieldNote = ({ note, edit }) => (
  <article
    className="border-border grid gap-4 border-t pt-6 md:grid-cols-[10rem_minmax(0,1fr)]"
    {...edit(itemPath('fieldNotes', note._key))}
  >
    <div className={`${META} tabular-nums`}>
      {note.day}
      {note.time ? <span className="text-foreground mt-1 block normal-case">{note.time}</span> : null}
    </div>
    <div>
      <FieldNoteAuthor author={note.author} />
      <p className="text-muted-foreground leading-relaxed">{note.note}</p>
      <p className="text-foreground mt-3 leading-relaxed">
        <strong className="font-semibold">Changed the plan:</strong> {note.outcome}
      </p>
    </div>
  </article>
)

const FieldNotes = ({ notes, edit }) => {
  if (!notes.length) {
    return null
  }
  return (
    <section className={`${SHELL} ${SECTION}`} data-od-id="case-field-notes">
      <h2 className={H2}>What the crew wrote down while the work was happening</h2>
      <div className="grid gap-8">
        {notes.map((note) => (
          <FieldNote edit={edit} key={note._key} note={note} />
        ))}
      </div>
    </section>
  )
}

const SpecRow = ({ row }) => (
  <tr className="border-border/60 border-t">
    <td className={`${TD} font-medium`}>{row.component}</td>
    <td className={TD}>{row.specification}</td>
    <td className={TD}>
      {row.codeRef ? (
        <span className="border-border text-foreground rounded-md border px-2 py-1 text-xs tabular-nums">
          {row.codeRef}
        </span>
      ) : (
        <span className="text-muted-foreground text-xs">manufacturer spec</span>
      )}
    </td>
    <td className={`${TD} text-muted-foreground`}>{row.rationale}</td>
  </tr>
)

const SpecGroup = ({ group, edit }) => (
  // Keyed fragment: the group header and its rows are siblings in one <tbody>,
  // so they cannot share a wrapper element. The group's edit target therefore sits
  // on its header cell rather than on a row wrapper.
  <Fragment>
    <tr>
      <th
        className="bg-secondary-100 text-foreground px-3 py-2 text-left text-sm font-semibold"
        colSpan={4}
        scope="colgroup"
        {...edit(itemPath('specGroups', group._key))}
      >
        {group.group}
        {group.summary ? (
          <span className="text-muted-foreground ml-2 font-normal tabular-nums">{group.summary}</span>
        ) : null}
      </th>
    </tr>
    {(group.rows ?? []).map((row) => (
      <SpecRow key={row._key} row={row} />
    ))}
  </Fragment>
)

const SpecTable = ({ groups, codeEditions, edit }) => {
  if (!groups.length) {
    return null
  }
  const editions = formatEditions(codeEditions)
  return (
    <section className={`${SHELL} ${SECTION}`} data-od-id="case-specs">
      <h2 className={H2}>View Project Specifications</h2>
      <div className="border-border overflow-x-auto rounded-xl border">
        <table className="w-full min-w-3xl border-collapse text-left text-sm">
          <thead>
            <tr className="border-border border-b">
              <th className={TH} scope="col">
                Component
              </th>
              <th className={TH} scope="col">
                Specification
              </th>
              <th className={`${TH} w-50`} scope="col">
                Code or standard
              </th>
              <th className={TH} scope="col">
                Why it is here
              </th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <SpecGroup edit={edit} group={group} key={group._key} />
            ))}
          </tbody>
        </table>
      </div>
      {editions ? (
        <p className={`${META} mt-3`} {...edit('codeEditions')}>
          {editions}.
        </p>
      ) : null}
    </section>
  )
}

const Timeline = ({ steps, edit }) => {
  if (!steps.length) {
    return null
  }
  return (
    <section className={`${SHELL} ${SECTION}`} data-od-id="case-timeline">
      <h2 className={H2}>Day by day, tear-off to power</h2>
      <div className="grid gap-6">
        {steps.map((step) => (
          <div
            className="border-border grid gap-2 border-t pt-5 md:grid-cols-[10rem_minmax(0,1fr)]"
            key={step._key}
            {...edit(itemPath('timeline', step._key))}
          >
            <span className={`${META} tabular-nums`}>{step.date}</span>
            <div>
              <strong className="text-foreground font-semibold">{step.title}</strong>
              {step.detail ? (
                <p className="text-muted-foreground mt-1 leading-relaxed">{step.detail}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

const BillingRow = ({ row, edit }) => (
  <tr className="border-border/60 border-t" {...edit(itemPath('billing', row._key))}>
    <td className={TD}>{row.month}</td>
    <td className={`${TD} ${NUM_COL}`}>{kwh(row.kWhUsed)}</td>
    <td className={`${TD} ${NUM_COL}`}>{kwh(row.kWhProduced)}</td>
    <td className={`${TD} ${NUM_COL}`}>{money(row.costWithout)}</td>
    <td className={`${TD} ${NUM_COL}`}>{money(row.costPaid)}</td>
  </tr>
)

const BillingTotals = ({ totals }) => {
  if (!totals) {
    return null
  }
  return (
    <tr className="border-border bg-secondary-100 border-t-2">
      <td className={TD}>
        <strong className="font-semibold">Average</strong>
      </td>
      <td className={`${TD} ${NUM_COL}`}>
        <strong className="font-semibold">{kwh(totals.kWhUsed)}</strong>
      </td>
      <td className={`${TD} ${NUM_COL}`}>
        <strong className="font-semibold">{kwh(totals.kWhProduced)}</strong>
      </td>
      <td className={`${TD} ${NUM_COL}`}>
        <strong className="font-semibold">{money(totals.costWithout)}</strong>
      </td>
      <td className={`${TD} ${NUM_COL}`}>
        <strong className="font-semibold">{money(totals.costPaid)}</strong>
      </td>
    </tr>
  )
}

const BillingTable = ({ rows, note, edit }) => {
  if (!rows.length) {
    return null
  }
  return (
    <section className={`${SHELL} ${SECTION}`} data-od-id="case-billing">
      <h2 className={H2}>First months on the meter</h2>
      <div className="border-border overflow-x-auto rounded-xl border">
        <table className="w-full min-w-2xl border-collapse text-left text-sm">
          <thead>
            <tr className="border-border border-b">
              <th className={TH} scope="col">
                Month
              </th>
              <th className={`${TH} ${NUM_COL}`} scope="col">
                Used
              </th>
              <th className={`${TH} ${NUM_COL}`} scope="col">
                Made
              </th>
              <th className={`${TH} ${NUM_COL}`} scope="col">
                Without
              </th>
              <th className={`${TH} ${NUM_COL}`} scope="col">
                Paid
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <BillingRow edit={edit} key={row._key} row={row} />
            ))}
            <BillingTotals totals={summarizeBilling(rows)} />
          </tbody>
        </table>
      </div>
      {note ? (
        <p className={`${META} mt-3`} {...edit('billingNote')}>
          {note}
        </p>
      ) : null}
    </section>
  )
}

const Limits = ({ limits, edit }) => {
  if (!limits.length) {
    return null
  }
  return (
    <section className={`bg-secondary-100 ${SECTION}`} data-od-id="case-limits">
      <div className={SHELL}>
        <h2 className={H2}>What they asked, and what we told them</h2>
        <div className="grid gap-8">
          {limits.map((limit) => (
            <div
              className="border-border grid gap-6 border-t pt-6 md:grid-cols-2"
              key={limit._key}
              {...edit(itemPath('limits', limit._key))}
            >
              <div>
                <span className={SUBKEY}>What they asked</span>
                <p className="text-muted-foreground leading-relaxed">{limit.claim}</p>
              </div>
              <div>
                <span className={SUBKEY}>What we told them</span>
                <p className="text-foreground leading-relaxed">{limit.reality}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const RelatedCard = ({ project }) => (
  <a
    className="border-border bg-card hover:border-primary/50 block rounded-xl border p-5 transition-colors"
    href={`/projects/${project.slug}`}
  >
    <p className={META}>{placeLine(project.location)}</p>
    <h3 className="text-foreground mt-2 text-lg font-medium">{project.title}</h3>
    {project.keyStat ? (
      <p className={`${META} mt-3`}>
        <span className="text-foreground tabular-nums">{project.keyStat.value}</span> ·{' '}
        {project.keyStat.label}
      </p>
    ) : null}
  </a>
)

const RelatedProjects = ({ projects, edit }) => {
  if (!projects.length) {
    return null
  }
  return (
    <section className={`${SHELL} ${SECTION} pb-12`} data-od-id="case-related">
      <h2 className={H2}>Other jobs nearby</h2>
      <div className="grid gap-6 md:grid-cols-3" {...edit('relatedProjects')}>
        {projects.map((project) => (
          <RelatedCard key={project._id} project={project} />
        ))}
      </div>
    </section>
  )
}

/* ── root ────────────────────────────────────────────────────────────────── */

/**
 * GROQ omits empty arrays as `null`, and a destructuring default only fires on
 * `undefined` — so `crew = []` would leave `null` in place and blow up on `.map()`.
 * Every optional list on a case study has to be coerced explicitly.
 */
const asArray = (value) => (Array.isArray(value) ? value : [])

/** Flatten gallery images to the plain shape the client slideshow expects. */
const toGalleryPhotos = (gallery) =>
  asArray(gallery)
    .map((photo, position) => ({
      key: photo?._key || `photo-${position}`,
      src: getImageUrl(photo, null, { width: 1600 }),
      alt: photo?.altText || '',
      caption: photo?.caption || '',
    }))
    .filter((photo) => photo.src)

/**
 * Case study article. Every block maps to one named field, so a new job
 * produces the same rhythm without a designer in the loop.
 */
const CaseStudyArticle = ({ caseStudy }) => {
  const { title, dek, location, publishedAt, codeEditions, billingNote } = caseStudy
  // Every section receives this so its blocks are click-to-edit targets in
  // Presentation. Returns `{}` when there is no document id, so the spread is a
  // no-op rather than a crash.
  const edit = makeEdit(caseStudy._id)

  return (
    <article className="text-foreground">
      <ArticleHeader
        crew={asArray(caseStudy.crew)}
        dek={dek}
        edit={edit}
        keyStats={asArray(caseStudy.keyStats)}
        location={location}
        publishedAt={publishedAt}
        title={title}
      />
      {/* Gallery position 1 is the lead image, the projects card, and the social
          share image. URLs resolve here so the client bundle carries no Sanity
          image config. */}
      <CaseStudyGallery editAttributes={edit('gallery')} images={toGalleryPhotos(caseStudy.gallery)} />
      <DrivewayNotes edit={edit} notes={asArray(caseStudy.drivewayNotes)} />
      <FieldNotes edit={edit} notes={asArray(caseStudy.fieldNotes)} />
      <SpecTable codeEditions={codeEditions} edit={edit} groups={asArray(caseStudy.specGroups)} />
      <Timeline edit={edit} steps={asArray(caseStudy.timeline)} />
      <BillingTable edit={edit} note={billingNote} rows={asArray(caseStudy.billing)} />
      <Limits edit={edit} limits={asArray(caseStudy.limits)} />
      <RelatedProjects edit={edit} projects={asArray(caseStudy.relatedProjects)} />
    </article>
  )
}

export default CaseStudyArticle
