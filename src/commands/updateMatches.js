import axios from 'axios'
import { of, forkJoin } from 'rxjs'
import moment from 'moment'
import { map, reduce, mergeAll, toArray } from 'rxjs/operators'

import * as api from '../api'

async function getData() {
  const { data } = await axios.get(
    'https://raw.githubusercontent.com/lsv/fifa-worldcup-2018/master/data.json'
  )
  return data
}

function concatAllArray(accu, curr) {
  return [...accu, ...curr]
}

async function createOrUpdateMatch(match) {
  // console.log('match.id:', match.id, match.type)
  const existMatch = await api.getMatch(match.id)
  if (existMatch && existMatch.id) {
    // const result =
    await api.updateMatch(match)
    // console.log('update match:', JSON.stringify(result))
  } else {
    // const result =
    await api.createMatch(match)
    // console.log('create match:', JSON.stringify(result))
  }
}

export default async function execute() {
  const groupMap = (await api.listGroups()).reduce((accu, curr) => {
    const { code } = curr
    const newMap = { ...accu }
    newMap[code] = { ...curr }
    return newMap
  }, {})
  const { groups, knockout } = await getData()
  const { a, b, c, d, e, f, g, h } = groups
  const groupMatches$ = of(a, b, c, d, e, f, g, h)
    .pipe(map(group => group.matches))
    .pipe(reduce(concatAllArray, []))
    .pipe(mergeAll())

  const {
    round_16, // eslint-disable-line
    round_8, // eslint-disable-line
    round_4, // eslint-disable-line
    round_2_loser, // eslint-disable-line
    round_2 // eslint-disable-line
  } = knockout
  const round16$ = of(round_16)
    .pipe(map(group => group.matches))
    .pipe(reduce(concatAllArray, []))
    .pipe(mergeAll())
    .pipe(map(match => ({ ...match, type: 'round16' })))
  const round8$ = of(round_8)
    .pipe(map(group => group.matches))
    .pipe(reduce(concatAllArray, []))
    .pipe(mergeAll())
    .pipe(map(match => ({ ...match, type: 'round8' })))
  const round4$ = of(round_4)
    .pipe(map(group => group.matches))
    .pipe(reduce(concatAllArray, []))
    .pipe(mergeAll())
    .pipe(map(match => ({ ...match, type: 'round4' })))
  const round2loser$ = of(round_2_loser)
    .pipe(map(group => group.matches))
    .pipe(reduce(concatAllArray, []))
    .pipe(mergeAll())
    .pipe(map(match => ({ ...match, type: 'round2loser' })))
  const round2$ = of(round_2)
    .pipe(map(group => group.matches))
    .pipe(reduce(concatAllArray, []))
    .pipe(mergeAll())
    .pipe(map(match => ({ ...match, type: 'round2' })))

  const knockoutMatches$ = of(
    round16$,
    round8$,
    round4$,
    round2loser$,
    round2$
  ).pipe(mergeAll())

  const match$ = forkJoin(
    groupMatches$.pipe(toArray()),
    knockoutMatches$.pipe(toArray())
  )
    .pipe(
      map(([groupMatches, knockoutMatches]) => [
        ...groupMatches,
        ...knockoutMatches
      ])
    )
    .pipe(mergeAll())

  const matches = await match$.pipe(toArray()).toPromise()
  const matchMap = {}

  const promises = matches.map(match => {
    // console.log('original match:', JSON.stringify(match))
    const matchDate = moment(match.date)
      .utcOffset('+08:00')
      .format('YYYY-MM-DD')
    const dateTime = moment(match.date)
      .utcOffset('+08:00')
      .toISOString(true)
    const timestamp = moment(match.date)
      .utcOffset('+08:00')
      .format('X')
    // console.log('matchDate:', matchDate)
    // console.log('dateTime:', dateTime)
    const updatedMatch = {
      id: match.name,
      name: match.name,
      type: match.type,
      homeTeamId: match.home_team,
      awayTeamId: match.away_team,
      homeResult: match.home_result,
      awayResult: match.away_result,
      homePenalty: match.home_penalty,
      awayPenalty: match.away_penalty,
      dateTime,
      matchDate,
      timestamp,
      stadiumId: match.stadium,
      finished: match.finished,
      matchday: match.matchday
    }
    switch (updatedMatch.type) {
      case 'round16': {
        const { homeTeamId, awayTeamId } = updatedMatch
        if (homeTeamId && !Number.isInteger(parseInt(homeTeamId, 10))) {
          const [groupPlace, groupCode] = homeTeamId.split('_')
          const group = groupMap[groupCode]
          const { id: teamId } = group[groupPlace] || {}
          if (teamId) {
            updatedMatch.homeTeamId = teamId
          }
        }
        if (awayTeamId && !Number.isInteger(parseInt(awayTeamId, 10))) {
          const [groupPlace, groupCode] = awayTeamId.split('_')
          const group = groupMap[groupCode]
          const { id: teamId } = group[groupPlace] || {}
          if (teamId) {
            updatedMatch.awayTeamId = teamId
          }
        }
        break
      }
      case 'round8':
      case 'round4':
      case 'round2':
        if (
          matchMap[updatedMatch.homeTeamId] &&
          matchMap[updatedMatch.homeTeamId].winner
        ) {
          updatedMatch.homeTeamId = matchMap[updatedMatch.homeTeamId].winner
        }
        if (
          matchMap[updatedMatch.homeTeamId] &&
          matchMap[updatedMatch.homeTeamId].winner
        ) {
          updatedMatch.awayTeamId = matchMap[updatedMatch.awayTeamId].winner
        }
        break
      case 'round2loser':
        if (
          matchMap[updatedMatch.homeTeamId] &&
          matchMap[updatedMatch.homeTeamId].looser
        ) {
          updatedMatch.homeTeamId = matchMap[updatedMatch.homeTeamId].looser
        }
        if (
          matchMap[updatedMatch.homeTeamId] &&
          matchMap[updatedMatch.homeTeamId].looser
        ) {
          updatedMatch.awayTeamId = matchMap[updatedMatch.awayTeamId].looser
        }
        break
      default:
        break
    }
    matchMap[updatedMatch.id] = updatedMatch
    // console.log('updated match:', JSON.stringify(updatedMatch))
    return createOrUpdateMatch(updatedMatch)
  })
  await Promise.all(promises)
}
