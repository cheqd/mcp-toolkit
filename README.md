# Cheqd MCP Toolkit

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/cheqd/mcp-toolkit?color=green&label=stable%20release&style=flat-square)](https://github.com/cheqd/mcp-toolkit/releases/latest) ![GitHub Release Date](https://img.shields.io/github/release-date/cheqd/mcp-toolkit?color=green&style=flat-square) [![GitHub license](https://img.shields.io/github/license/cheqd/mcp-toolkit?color=blue&style=flat-square)](https://github.com/cheqd/mcp-toolkit/blob/main/LICENSE)

[![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/cheqd/mcp-toolkit?include_prereleases&label=dev%20release&style=flat-square)](https://github.com/cheqd/mcp-toolkit/releases/) ![GitHub commits since latest release (by date)](https://img.shields.io/github/commits-since/cheqd/mcp-toolkit/latest?style=flat-square) [![GitHub contributors](https://img.shields.io/github/contributors/cheqd/mcp-toolkit?label=contributors%20%E2%9D%A4%EF%B8%8F&style=flat-square)](https://github.com/cheqd/mcp-toolkit/graphs/contributors)

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/cheqd/mcp-toolkit/dispatch.yml?label=workflows&style=flat-square)](https://github.com/cheqd/mcp-toolkit/actions/workflows/dispatch.yml) [![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/cheqd/mcp-toolkit/codeql.yml?label=CodeQL&style=flat-square)](https://github.com/cheqd/mcp-toolkit/actions/workflows/codeql.yml) ![GitHub repo size](https://img.shields.io/github/repo-size/cheqd/mcp-toolkit?style=flat-square)

## ℹ️ Overview

The `@cheqd/mcp-toolkit` is a modular framework built around the Model Context Protocol (MCP) which allows AI agents to interact with the Cheqd network. MCP standardizes AI agent interactions by providing a structured way to handle identity-related workflows. This toolkit enables AI agents to securely manage decentralized identities (DIDs), verifiable credentials, and trust registries, making it an essential component for AI-driven identity systems. This repository allows developers to configure and deploy an MCP server with the available toolkits.

## 🌐 Remote MCP Server

For the quickest way to get started, you can connect to our hosted MCP server. Simply add the following configuration to your Claude Desktop or Cursor settings file:

- For Claude Desktop: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json (Windows)`

- For Cursor: `.cursor/mcp.json`

```json
{
    "mcpServers": {
        "cheqd-mcp": {
            "command": "npx",
            "args": [
                "mcp-remote",
                "https://remote-mcp.cheqd.io/mcp"
            ],
        }
    }
}
```

The remote option requires no local setup and provides immediate access to cheqd identity tools.

## Prerequisites

- Node.js 20 or higher
- pnpm 8 or higher
- Basic knowledge of TypeScript and MCP

## 📦 Packages

### @cheqd/mcp-toolkit

The `@cheqd/mcp-toolkit` package allows you to configure and host an MCP (Model Context Protocol) server within an environment. It integrates with tools from this repository to provide a customizable infrastructure for managing identity-related operations.

Features:

- Configurable MCP server setup
- Integration with various tools from this repository

### Usage Options

#### 1. Remote Server (Easiest)

Connect to our hosted MCP server - no local setup required:

```json
{
    "mcpServers": {
        "cheqd-mcp": {
            "command": "npx",
            "args": [
                "mcp-remote",
                "https://remote-mcp.cheqd.io/mcp"
            ],
        }
    }
}
```

#### 2. Local server via NPX

Use this to run the Cheqd MCP Server locally and pass your own environment variables.

```json
{
    "mcpServers": {
        "cheqd": {
            "command": "npx",
            "args": [
                "-y",
                "@cheqd/mcp-toolkit-server"
            ],
            "env": {
                "TOOLS": "credo,<other available tools>",
                ...
            }
        }
    }
}
```

#### 3. Local Server via docker-compose

Use the `env.example` file and update the appropriate variables.

```json
{
  "mcpServers": {
    "cheqd-docker-compose": {
      "command": "docker",
      "args": [
        "compose",
        "-f",
        "/path/to/repo/mcp-toolkit/docker/docker-compose.yml",
        "run",
        "--rm",
        "-p", 
        "3000:3000",
        "--name",
        "faber",
        "-T",
        "mcp-server"
      ]
    }
  }
}
```

### @cheqd/mcp-toolkit-credo

The `@cheqd/mcp-toolkit-credo` package is one of the toolkits that integrate with @openwalletfoundation/credo-ts, allowing an AI agent to manage DIDs and verifiable credentials. It provides tools for:

- Issuing and revoking credentials
- Schema and credential definition management
- DID-based authentication
- TRAIN for trust registry verification

### 🌍 Environment Variables

```bash
TOOLS="credo"       # Comma separated list of Tools, as of now only 'credo'
CREDO_PORT="3000"   # Port on which the Credo agent will run
CREDO_NAME="faber"  # Name of the Credo Agent
CREDO_ENDPOINT="http://faber:3000"    # Endpoint which Credo Agent is accessible externally
CREDO_CHEQD_TESTNET_MNEMONIC="your-mnemonic-phrase"   # Your Testnet mnemonic phrase
TRAIN_ENDPOINT="https://dev-train.trust-scheme.de/tcr/v1/"    # The TRAIN endpoint for verification of trust registry 
PORT="5000"   # The Port where the Remote MCP Server will run
```

## Developer Options

### Development Setup

#### 1. Install pnpm

If you don't already have pnpm installed:

```bash
npm install -g pnpm
```

#### 2. Clone the repository

```bash
git clone https://github.com/cheqd/mcp-toolkit.git
cd mcp-toolkit
```

#### 3. Install dependencies

```bash
pnpm install
```

#### 4. Build the packages

```bash
pnpm build
```

## 📚 Documentation

For comprehensive details on the Cheqd MCP Toolkit, usage examples, and AI agent integrations, please refer to our official documentation:

👉 [MCP Documentation on cheqd.io](https://docs.cheqd.io/product/getting-started/ai-agents/trust-registry/setup-mcp)


The documentation covers advanced topics including:

- Architecture and design of MCP
- Integrating MCP with AI agents
- Real-world use cases and patterns
- Security and trust model
- Deployment recommendations

## 💬 Community

Our [**Discord server**](http://cheqd.link/discord-github) is the primary chat channel for our open-source community, software developers, and node operators.

Please reach out to us there for discussions, help, and feedback on the project.

## 🙋 Find us elsewhere

[![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge\&logo=telegram\&logoColor=white)](https://t.me/cheqd) [![Discord](https://img.shields.io/badge/Discord-7289DA?style=for-the-badge\&logo=discord\&logoColor=white)](http://cheqd.link/discord-github) [![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge\&logo=twitter\&logoColor=white)](https://twitter.com/intent/follow?screen\_name=cheqd\_io) [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge\&logo=linkedin\&logoColor=white)](http://cheqd.link/linkedin) [![Medium](https://img.shields.io/badge/Medium-12100E?style=for-the-badge\&logo=medium\&logoColor=white)](https://blog.cheqd.io) [![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge\&logo=youtube\&logoColor=white)](https://www.youtube.com/channel/UCBUGvvH6t3BAYo5u41hJPzw/)
