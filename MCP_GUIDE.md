# MCP Server Guide for MyAiPlug

## What are MCP Servers?

**MCP (Model Context Protocol)** is an architectural approach that enables AI agents to work as microservices. MCP servers expose AI agents and tools as network-accessible services that can be used by any MCP-compatible client (like Claude Desktop, VSCode with GitHub Copilot, or Cursor).

### Key Benefits

1. **Composability**: Chain multiple agents together to create complex workflows
2. **Scalability**: Manage and scale AI infrastructure centrally
3. **Platform Independence**: Works across different AI clients and tools
4. **Asynchronous Workflows**: Handle long-running tasks with resilience

## Setting Up MCP Servers

### For Claude Desktop

1. **Install Claude Desktop** from [claude.ai/download](https://claude.ai/download)

2. **Locate your configuration directory**:
   - **macOS**: `~/Library/Application Support/Claude/`
   - **Windows**: `%APPDATA%\Claude\`
   - **Linux**: `~/.config/Claude/`

3. **Create or edit `claude_desktop_config.json`**:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/your/project"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

4. **Restart Claude Desktop** to apply changes

### For VSCode/GitHub Copilot

1. **Open VSCode Settings** (Ctrl/Cmd + ,)

2. **Enable MCP Support** in `settings.json`:

```json
{
  "chat.mcp.access": "all",
  "chat.mcp.gallery.enabled": true,
  "chat.mcp.discovery.enabled": true
}
```

3. **Install MCP Servers** from the Extensions marketplace or configure manually

## Recommended MCP Servers for MyAiPlug Project

### Essential Servers

#### 1. **Filesystem MCP Server**
- **Purpose**: File operations (read, write, manage)
- **Use Case**: Managing audio files, config files, code modules
- **Installation**: 
  ```bash
  npx -y @modelcontextprotocol/server-filesystem
  ```

#### 2. **GitHub MCP Server**
- **Purpose**: Repository management, issues, PRs, code reviews
- **Use Case**: Automating version control, managing project tasks
- **Installation**:
  ```bash
  npx -y @modelcontextprotocol/server-github
  ```
- **Requirements**: GitHub Personal Access Token

#### 3. **NPM MCP Server**
- **Purpose**: Package management and dependency operations
- **Use Case**: Managing JavaScript dependencies for your web audio modules
- **Installation**:
  ```bash
  npx -y @modelcontextprotocol/server-npm
  ```

#### 4. **Browser Automation MCP Server**
- **Purpose**: Automated testing and web interactions
- **Use Case**: Testing your mini-studio UI, capturing screenshots
- **Installation**:
  ```bash
  npx -y @modelcontextprotocol/server-puppeteer
  ```

### Optional Advanced Servers

#### 5. **Sequential Thinking MCP Server**
- **Purpose**: Complex problem-solving with structured reasoning
- **Use Case**: Planning audio processing chains, optimizing algorithms
- **Installation**:
  ```bash
  npx -y @modelcontextprotocol/server-sequential-thinking
  ```

#### 6. **Memory MCP Server**
- **Purpose**: Persistent context and knowledge across sessions
- **Use Case**: Remembering project preferences, audio processing settings
- **Installation**:
  ```bash
  npx -y @modelcontextprotocol/server-memory
  ```

## Example Configuration for MyAiPlug

Here's a complete MCP configuration tailored for the MyAiPlug project:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/home/runner/work/Myaiplug/Myaiplug"
      ]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<your_token>"
      }
    },
    "npm": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-npm"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
```

## Verifying Your Setup

1. **Start Claude Desktop** or your MCP-compatible client
2. **Look for MCP indicators** in the UI (usually a tool/hammer icon)
3. **Test a simple command**: "List files in my project directory"
4. **Check logs** for successful MCP server connections

## Troubleshooting

### Common Issues

1. **MCP Server Not Connecting**
   - Verify Node.js is installed: `node --version`
   - Check the configuration file syntax (valid JSON)
   - Restart the client application

2. **Permission Errors**
   - Ensure file paths are accessible
   - Check environment variables are set correctly
   - Verify GitHub tokens have required scopes

3. **Server Not Found**
   - Use `npx` with `-y` flag to auto-install
   - Check your internet connection
   - Verify package names are correct

## Next Steps

1. Review the [Agent Chaining Guide](./AGENT_CHAINING.md) to learn how to orchestrate multiple agents
2. Explore the [MCP Configuration](./mcp-config.json) for ready-to-use setup
3. Check the [official MCP documentation](https://modelcontextprotocol.io) for advanced features

## Resources

- [Model Context Protocol Official Site](https://modelcontextprotocol.io)
- [MCP Server Directory](https://github.com/fastmcp-me/awesome-mcp-serverss)
- [Claude Desktop Setup Guide](https://claudepro.directory/guides/tutorials/desktop-mcp-setup)
- [VSCode MCP Documentation](https://code.visualstudio.com/docs/copilot/customization/mcp-servers)
