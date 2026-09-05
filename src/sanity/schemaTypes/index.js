import cardType from './cardType'
import caseStudyType from './caseStudyType'
import crewCreditType from './crewCreditType'
import pageTypes from './page-type'
import siteType from './siteType'
import supportingTypes from './supportingTypes'

export const schemaTypes = [
  siteType,
  ...pageTypes,
  ...supportingTypes,
  cardType,
  caseStudyType,
  crewCreditType,
]
