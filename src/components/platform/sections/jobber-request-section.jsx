import JobberWorkRequestEmbed from '@/components/jobber-work-request-embed'
import { cleanRuntimeHref, cleanRuntimeString } from '@/lib/sanity/stega'

/*
 * Jobber's online request form as a page section (Studio: "Jobber Request
 * Form"), so a request lands in Jobber as a Request with no copying. It uses
 * Jobber's own embed (jobber-work-request-embed.jsx). The form is the section's
 * own link when set, else the one in Site settings → Jobber.
 */
export const JobberRequestSection = ({ section, site, sectionId }) => {
  const requestFormUrl = cleanRuntimeHref(section?.jobberShareUrl) || site?.jobber?.requestFormUrl || null
  const title = cleanRuntimeString(section?.title)

  return (
    <section id={sectionId} className="jobber-request">
      <div className="jobber-request__inner">
        {section?.eyebrow || title || section?.description ? (
          <header className="jobber-request__head">
            {section.eyebrow ? <p className="jobber-request__eyebrow">{section.eyebrow}</p> : null}
            {title ? <h2 className="jobber-request__title">{title}</h2> : null}
            {section.description ? <p className="jobber-request__body">{section.description}</p> : null}
          </header>
        ) : null}
        <JobberWorkRequestEmbed requestFormUrl={requestFormUrl} className="jobber-request__form" />
      </div>
    </section>
  )
}

export default JobberRequestSection
