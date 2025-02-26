import pino, { type DestinationStream } from 'pino'
import pretty from 'pino-pretty'

import { Env } from './Env.ts'

let stream: DestinationStream

if (Env.NODE_ENV !== 'production') {
  stream = pretty({
    colorize: true,
  })
} else {
  stream = pino.destination(1)
}

export const logger = pino({ base: undefined }, stream)
