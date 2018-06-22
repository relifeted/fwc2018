import { Observable, of, forkJoin, from } from 'rxjs'
import { map, reduce, mergeAll, toArray } from 'rxjs/operators'

import * as api from '../api'

function updateGoals(result, goalsFor, goalsAgainst) {
  result.goalsFor += goalsFor
  result.goalsAgainst += goalsAgainst
}

function updatePoints(result) {
  result.points = result.wins * 3 + result.draws
  result.goalDifferential = result.goalsFor - result.goalsAgainst
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
      const homeGroupResult = groupResultMap[homeTeam.id]
      const awayGroupResult = groupResultMap[awayTeam.id]
      updateGoals(homeGroupResult, homeResult, awayResult)
      updateGoals(awayGroupResult, awayResult, homeResult)
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
      updatePoints(homeGroupResult)
      updatePoints(awayGroupResult)
      console.log('homeGroupResult:', homeGroupResult)
      console.log('awayGroupResult:', awayGroupResult)
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
  } else {
    return api.createGroupResult(groupResult)
  }
}

export default async function execute() {
  const group$ = of(['1', '2', '3', '4', '5', '6', '7', '8'])
    .pipe(mergeAll())
    .pipe(map(groupId => from(api.getGroup(groupId))))
    .pipe(mergeAll())
  // const groups = await group$.pipe(toArray()).toPromise()
  // console.log(groups)
  const groupResult$ = group$
    .pipe(map(group => calculate(group)))
    .pipe(mergeAll())

  const groupResults = await groupResult$
    .pipe(map(groupResult => from(saveGroupResult(groupResult))))
    .pipe(toArray())
    .toPromise()

  // console.log(groupResults)
}
