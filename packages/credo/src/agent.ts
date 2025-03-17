import type { InitConfig } from '@credo-ts/core'

import { Agent, DidsModule } from '@credo-ts/core'
import { AskarModule } from '@credo-ts/askar'
import { agentDependencies } from '@credo-ts/node'
import {
  CheqdAnonCredsRegistry,
  CheqdDidRegistrar,
  CheqdDidResolver,
  CheqdModule,
  CheqdModuleConfig,
} from '@credo-ts/cheqd'
import { AnonCredsModule } from '@credo-ts/anoncreds'
import { ariesAskar } from '@hyperledger/aries-askar-nodejs'
import { anoncreds } from '@hyperledger/anoncreds-nodejs'
import { DidCommModuleConfigOptions } from '@credo-ts/didcomm'

const config: InitConfig = {
    label: 'docs-agent-nodejs',
    walletConfig: {
        id: 'wallet-id',
        key: 'testkey0000000000000000000000000',
    },
}

export class CredoAgent {
    public port: number | string
    public name: string
    public config: InitConfig
    public agent: Agent<ReturnType<typeof getAskarAnonCredsModules>>

    public constructor({ port, name, mnemonic }: { port: number| string; name: string; mnemonic: string }) {
        this.name = name
        this.port = port

        const config = {
            label: name,
            walletConfig: {
                id: name,
                key: name,
            },
        } satisfies InitConfig

        this.config = config

        this.agent = new Agent({
            config,
            dependencies: agentDependencies,
            modules: getAskarAnonCredsModules({ endpoints: [`http://localhost:${this.port}`] }, mnemonic)
        })
    }

    public async initializeAgent() {
        await this.agent.initialize()
    }
}

function getAskarAnonCredsModules(_didcommConfig: DidCommModuleConfigOptions, mnemonic: string) {
  
    return {
      anoncreds: new AnonCredsModule({
        registries: [new CheqdAnonCredsRegistry()],
        anoncreds,
      }),
      cheqd: new CheqdModule(
        new CheqdModuleConfig({
          networks: [
            {
              network: 'testnet',
              cosmosPayerSeed: mnemonic
            },
          ],
        })
      ),
      dids: new DidsModule({
        resolvers: [new CheqdDidResolver()],
        registrars: [new CheqdDidRegistrar()],
      }),
      askar: new AskarModule({
        ariesAskar,
      }),
    } as const
}
