import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from 'react-email'

const getPrimarySigningUrl = (recipients) =>
  recipients.find((recipient) => recipient.signingUrl)?.signingUrl || ''

const getRecipientSummary = (recipients) =>
  recipients
    .filter((recipient) => recipient.signingUrl)
    .map((recipient) => `${recipient.name || recipient.email}: ${recipient.signingUrl}`)

export const buildDocumentSignatureEmailText = ({ client, request, recipients, message }) => {
  const body = message?.body?.trim() || 'Please sign the document using the link below.'
  const primarySigningUrl = getPrimarySigningUrl(recipients)
  const links = getRecipientSummary(recipients)

  return [
    `Signature request: ${request.title}`,
    '',
    `Hello ${client?.name || 'there'},`,
    '',
    body,
    '',
    primarySigningUrl ? `Open document: ${primarySigningUrl}` : null,
    primarySigningUrl ? `Direct link: ${primarySigningUrl}` : null,
    primarySigningUrl ? '' : null,
    ...links,
    '',
    'Saved and tracked by Texas Solar & Roofing Pros.',
  ]
    .filter((line) => line != null)
    .join('\n')
}

export const DocumentSignatureEmail = ({ client, request, recipients, message }) => {
  const body = message?.body?.trim() || 'Please sign the document using the link below.'
  const primarySigningUrl = getPrimarySigningUrl(recipients)
  const previewText = `Signature request: ${request.title}`

  return (
    <Html lang="en">
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-[#f7f8fa] px-0 py-8 font-sans text-[#10202b]">
          <Container className="mx-auto w-full max-w-[680px] overflow-hidden rounded-[12px] border border-[#d8dee5] bg-white">
            <Section className="border-b border-[#d8dee5] px-7 py-6">
              <Text className="m-0 text-[12px] font-semibold tracking-[0.14em] text-[#5d6b77] uppercase">
                Signature request
              </Text>
              <Heading className="m-0 mt-2 text-[24px] leading-[1.25] text-[#10202b]">
                {request.title}
              </Heading>
            </Section>
            <Section className="px-7 py-6">
              <Text className="m-0 text-[15px] leading-[1.6] text-[#10202b]">
                Hello {client?.name || 'there'},
              </Text>
              <Text className="m-0 mt-5 text-[15px] leading-[1.6] text-[#10202b]">{body}</Text>
              {primarySigningUrl ? (
                <Section className="mt-6">
                  <Button
                    href={primarySigningUrl}
                    className="rounded-[8px] bg-[#0f3b54] px-5 py-3 text-[14px] font-bold text-white no-underline"
                  >
                    Open document
                  </Button>
                  <Text className="mt-3 text-[13px] leading-[1.5] text-[#5d6b77]">
                    Direct link: <Link href={primarySigningUrl}>{primarySigningUrl}</Link>
                  </Text>
                </Section>
              ) : null}
              {recipients.some((recipient) => recipient.signingUrl) ? (
                <Section className="mt-5">
                  {getRecipientSummary(recipients).map((line) => (
                    <Text key={line} className="m-0 mb-2 text-[13px] leading-[1.5] text-[#10202b]">
                      {line}
                    </Text>
                  ))}
                </Section>
              ) : null}
              <Text className="mt-5 text-[13px] leading-[1.5] text-[#5d6b77]">
                Saved and tracked by Texas Solar & Roofing Pros.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
