import axios from 'axios'
import { Observable, of, forkJoin } from 'rxjs'
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
  const existMatch = await api.getMatch(match.id)
  if (existMatch && existMatch.id) {
    const result = await api.updateMatch(match)
    console.log('update match:', JSON.stringify(result))
  } else {
    const result = await api.createMatch(match)
    console.log('create match:', JSON.stringify(result))
  }
}

export default async function execute() {
  const { groups, knockout } = await getData()
  const { a, b, c, d, e, f, g, h } = groups
  const groupMatches$ = of(a, b, c, d, e, f, g, h)
    .pipe(map(group => group.matches))
    .pipe(reduce(concatAllArray, []))
    .pipe(mergeAll())

  const { round_16, round_8, round_4, round_2_loser, round_2 } = knockout
  const knockoutMatches$ = of(
    round_16,
    round_8,
    round_4,
    round_2_loser,
    round_2
  )
    .pipe(map(group => group.matches))
    .pipe(reduce(concatAllArray, []))
    .pipe(mergeAll())

  const match$ = forkJoin(
    groupMatches$.pipe(toArray()),
    knockoutMatches$.pipe(toArray())
  )
    .pipe(
      map(([groupMatches, knockoutMatches]) => [
        ...groupMatches,
        ...knockoutMatches,
      ])
    )
    .pipe(mergeAll())

  const matches = await match$.pipe(toArray()).toPromise()

  const promises = matches.map(match => {
    console.log('original match:', JSON.stringify(match))
    const matchDate = moment(match.date)
      .utcOffset('+08:00')
      .format('YYYY-MM-DD')
    const dateTime = moment(match.date)
      .utcOffset('+08:00')
      .toISOString(true)
    console.log('matchDate:', matchDate)
    console.log('dateTime:', dateTime)
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
      stadiumId: match.stadium,
      finished: match.finished,
      matchday: match.matchday,
    }
    console.log('updated match:', JSON.stringify(updatedMatch))
    return createOrUpdateMatch(updatedMatch)
  })
  await Promise.all(promises)
}
