import { Line } from 'messaging-api-line'
import moment from 'moment'

import api from '../api'
import FIND_MATCH_BY_DATE from '../gql/findMatchByDate.gql'

export default async function handler(context, next) {
  let image
  if (context.intent && context.intent === '今日賽事') {
    const today = moment().format('YYYY-MM-DD')
    console.log('today:', today)
    const { data } = await api.query({
      query: FIND_MATCH_BY_DATE,
      variables: {
        matchDate: today,
      },
    })
    console.log('data:', JSON.stringify(data))
    const { findMatchByDate: matches } = data
    console.log('matches:', JSON.stringify(matches))
    if (matches && matches.length > 0) {
      let text = `今日賽事：`
      matches.forEach(match => {
        const { homeTeam, awayTeam, stadium } = match
        const homeTeamText = `${homeTeam.name}${homeTeam.emojiString}`
        const awayTeamText = `${awayTeam.name}${awayTeam.emojiString}`
        const stadiumText = `${stadium.name}, ${stadium.city}`
        text = `${text}\n${homeTeamText} 對上 ${awayTeamText} 於 ${stadiumText} 舉行比賽`
      })
      const message = Line.createText(text)
      console.log('message:', message)
      await context.reply([message])
    }
  }
  next()
}
