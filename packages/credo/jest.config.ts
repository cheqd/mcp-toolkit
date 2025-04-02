import type { Config } from '@jest/types'

import base from '../../jest.config'

import packageJson from './package.json'

const config: Config.InitialOptions = {
  ...base,
  displayName: packageJson.name,
  setupFilesAfterEnv: ['./tests/setup.ts'],
}

export default config
