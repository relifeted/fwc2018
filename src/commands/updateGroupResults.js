import { from } from 'rxjs'
import { map, mergeAll, toArray } from 'rxjs/operators'

import * as api from '../api'

function updateGoals(result, goalsFor, goalsAgainst) {
  return {
    ...result,
    goalsFor: result.goalsFor + goalsFor,
    goalsAgainst: result.goalsAgainst + goalsAgainst,
  }
}

function updatePoints(result) {
  return {
    ...result,
    points: result.wins * 3 + result.draws,
    goalDifferential: result.goalsFor - result.goalsAgainst,
  }
}

function calculate(group) {
  const { id: groupId, matches, teams } = group
  const groupResultMap = teams.reduce((accu, curr) => {
    const { id } = curr
    const newMap = { ...accu }
    newMap[id] = {
      groupId,
      teamId: id,
      points: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifferential: 0,
    }
    return newMap
  }, {})
  matches.forEach(match => {
    const { homeTeam, awayTeam, homeResult, awayResult, finished } = match
    if (finished) {
      console.log('homeTeam:', homeTeam.id, homeResult, typeof homeResult)
      console.log('awayTeam:', awayTeam.id, awayResult, typeof awayResult)
      let homeGroupResult = groupResultMap[homeTeam.id]
      let awayGroupResult = groupResultMap[awayTeam.id]
      homeGroupResult = updateGoals(homeGroupResult, homeResult, awayResult)
      awayGroupResult = updateGoals(awayGroupResult, awayResult, homeResult)
      if (homeResult > awayResult) {
        homeGroupResult.wins += 1
        awayGroupResult.losses += 1
      } else if (homeResult < awayResult) {
        homeGroupResult.losses += 1
        awayGroupResult.wins += 1
      } else if (homeResult === awayResult) {
        homeGroupResult.draws += 1
        awayGroupResult.draws += 1
      }
      homeGroupResult = updatePoints(homeGroupResult)
      awayGroupResult = updatePoints(awayGroupResult)
      console.log('homeGroupResult:', homeGroupResult)
      console.log('awayGroupResult:', awayGroupResult)
      groupResultMap[homeTeam.id] = homeGroupResult
      groupResultMap[awayTeam.id] = awayGroupResult
    }
  })
  return Object.keys(groupResultMap).map(key => groupResultMap[key])
}

async function saveGroupResult(groupResult) {
  const exists = await api.getGroupResult(
    groupResult.groupId,
    groupResult.teamId
  )
  if (exists) {
    return api.updateGroupResult(groupResult)
  }
  return api.createGroupResult(groupResult)
}

export default async function execute() {
  const group$ = from(api.listGroups()).pipe(mergeAll())
  // .pipe(map(groupId => from(api.getGroup(groupId))))
  // .pipe(mergeAll())
  // const groups = await group$.pipe(toArray()).toPromise()
  // console.log(groups)
  const groupResult$ = group$
    .pipe(map(group => calculate(group)))
    .pipe(mergeAll())

  // const groupResults =
  await groupResult$
    .pipe(map(groupResult => from(saveGroupResult(groupResult))))
    .pipe(toArray())
    .toPromise()

  // console.log(groupResults)
}
