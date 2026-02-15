import { gql } from "@apollo/client";

const INTELLIGENCE_FRAGMENT = gql`
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

const CONTACT_BASIC_FRAGMENT = gql`
  fragment ContactBasicFields on Contact {
    _id
    basicInfo {
      firstName
      lastName
      email
      phone
      mobilePhone
      salutation
      preferredName
      alternateEmail
    }
    professional {
      jobTitle
      department
      seniority
      yearsOfExperience
      skills
      company {
        id
        name
        domain
        industry
      }
    }
    lifeCycle {
      stage
      leadStatus
      status
      source
      originalSource
      becameLeadDate
      becameCustomerDate
      tags
    }
    metadata {
      owner {
        _id
        firstName
        secondName
        email
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_CONTACTS = gql`
  ${CONTACT_BASIC_FRAGMENT}
  query GetContacts(
    $filter: ContactFilterInput
    $sort: ContactSortInput
    $pagination: PaginationInput
  ) {
    contacts(filter: $filter, sort: $sort, pagination: $pagination) {
      edges {
        node {
          ...ContactBasicFields
          intelligence {
            engagementScore
            lastActivityDate
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        currentPage
        totalPages
        itemsPerPage
      }
      totalCount
    }
  }
`;

export const GET_CONTACT_BY_ID = gql`
  ${CONTACT_BASIC_FRAGMENT}
  ${INTELLIGENCE_FRAGMENT}
  query GetContactById($id: ID!) {
    contact(id: $id) {
      ...ContactBasicFields
      address {
        street
        street2
        city
        state
        postalCode
        country
        timezone
      }
      socialMedia {
        linkedIn
        twitter
        facebook
        instagram
        github
        website
      }
      communicationPreferences {
        method
        value
        primary
        optOut
        verified
        verifiedAt
      }
      activity {
        _id
        type
        direction
        subject
        body
        htmlBody
        status
        callDuration
        callOutcome
        callRecordingUrl
        meetingDuration
        meetingLocation
        meetingLink
        meetingAttendees
        taskPriority
        taskDueDate
        taskCompletedDate
        emailFrom
        emailTo
        emailCc
        emailBcc
        emailMessageId
        emailThreadId
        emailOpened
        emailClicked
        scheduledAt
        completedAt
        associatedDeal
        associatedTicket
        attachments {
          _id
          fileName
          fileUrl
          fileSize
          mimeType
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
        }
        createdAt
        updatedAt
      }
      deal {
        dealId
        name
        amount
        currency
        stage
        probability
        closeDate
        role
        isPrimary
        createdAt
        updatedAt
      }
      ticket {
        ticketId
        subject
        content
        status
        priority
        category
        assignedTo {
          _id
          firstName
          secondName
          email
        }
        resolvedAt
        closedAt
        createdAt
        updatedAt
      }
      attachments {
        _id
        fileName
        fileUrl
        fileSize
        mimeType
        category
        description
        uploadedBy {
          _id
          firstName
          secondName
          email
        }
        uploadedAt
      }
      intelligence {
        ...IntelligenceFields
      }
    }
  }
`;

export const GET_CONTACT_ACTIVITIES = gql`
  query GetContactActivities(
    $contactId: ID!
    $types: [ActivityType]
    $status: ActivityStatus
    $startDate: Date
    $endDate: Date
    $pagination: PaginationInput
  ) {
    contactActivities(
      contactId: $contactId
      types: $types
      status: $status
      startDate: $startDate
      endDate: $endDate
      pagination: $pagination
    ) {
      _id
      type
      direction
      subject
      body
      status
      callDuration
      callOutcome
      meetingDuration
      meetingLocation
      meetingLink
      meetingAttendees
      taskPriority
      taskDueDate
      taskCompletedDate
      emailFrom
      emailTo
      emailCc
      scheduledAt
      completedAt
      attachments {
        _id
        fileName
        fileUrl
        fileSize
        mimeType
      }
      createdBy {
        _id
        firstName
        lastName
        email
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_CONTACT_DEALS = gql`
  query GetContactDeals(
    $contactId: ID!
    $stages: [DealStage]
    $pagination: PaginationInput
  ) {
    contactDeals(contactId: $contactId, stages: $stages, pagination: $pagination) {
      dealId
      name
      amount
      currency
      stage
      probability
      closeDate
      role
      isPrimary
      createdAt
      updatedAt
    }
  }
`;

export const GET_CONTACT_TICKETS = gql`
  query GetContactTickets(
    $contactId: ID!
    $statuses: [TicketStatus]
    $priorities: [Priority]
    $pagination: PaginationInput
  ) {
    contactTickets(
      contactId: $contactId
      statuses: $statuses
      priorities: $priorities
      pagination: $pagination
    ) {
      ticketId
      subject
      content
      status
      priority
      category
      assignedTo {
        _id
        firstName
        lastName
        email
      }
      resolvedAt
      closedAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_CONTACT_INTELLIGENCE = gql`
  ${INTELLIGENCE_FRAGMENT}
  query GetContactIntelligence($contactId: ID!) {
    contactIntelligence(contactId: $contactId) {
      ...IntelligenceFields
    }
  }
`;

export const GET_CONTACT_STATS = gql`
  query GetContactStats($filter: ContactFilterInput) {
    contactStats(filter: $filter) {
      totalContacts
      byLifecycleStage
      byLeadStatus
      byOwner
      recentlyAdded
      recentlyUpdated
    }
  }
`;

export const SEARCH_CONTACTS = gql`
  query SearchContacts(
    $query: String!
    $filter: ContactFilterInput
    $pagination: PaginationInput
  ) {
    searchContacts(query: $query, filter: $filter, pagination: $pagination) {
      edges {
        node {
          _id
          basicInfo {
            firstName
            lastName
            email
            phone
          }
          professional {
            jobTitle
            company {
              name
            }
          }
          lifecycle {
            stage
            leadStatus
          }
        }
      }
      pageInfo {
        currentPage
        totalPages
        itemsPerPage
      }
      totalCount
    }
  }
`;