import { gql } from "@apollo/client";

export const BASIC_INFO_FRAGMENT = gql`
  fragment BasicInfoFields on BasicInfo {
    firstName
    lastName
    email
    phone
    mobilePhone
    alternateEmail
    preferredName
    salutation
  }
`;

export const PROFESSIONAL_FRAGMENT = gql`
  fragment ProfessionalFields on Professional {
    jobTitle
    department
    company {
      id
      name
      domain
      industry
    }
    seniority
    yearsOfExperience
    skills
  }
`;

export const ADDRESS_FRAGMENT = gql`
  fragment AddressFields on Address {
    street
    street2
    city
    state
    postalCode
    country
    timezone
  }
`;

export const SOCIAL_MEDIA_FRAGMENT = gql`
  fragment SocialMediaFields on SocialMedia {
    linkedIn
    twitter
    facebook
    instagram
    github
    website
  }
`;

export const COMMUNICATION_PREFERENCE_FRAGMENT = gql`
  fragment CommunicationPreferenceFields on CommunicationPreference {
    id
    method
    value
    primary
    optOut
    verified
    verifiedAt
  }
`;

export const LIFECYCLE_FRAGMENT = gql`
  fragment LifeCycleFields on LifeCycle {
    stage
    leadStatus
    status
    source
    originalSource
    becameCustomerDate
    becameLeadDate
    tags
  }
`;

export const INTELLIGENCE_FRAGMENT = gql`
  fragment IntelligenceFields on Intelligence {
    engagementScore
    responseRate
    lastActivityDate
    lastContactedDate
    lastEmailDate
    lastCallDate
    lastMeetingDate
    activityCounts {
      total
      notes
      calls
      emails
      meetings
      tasks
    }
    dealMetrics {
      totalDeals
      openDeals
      wonDeals
      lostDeals
      totalValue
      wonValue
    }
    ticketMetrics {
      totalTickets
      openTickets
      resolvedTickets
      averageResolutionTime
    }
    preferredContactMethod
    bestTimeToContact {
      dayOfWeek
      hourOfDay
    }
    sentiment
    lastCalculatedAt
  }
`;

export const METADATA_FRAGMENT = gql`
  fragment MetadataFields on Metadata {
    owner {
      _id
      firstName
      secondName
      email
    }
    createdBy {
      _id
      firstName
      secondName
      email
    }
    updatedBy {
      _id
      firstName
      secondName
      email
    }
    createdAt
    updatedAt
    lastViewedAt
    lastViewedBy {
      _id
      firstName
      secondName
      email
    }
    importId
    externalId
  }
`;


export const CREATE_CONTACT = gql`
  mutation CreateContact(
    $basicInfo: BasicInfoInput!
    $professional: ProfessionalInput
    $address: AddressInput
    $socialMedia: SocialInput
    $communicationPreferences: [CommunicationPreferenceInput]
    $lifeCycle: LifecycleInput
    $ownerId: ID
  ) {
    createContact(
      basicInfo: $basicInfo
      professional: $professional
      address: $address
      socialMedia: $socialMedia
      communicationPreferences: $communicationPreferences
      lifeCycle: $lifeCycle
      ownerId: $ownerId
    ) {
      success
      message
      contact {
        _id
        basicInfo {
          firstName
          lastName
          email
        }
        lifeCycle {
          stage
          leadStatus
        }
      }
    }
  }
`;

export const UPDATE_CONTACT_BASIC_INFO = gql`
  mutation UpdateContactBasicInfo($id: ID!, $basicInfo: BasicInfoInput!) {
    updateContactBasicInfo(id: $id, basicInfo: $basicInfo) {
      success
      message
      contact {
        _id
        basicInfo {
          firstName
          lastName
          email
          phone
          mobilePhone
          salutation
        }
      }
    }
  }
`;

export const UPDATE_CONTACT_PROFESSIONAL = gql`
  mutation UpdateContactProfessional($id: ID!, $professional: ProfessionalInput!) {
    updateContactProfessional(id: $id, professional: $professional) {
      success
      message
      contact {
        _id
        professional {
          jobTitle
          department
          company {
            id
            name
          }
        }
      }
    }
  }
`;

export const UPDATE_CONTACT_LIFECYCLE = gql`
  mutation UpdateContactLifecycle($id: ID!, $lifeCycle: LifecycleInput!) {
    updateContactLifecycle(id: $id, lifeCycle: $lifeCycle) {
      success
      message
      contact {
        _id
        lifecycle {
          stage
          leadStatus
          status
          tags
        }
      }
    }
  }
`;

export const UPDATE_CONTACT = gql`
  mutation UpdateContact(
    $id: ID!
    $basicInfo: BasicInfoInput
    $professional: ProfessionalInput
    $address: AddressInput
    $socialMedia: SocialInput
    $communicationPreferences: [CommunicationPreferenceInput]
    $lifeCycle: LifecycleInput
  ) {
    updateContact(
      id: $id
      basicInfo: $basicInfo
      professional: $professional
      address: $address
      socialMedia: $socialMedia
      communicationPreferences: $communicationPreferences
      lifeCycle: $lifeCycle
    ) {
      success
      message
      contact {
        _id
        basicInfo {
          firstName
          lastName
          email
        }
      }
    }
  }
`;

export const DELETE_CONTACT = gql`
  mutation DeleteContact($id: ID!) {
    deleteContact(id: $id) {
      success
      message
    }
  }
`;

export const RESTORE_CONTACT = gql`
  mutation RestoreContact($id: ID!) {
    restoreContact(id: $id) {
      success
      message
      contact {
        _id
        lifecycle {
          status
        }
      }
    }
  }
`;

export const ADD_ACTIVITY = gql`
  mutation AddActivity($contactId: ID!, $activity: ActivityInput!) {
    addActivity(contactId: $contactId, activity: $activity) {
      success
      message
      contact {
        _id
        intelligence {
          lastActivityDate
          activityCounts {
            total
            notes
            calls
            emails
            meetings
            tasks
          }
        }
      }
    }
  }
`;

export const UPDATE_ACTIVITY = gql`
  mutation UpdateActivity($contactId: ID!, $activityId: ID!, $activity: ActivityInput!) {
    updateActivity(contactId: $contactId, activityId: $activityId, activity: $activity) {
      success
      message
      contact {
        _id
      }
    }
  }
`;

export const DELETE_ACTIVITY = gql`
  mutation DeleteActivity($contactId: ID!, $activityId: ID!) {
    deleteActivity(contactId: $contactId, activityId: $activityId) {
      success
      message
      contact {
        _id
        intelligence {
          activityCounts {
            total
          }
        }
      }
    }
  }
`;

export const ADD_DEAL = gql`
  mutation AddDeal($contactId: ID!, $deal: DealInput!) {
    addDeal(contactId: $contactId, deal: $deal) {
      success
      message
      contact {
        _id
        intelligence {
          dealMetrics {
            totalDeals
            openDeals
            totalValue
          }
        }
      }
    }
  }
`;

export const UPDATE_DEAL = gql`
  mutation UpdateDeal($contactId: ID!, $dealId: ID!, $deal: DealInput!) {
    updateDeal(contactId: $contactId, dealId: $dealId, deal: $deal) {
      success
      message
      contact {
        _id
        intelligence {
          dealMetrics {
            totalDeals
            openDeals
            wonDeals
            totalValue
            wonValue
          }
        }
      }
    }
  }
`;

export const REMOVE_DEAL = gql`
  mutation RemoveDeal($contactId: ID!, $dealId: ID!) {
    removeDeal(contactId: $contactId, dealId: $dealId) {
      success
      message
      contact {
        _id
        intelligence {
          dealMetrics {
            totalDeals
            openDeals
          }
        }
      }
    }
  }
`;

export const ADD_TICKET = gql`
  mutation AddTicket($contactId: ID!, $ticket: TicketInput!) {
    addTicket(contactId: $contactId, ticket: $ticket) {
      success
      message
      contact {
        _id
        intelligence {
          ticketMetrics {
            totalTickets
            openTickets
          }
        }
      }
    }
  }
`;

export const UPDATE_TICKET = gql`
  mutation UpdateTicket($contactId: ID!, $ticketId: ID!, $ticket: TicketInput!) {
    updateTicket(contactId: $contactId, ticketId: $ticketId, ticket: $ticket) {
      success
      message
      contact {
        _id
        intelligence {
          ticketMetrics {
            openTickets
            resolvedTickets
          }
        }
      }
    }
  }
`;

export const REMOVE_TICKET = gql`
  mutation RemoveTicket($contactId: ID!, $ticketId: ID!) {
    removeTicket(contactId: $contactId, ticketId: $ticketId) {
      success
      message
      contact {
        _id
        intelligence {
          ticketMetrics {
            totalTickets
            openTickets
          }
        }
      }
    }
  }
`;

export const ADD_ATTACHMENT = gql`
  mutation AddAttachment($contactId: ID!, $attachment: AttachmentInput!) {
    addAttachment(contactId: $contactId, attachment: $attachment) {
      success
      message
      contact {
        _id
      }
    }
  }
`;

export const DELETE_ATTACHMENT = gql`
  mutation DeleteAttachment($contactId: ID!, $attachmentId: ID!) {
    deleteAttachment(contactId: $contactId, attachmentId: $attachmentId) {
      success
      message
      contact {
        _id
      }
    }
  }
`;

export const ADD_COMMUNICATION_PREFERENCE = gql`
  mutation AddCommunicationPreference(
    $contactId: ID!
    $preference: CommunicationPreferenceInput!
  ) {
    addCommunicationPreference(contactId: $contactId, preference: $preference) {
      success
      message
      contact {
        _id
        communicationPreferences {
          method
          value
          primary
        }
      }
    }
  }
`;

export const CHANGE_CONTACT_OWNER = gql`
  mutation ChangeContactOwner($contactId: ID!, $newOwnerId: ID!) {
    changeContactOwner(contactId: $contactId, newOwnerId: $newOwnerId) {
      success
      message
      contact {
        _id
        metadata {
          owner {
            _id
            firstName
            lastName
          }
        }
      }
    }
  }
`;

export const ADD_TAGS = gql`
  mutation AddTags($contactId: ID!, $tags: [String]!) {
    addTags(contactId: $contactId, tags: $tags) {
      success
      message
      contact {
        _id
        lifecycle {
          tags
        }
      }
    }
  }
`;

export const REMOVE_TAGS = gql`
  mutation RemoveTags($contactId: ID!, $tags: [String]!) {
    removeTags(contactId: $contactId, tags: $tags) {
      success
      message
      contact {
        _id
        lifecycle {
          tags
        }
      }
    }
  }
`;

export const MERGE_CONTACTS = gql`
  mutation MergeContacts($primaryContactId: ID!, $secondaryContactId: ID!) {
    mergeContacts(
      primaryContactId: $primaryContactId
      secondaryContactId: $secondaryContactId
    ) {
      success
      message
      contact {
        _id
        basicInfo {
          firstName
          lastName
          email
        }
      }
    }
  }
`;

export const BULK_UPDATE_CONTACTS = gql`
  mutation BulkUpdateContacts($contactIds: [ID]!, $updates: JSON!) {
    bulkUpdateContacts(contactIds: $contactIds, updates: $updates) {
      success
      message
      modifiedCount
    }
  }
`;

export const BULK_DELETE_CONTACTS = gql`
  mutation BulkDeleteContacts($contactIds: [ID]!) {
    bulkDeleteContacts(contactIds: $contactIds) {
      success
      message
      modifiedCount
    }
  }
`;

export const BULK_ADD_TAGS = gql`
  mutation BulkAddTags($contactIds: [ID]!, $tags: [String]!) {
    bulkAddTags(contactIds: $contactIds, tags: $tags) {
      success
      message
      modifiedCount
    }
  }
`;

export const RECALCULATE_INTELLIGENCE = gql`
  mutation RecalculateIntelligence($contactId: ID!) {
    recalculateIntelligence(contactId: $contactId) {
      success
      message
      contact {
        _id
        intelligence {
          engagementScore
          responseRate
          lastActivityDate
        }
      }
    }
  }
`;

export const UPDATE_BASIC_INFO = gql`
  mutation UpdateBasicInfo($id: ID!, $basicInfo: BasicInfoInput!) {
    updateBasicInfo(id: $id, basicInfo: $basicInfo) {
      success
      message
      contact {
        _id
        basicInfo {
          firstName
          lastName
          email
          phone
          mobilePhone
          salutation
        }
      }
    }
  }
`;

export const UPDATE_PROFESSIONAL = gql`
  mutation UpdateProfessional($id: ID!, $professional: ProfessionalInput!) {
    updateProfessional(id: $id, professional: $professional) {
      success
      message
      contact {
        _id
        basicInfo {
          firstName
          lastName
          email
          phone
          mobilePhone
          salutation
        }
      }
    }
  }
`;

export const UPDATE_ADDRESS = gql`
  mutation UpdateAddress($id: ID!, $address: AddressInput!) {
    updateAddress(id: $id, address: $address) {
      success
      message
      contact {
        _id
        basicInfo {
          firstName
          lastName
          email
          phone
          mobilePhone
          salutation
        }
      }
    }
  }
`;

export const UPDATE_SOCIAL_MEDIA = gql`
  mutation UpdateSocialMedia($id: ID!, $socialMedia: SocialInput!) {
    updateSocialMedia(id: $id, socialMedia: $socialMedia) {
      success
      message
      contact {
        _id
        basicInfo {
          firstName
          lastName
          email
          phone
          mobilePhone
          salutation
        }
      }
    }
  }
`;

export const UPDATE_COMMUNICATION_PREFERENCES = gql`
  ${COMMUNICATION_PREFERENCE_FRAGMENT}
  ${METADATA_FRAGMENT}
  
  mutation UpdateCommunicationPreferences(
    $id: ID!
    $preferences: [CommunicationPreferenceInput]!
  ) {
    updateCommunicationPreferences(id: $id, preferences: $preferences) {
      id
      communicationPreferences {
        ...CommunicationPreferenceFields
      }
      metadata {
        ...MetadataFields
      }
    }
  }
`;

export const UPDATE_LIFECYCLE = gql`
  ${LIFECYCLE_FRAGMENT}
  ${METADATA_FRAGMENT}
  
  mutation UpdateLifeCycle($id: ID!, $input: LifeCycleInput!) {
    updateLifeCycle(id: $id, input: $input) {
      id
      lifeCycle {
        ...LifeCycleFields
      }
      metadata {
        ...MetadataFields
      }
    }
  }
`;