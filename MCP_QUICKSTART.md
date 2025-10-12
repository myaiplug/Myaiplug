# MCP Quick Start Guide for MyAiPlug

## 5-Minute Setup

Get started with MCP servers and AI agent chaining in just 5 minutes!

### Step 1: Prerequisites

Ensure you have:
- ✅ Node.js installed (v18 or higher)
- ✅ Claude Desktop or VSCode with GitHub Copilot
- ✅ GitHub Personal Access Token (optional, but recommended)

Check Node.js version:
```bash
node --version
```

### Step 2: Choose Your Client

#### Option A: Claude Desktop (Recommended for Beginners)

1. **Install Claude Desktop**
   - Download from [claude.ai/download](https://claude.ai/download)
   - Install and launch the application

2. **Locate Configuration Directory**
   - **macOS**: `~/Library/Application Support/Claude/`
   - **Windows**: `%APPDATA%\Claude\`
   - **Linux**: `~/.config/Claude/`

3. **Copy Configuration File**
   ```bash
   # macOS/Linux
   mkdir -p ~/Library/Application\ Support/Claude/
   cp mcp-config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
   
   # Windows (PowerShell)
   Copy-Item mcp-config.json $env:APPDATA\Claude\claude_desktop_config.json
   ```

4. **Add Your GitHub Token** (Optional)
   - Create a token at [github.com/settings/tokens](https://github.com/settings/tokens)
   - Required scopes: `repo`, `read:org`, `workflow`
   - Edit `claude_desktop_config.json` and replace `<your_github_token_here>`

5. **Restart Claude Desktop**

#### Option B: VSCode with GitHub Copilot

1. **Install VSCode Extensions**
   - GitHub Copilot
   - GitHub Copilot Chat

2. **Enable MCP in Settings**
   
   Press `Ctrl/Cmd + ,` and add to `settings.json`:
   ```json
   {
     "chat.mcp.access": "all",
     "chat.mcp.gallery.enabled": true,
     "chat.mcp.discovery.enabled": true
   }
   ```

3. **Restart VSCode**

### Step 3: Verify Setup

1. **Open Claude Desktop or VSCode**

2. **Test Filesystem Server**
   ```
   Please list the files in my project directory.
   ```
   
   Expected: You should see a list of files from the Myaiplug directory

3. **Test GitHub Server** (if configured)
   ```
   Show me the recent commits in this repository.
   ```
   
   Expected: List of recent Git commits

4. **Test Memory Server**
   ```
   Remember that my preferred audio sample rate is 48kHz.
   ```
   
   Then later:
   ```
   What sample rate do I prefer?
   ```
   
   Expected: The AI remembers your preference

### Step 4: Try Your First Agent Chain

Use this simple agent chain to add documentation:

```
I need your help with a multi-step task. Please act as an orchestrator
and coordinate the following:

1. Analysis Agent: Review the current README.md
2. Content Agent: Suggest improvements and additions
3. Writing Agent: Draft the updated content
4. Review Agent: Check for clarity and completeness

Please execute these steps sequentially and show me the final result.
```

### Step 5: Real Task Example

Try this practical example for your audio project:

```
Let's work as a team to add a new Compressor effect module:

Orchestrator: Break down the task
Code Agent: Create modules/compressor.js with Web Audio Compressor node
Integration Agent: Update core.js to import and register the module
Testing Agent: Verify the audio processing works correctly
Documentation Agent: Update README.md with the new effect

Please execute this chain and show progress at each step.
```

## Common Tasks

### Task 1: Adding a New Audio Effect

**Prompt**:
```
I want to add a [EFFECT_NAME] effect to MyAiPlug. Please:
1. Research Web Audio API nodes needed
2. Create the module file in the modules/ directory
3. Integrate it into core.js
4. Test the implementation
5. Update documentation

Work as a coordinated team of specialized agents.
```

### Task 2: Optimizing Existing Code

**Prompt**:
```
Please review and optimize the warmth.js module:
1. Code Analysis Agent: Identify performance bottlenecks
2. Optimization Agent: Suggest and implement improvements
3. Testing Agent: Ensure audio quality is maintained
4. Documentation Agent: Update inline comments

Execute as an agent chain.
```

### Task 3: Creating Comprehensive Tests

**Prompt**:
```
Set up testing infrastructure for MyAiPlug:
1. Research Agent: Recommend testing frameworks for Web Audio
2. Setup Agent: Create test files and configuration
3. Testing Agent: Write unit tests for each module
4. Documentation Agent: Create testing guide

Coordinate these agents to complete the task.
```

## Troubleshooting

### MCP Servers Not Appearing

1. **Check Configuration File**
   ```bash
   # macOS/Linux
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```
   
   Ensure it's valid JSON (use [jsonlint.com](https://jsonlint.com))

2. **Verify Node.js**
   ```bash
   node --version  # Should be v18+
   npx --version   # Should work
   ```

3. **Check Logs**
   - Claude Desktop: Help → View Logs
   - VSCode: View → Output → GitHub Copilot

### Agent Not Following Chain

**Issue**: AI doesn't execute sequential steps

**Solution**: Be more explicit:
```
You are an Orchestrator Agent. Your job is to coordinate other agents.

Step 1: Act as Code Agent and create the file
[Wait for completion]

Step 2: Act as Testing Agent and test the code
[Wait for completion]

Step 3: Act as Documentation Agent and update docs
[Wait for completion]

Execute each step and wait for my confirmation before proceeding.
```

### Permission Errors

**Issue**: Cannot access files or GitHub

**Solutions**:
1. Check file path in mcp-config.json
2. Verify GitHub token has correct scopes
3. Ensure token is not expired

## Next Steps

### Beginner Path
1. ✅ Complete this quick start
2. 📖 Read [MCP_GUIDE.md](./MCP_GUIDE.md) for detailed information
3. 🔗 Review [AGENT_CHAINING.md](./AGENT_CHAINING.md) for advanced patterns
4. 🎯 Try the example tasks above

### Intermediate Path
1. Customize `mcp-config.json` for your workflow
2. Create your own agent personas and roles
3. Build complex multi-agent workflows
4. Integrate with CI/CD pipelines

### Advanced Path
1. Develop custom MCP servers for specialized tasks
2. Implement error handling and recovery in agent chains
3. Use orchestration frameworks (LangChain, CrewAI)
4. Build production-grade agent systems

## Helpful Resources

### Documentation
- [MCP Guide](./MCP_GUIDE.md) - Comprehensive MCP server documentation
- [Agent Chaining Guide](./AGENT_CHAINING.md) - Detailed agent orchestration patterns
- [Official MCP Docs](https://modelcontextprotocol.io) - Protocol specification

### Community
- [MCP Discord](https://discord.gg/modelcontextprotocol) - Community support
- [Awesome MCP Servers](https://github.com/fastmcp-me/awesome-mcp-serverss) - Curated list
- [Claude Community](https://community.anthropic.com) - Claude-specific help

### Tools
- [MCP Config Generator](https://claudedesktopconfiggenerator.com) - Visual config builder
- [MCP Server Directory](https://github.com/modelcontextprotocol) - Official servers
- [mcp-agent Framework](https://github.com/lastmile-ai/mcp-agent) - Advanced development

## Pro Tips

1. **Start Simple**: Begin with 2-3 agents before building complex chains
2. **Use Memory**: Let the Memory MCP Server track progress across sessions
3. **Be Specific**: Clear role definitions lead to better agent performance
4. **Iterate**: Refine your prompts and agent structures over time
5. **Document**: Keep notes on what agent patterns work best for your project

## Questions?

If you encounter issues or have questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review detailed guides in MCP_GUIDE.md and AGENT_CHAINING.md
3. Visit official documentation and community resources
4. Open an issue on the [MyAiPlug GitHub repository](https://github.com/myaiplug/Myaiplug)

---

**You're ready to supercharge your development with MCP servers and AI agent chaining! 🚀**
