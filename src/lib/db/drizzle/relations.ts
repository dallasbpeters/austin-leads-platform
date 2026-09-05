import { relations } from 'drizzle-orm/relations'
import {
  documentAuditEvents,
  documentClients,
  documentLibraryItems,
  documentRecipients,
  documentSignatureRequests,
} from './schema'

export const documentAuditEventsRelations = relations(documentAuditEvents, ({ one }) => ({
  documentSignatureRequest: one(documentSignatureRequests, {
    fields: [documentAuditEvents.requestId],
    references: [documentSignatureRequests.id],
  }),
  documentClient: one(documentClients, {
    fields: [documentAuditEvents.clientId],
    references: [documentClients.id],
  }),
}))

export const documentSignatureRequestsRelations = relations(documentSignatureRequests, ({ one, many }) => ({
  documentAuditEvents: many(documentAuditEvents),
  documentClient: one(documentClients, {
    fields: [documentSignatureRequests.clientId],
    references: [documentClients.id],
  }),
  documentLibraryItems: many(documentLibraryItems),
  documentRecipients: many(documentRecipients),
}))

export const documentClientsRelations = relations(documentClients, ({ many }) => ({
  documentAuditEvents: many(documentAuditEvents),
  documentSignatureRequests: many(documentSignatureRequests),
  documentLibraryItems: many(documentLibraryItems),
  documentRecipients: many(documentRecipients),
}))

export const documentLibraryItemsRelations = relations(documentLibraryItems, ({ one }) => ({
  documentClient: one(documentClients, {
    fields: [documentLibraryItems.clientId],
    references: [documentClients.id],
  }),
  documentSignatureRequest: one(documentSignatureRequests, {
    fields: [documentLibraryItems.requestId],
    references: [documentSignatureRequests.id],
  }),
}))

export const documentRecipientsRelations = relations(documentRecipients, ({ one }) => ({
  documentSignatureRequest: one(documentSignatureRequests, {
    fields: [documentRecipients.requestId],
    references: [documentSignatureRequests.id],
  }),
  documentClient: one(documentClients, {
    fields: [documentRecipients.clientId],
    references: [documentClients.id],
  }),
}))
