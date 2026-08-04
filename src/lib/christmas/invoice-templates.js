/*
 * Invoice template registry. New templates are added here and the renderer
 * (src/lib/christmas/invoice-pdf.js) dispatches on `templateKey`. The admin
 * builder and settings page both read this list, so adding an entry here is
 * all that's needed to make a template selectable in the UI.
 */

export const INVOICE_TEMPLATES = [
  {
    key: 'christmas-classic',
    label: 'Christmas Lights — Classic',
    description: 'Pine green header, ornament + string-light accents, custom package line items.',
  },
]

export const DEFAULT_INVOICE_TEMPLATE_KEY = 'christmas-classic'

export function getInvoiceTemplate(key) {
  return INVOICE_TEMPLATES.find((template) => template.key === key) || INVOICE_TEMPLATES[0]
}
