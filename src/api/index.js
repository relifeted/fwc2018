import moment from 'moment'

import client from './client'

import FIND_MATCH_BY_DATE from './gql/findMatchByDate.gql'
import GET_MATCH from './gql/getMatch.gql'
import CREATE_MATCH from './gql/createMatch.gql'
import UPDATE_MATCH from './gql/updateMatch.gql'
import GET_GROUP from './gql/getGroup.gql'
import CREATE_GROUP_RESULT from './gql/createGroupResult.gql'
import UPDATE_GROUP_RESULT from './gql/updateGroupResult.gql'
import GET_GROUP_RESULT from './gql/getGroupResult.gql'
import LIST_GROUPS from './gql/listGroups.gql'
import FIND_MATCH_BY_TYPE from './gql/findMatchByType.gql'

export async function findTodayMatches() {
  const today = moment()
    .utcOffset('+08:00')
    .format('YYYY-MM-DD')
  console.log('findTodayMatches today:', today)
  const { data, errors } = await client.query({
    query: FIND_MATCH_BY_DATE,
    variables: {
      matchDate: today,
    },
  })
  if (errors) {
    console.log('findTodayMatches errors:', JSON.stringify(errors))
  }
  const { findMatchByDate: matches } = data
  console.log('findTodayMatches matches:', JSON.stringify(matches))
  return matches
}

export async function findYesterdayMatches() {
  const yesterday = moment()
    .utcOffset('+08:00')
    .subtract(1, 'days')
    .format('YYYY-MM-DD')
  console.log('findYesterdayMatches yesterday:', yesterday)
  const { data, errors } = await client.query({
    query: FIND_MATCH_BY_DATE,
    variables: {
      matchDate: yesterday,
    },
  })
  if (errors) {
    console.log('findYesterdayMatches errors:', JSON.stringify(errors))
  }
  const { findMatchByDate: matches } = data
  console.log('findYesterdayMatches matches:', JSON.stringify(matches))
  return matches
}

export async function findTomorrowMatches() {
  const tomorrow = moment()
    .utcOffset('+08:00')
    .add(1, 'days')
    .format('YYYY-MM-DD')
  console.log('findYesterdayMatches tomorrow:', tomorrow)
  const { data, errors } = await client.query({
    query: FIND_MATCH_BY_DATE,
    variables: {
      matchDate: tomorrow,
    },
  })
  if (errors) {
    console.log('findTomorrowMatches errors:', JSON.stringify(errors))
  }
  const { findMatchByDate: matches } = data
  console.log('findTomorrowMatches matches:', JSON.stringify(matches))
  return matches
}

export async function getMatch(id) {
  const { data, errors } = await client.query({
    query: GET_MATCH,
    variables: {
      id,
    },
  })
  if (errors) {
    console.log('getMatch errors:', JSON.stringify(errors))
  }
  const { getMatch: match } = data
  // console.log('getMatch match:', JSON.stringify(match))
  return match
}

export async function createMatch(match) {
  const { data, errors } = await client.mutate({
    mutation: CREATE_MATCH,
    variables: {
      input: match,
    },
  })
  if (errors) {
    console.log('createMatch errors:', JSON.stringify(errors))
  }
  const { createMatch: result } = data
  // console.log('createMatch result:', JSON.stringify(result))
  return result
}

export async function updateMatch(match) {
  const { data, errors } = await client.mutate({
    mutation: UPDATE_MATCH,
    variables: {
      input: match,
    },
  })
  if (errors) {
    console.log('updateMatch errors:', JSON.stringify(errors))
  }
  const { updateMatch: result } = data
  // console.log('updateMatch result:', JSON.stringify(result))
  return result
}

export async function getGroup(id) {
  const { data, errors } = await client.query({
    query: GET_GROUP,
    variables: {
      id,
    },
  })
  if (errors) {
    console.log('getGroup errors:', JSON.stringify(errors))
  }
  const { getGroup: group } = data
  // console.log('getGroup group:', JSON.stringify(group))
  return group
}

export async function listGroups() {
  const { data, errors } = await client.query({
    query: LIST_GROUPS,
  })
  if (errors) {
    console.log('listGroups errors:', JSON.stringify(errors))
  }
  const { listGroups: results } = data
  const { items } = results
  // console.log('getGroup group:', JSON.stringify(group))
  return items
}

export async function createGroupResult(groupResult) {
  const { data, errors } = await client.mutate({
    mutation: CREATE_GROUP_RESULT,
    variables: {
      input: groupResult,
    },
  })
  if (errors) {
    console.log('createGroupResult errors:', JSON.stringify(errors))
  }
  const { createGroupResult: result } = data
  // console.log('createGroupResult result:', JSON.stringify(result))
  return result
}

export async function updateGroupResult(groupResult) {
  const { data, errors } = await client.mutate({
    mutation: UPDATE_GROUP_RESULT,
    variables: {
      input: groupResult,
    },
  })
  if (errors) {
    console.log('updateGroupResult errors:', JSON.stringify(errors))
  }
  const { updateGroupResult: result } = data
  // console.log('updateGroupResult result:', JSON.stringify(result))
  return result
}

export async function getGroupResult(groupId, teamId) {
  const { data, errors } = await client.query({
    query: GET_GROUP_RESULT,
    variables: {
      groupId,
      teamId,
    },
  })
  if (errors) {
    console.log('getGroupResult errors:', JSON.stringify(errors))
  }
  const { getGroupResult: result } = data
  // console.log('getGroupResult result:', JSON.stringify(result))
  return result
}

export async function findMatchByType(type) {
  const { data, errors } = await client.query({
    query: FIND_MATCH_BY_TYPE,
    variables: { type },
  })
  if (errors) {
    console.log('findMatchByType errors:', JSON.stringify(errors))
  }
  const { findMatchByType: results } = data
  // console.log('getGroup group:', JSON.stringify(group))
  return results
}
