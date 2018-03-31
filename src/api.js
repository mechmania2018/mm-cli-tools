// @flow

const fetch = require('node-fetch')

import type { Team } from './utils/auth'

const login = async (token : string): Promise<?Team> => {
  const res = await fetch('https://login.mechmania.io', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  if(res.status === 401) return null
  if(res.status !== 200) throw Error('An unknown error occurred on the server ' + res.status)
  return await res.json()
}

const register = async (name : string, email: string): Promise<?Team> => {
  const res = await fetch('http://localhost:3000', { body:JSON.stringify({name, email}), method:'POST'})
  if(res.status === 401) return null
  if(res.status !== 200) throw Error('An unknown error occurred on the server ' + res.status)
  return await res.json()
}

module.exports = {
  login,
  register
}