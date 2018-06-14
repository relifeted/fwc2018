import _parseIntent from './parseIntent'
import _replyTodayMatchLINE from './replyTodayMatchLINE'
import _replyTomorrowMatchLINE from './replyTomorrowMatchLINE'
import _replyYesterdayMatchLINE from './replyYesterdayMatchLINE'
import _hello from './hello'

export const parseIntent = _parseIntent
export const replyTodayMatchLINE = _replyTodayMatchLINE
export const replyTomorrowMatchLINE = _replyTomorrowMatchLINE
export const replyYesterdayMatchLINE = _replyYesterdayMatchLINE
export const hello = _hello

export default {
  parseIntent,
  replyTodayMatchLINE,
  replyTomorrowMatchLINE,
  replyYesterdayMatchLINE,
  hello,
}
