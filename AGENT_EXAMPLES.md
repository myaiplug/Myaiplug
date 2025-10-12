# AI Agent Examples for MyAiPlug

This document provides ready-to-use prompts and examples for using AI agents with MCP servers to complete common development tasks for the MyAiPlug project.

## Table of Contents

1. [Simple Single-Agent Tasks](#simple-single-agent-tasks)
2. [Multi-Agent Workflows](#multi-agent-workflows)
3. [Complex Agent Chains](#complex-agent-chains)
4. [Maintenance and Optimization](#maintenance-and-optimization)

---

## Simple Single-Agent Tasks

### Add Code Comments

**Goal**: Add comprehensive comments to existing code

**Prompt**:
```
Please review the warmth.js module and add detailed inline comments
explaining:
1. What each Web Audio API node does
2. The purpose of each parameter
3. How the audio routing works
4. Any mathematical operations or algorithms

Make the code beginner-friendly while maintaining the original functionality.
```

### Generate Documentation

**Goal**: Create documentation for a module

**Prompt**:
```
Analyze the eq3.js module and create a USAGE_GUIDE.md file that includes:
- Overview of what the 3-band EQ does
- Explanation of each parameter (Sub, Mid, Air)
- Frequency ranges for each band
- Recommended settings for different use cases (vocals, bass, drums)
- Technical details about the filter types used

Write for both beginners and advanced users.
```

### Create Test Cases

**Goal**: Generate test scenarios

**Prompt**:
```
For the reverb.js module, create a comprehensive test plan that covers:
- Parameter boundary testing (min/max values)
- Audio signal flow verification
- Preset validation
- Edge cases (silent input, clipping, etc.)

Format as a markdown checklist I can use for manual testing.
```

---

## Multi-Agent Workflows

### Add a New Audio Effect

**Goal**: Create a complete new audio module with testing and docs

**Prompt**:
```
I need a multi-agent team to add a Chorus effect to MyAiPlug. Please coordinate:

RESEARCH AGENT:
- Investigate Web Audio API for chorus/modulation effects
- Recommend the best approach using available nodes
- Suggest parameter ranges (Rate: 0.5-10 Hz, Depth: 0-50ms, Mix: 0-100%)

CODE AGENT:
- Create modules/chorus.js following the pattern in warmth.js
- Implement chorus using delay + LFO modulation
- Add parameters for Rate, Depth, and Mix
- Include 3 presets: Subtle, Classic, Dramatic

INTEGRATION AGENT:
- Update core.js to import the new module
- Add to the module initialization sequence
- Ensure proper audio routing

TESTING AGENT:
- Verify all parameters work correctly
- Test presets load properly
- Check audio quality (no artifacts or clipping)
- Validate UI integration

DOCUMENTATION AGENT:
- Update readme.md to include Chorus in the effects list
- Add inline comments to chorus.js
- Create a brief description of what chorus does

Execute these tasks sequentially, showing progress at each step.
```

### Refactor Existing Code

**Goal**: Improve code structure and maintainability

**Prompt**:
```
Multi-agent refactoring task for the core.js file:

ANALYSIS AGENT:
- Review core.js for potential improvements
- Identify repeated code patterns
- Suggest modularization opportunities
- Check for best practices violations

ARCHITECTURE AGENT:
- Propose a refactored structure
- Suggest helper functions for common operations
- Recommend separation of concerns

CODE AGENT:
- Implement the proposed refactoring
- Maintain backward compatibility
- Keep existing functionality intact

TESTING AGENT:
- Verify all modules still load correctly
- Check that audio routing still works
- Test presets and knob interactions

DOCUMENTATION AGENT:
- Update comments to reflect new structure
- Document any new helper functions
- Create a migration guide if API changed

Please proceed with careful analysis first, then implement only necessary changes.
```

### Create Build Pipeline

**Goal**: Set up automated testing and deployment

**Prompt**:
```
DevOps agent chain to create a development workflow:

DEVOPS AGENT:
- Analyze project structure
- Propose a CI/CD pipeline using GitHub Actions
- Suggest tools for linting and testing

CONFIG AGENT:
- Create .github/workflows/ci.yml for automated checks
- Set up ESLint configuration for JavaScript
- Create npm scripts for common tasks

TESTING AGENT:
- Recommend a testing framework (Jest, Mocha, etc.)
- Create example unit tests for one module
- Set up test coverage reporting

DOCUMENTATION AGENT:
- Create CONTRIBUTING.md with development setup
- Document the CI/CD process
- Add badges to README.md

Execute this as a coordinated team effort.
```

---

## Complex Agent Chains

### Complete Feature Development

**Goal**: Add a complete feature from design to deployment

**Prompt**:
```
ORCHESTRATOR: Coordinate a complete feature development cycle

Feature Request: Add a "Preset Bank" feature that allows users to save and load custom presets for all effects.

PHASE 1 - DESIGN (Product + UX Agents)
Product Agent:
- Define feature requirements
- Create user stories
- Specify success criteria

UX Agent:
- Design the preset bank UI
- Propose button placement and interactions
- Consider mobile responsiveness

PHASE 2 - ARCHITECTURE (Architecture Agent)
- Design data structure for preset storage
- Propose localStorage schema
- Plan module communication

PHASE 3 - IMPLEMENTATION (Multiple Code Agents)
Frontend Code Agent:
- Create preset bank UI components
- Add save/load buttons
- Style the interface

Backend Code Agent:
- Implement localStorage operations
- Create preset serialization/deserialization
- Handle preset name validation

Integration Agent:
- Connect UI to storage logic
- Update existing modules to support preset bank
- Ensure smooth data flow

PHASE 4 - QUALITY ASSURANCE (QA Team)
Testing Agent:
- Create test scenarios
- Test across different browsers
- Verify localStorage limits

Accessibility Agent:
- Check keyboard navigation
- Verify screen reader support
- Ensure ARIA labels

PHASE 5 - DOCUMENTATION (Doc Team)
User Docs Agent:
- Create user guide for preset bank
- Add screenshots and examples

Developer Docs Agent:
- Document the code architecture
- Add inline comments
- Create API documentation

PHASE 6 - RELEASE (DevOps Agent)
- Create release notes
- Update version number
- Tag the release

Please execute this entire workflow, providing updates after each phase.
```

### Audit and Improve Codebase

**Goal**: Comprehensive review and enhancement

**Prompt**:
```
Comprehensive codebase audit and improvement:

AUDIT TEAM:

Security Agent:
- Review for XSS vulnerabilities
- Check for secure localStorage usage
- Verify no sensitive data exposure

Performance Agent:
- Identify performance bottlenecks
- Suggest optimization opportunities
- Review audio processing efficiency

Code Quality Agent:
- Check for code smells
- Identify inconsistent patterns
- Suggest best practices

Accessibility Agent:
- Audit UI for WCAG compliance
- Check keyboard navigation
- Review color contrast

IMPROVEMENT TEAM:

Prioritization Agent:
- Rank findings by severity
- Create improvement roadmap
- Estimate effort for each item

Implementation Agent:
- Address high-priority issues
- Implement quick wins first
- Create tickets for larger items

Validation Agent:
- Test all improvements
- Verify no regressions
- Update test suite

Documentation Agent:
- Document changes made
- Update best practices guide
- Create audit report

Execute this comprehensive audit and provide a detailed report.
```

---

## Maintenance and Optimization

### Update Dependencies

**Goal**: Safely update project dependencies

**Prompt**:
```
Dependency update workflow:

ANALYSIS AGENT:
- Check if project has package.json
- Identify any hardcoded CDN dependencies
- Suggest moving to npm if beneficial

SECURITY AGENT:
- Check for known vulnerabilities
- Review security best practices
- Recommend secure configurations

UPDATE AGENT:
- Propose dependency updates
- Create package.json if needed
- Set up proper version constraints

TESTING AGENT:
- Verify functionality after updates
- Test in multiple browsers
- Check for breaking changes

DOCUMENTATION AGENT:
- Update setup instructions
- Document dependency requirements
- Create changelog

Proceed cautiously and verify at each step.
```

### Optimize Performance

**Goal**: Improve load time and runtime performance

**Prompt**:
```
Performance optimization agent chain:

PROFILING AGENT:
- Analyze current performance
- Measure load times
- Identify bottlenecks

OPTIMIZATION AGENT:
- Suggest code optimizations
- Recommend lazy loading strategies
- Propose caching improvements

IMPLEMENTATION AGENT:
- Implement performance improvements
- Add code splitting if beneficial
- Optimize asset loading

BENCHMARKING AGENT:
- Measure performance gains
- Compare before/after metrics
- Validate improvements

DOCUMENTATION AGENT:
- Document optimization techniques used
- Create performance best practices guide
- Update README with performance notes

Execute and provide before/after metrics.
```

### Create Comprehensive Tests

**Goal**: Achieve high test coverage

**Prompt**:
```
Test infrastructure development:

PLANNING AGENT:
- Survey testing needs for Web Audio project
- Recommend testing frameworks
- Propose test organization structure

SETUP AGENT:
- Set up testing framework (Jest recommended)
- Configure test environment
- Create test utilities

TEST DEVELOPMENT TEAM:

Unit Test Agent:
- Write unit tests for each module
- Test parameter ranges
- Verify preset systems

Integration Test Agent:
- Test module interactions
- Verify audio routing
- Check UI updates

E2E Test Agent:
- Create end-to-end scenarios
- Test complete user workflows
- Verify cross-browser compatibility

COVERAGE AGENT:
- Set up coverage reporting
- Identify gaps
- Ensure critical paths tested

DOCUMENTATION AGENT:
- Create testing guide
- Document test patterns
- Add contribution guidelines for tests

Build a robust test suite for the project.
```

---

## Tips for Success

### Writing Effective Agent Prompts

1. **Be Specific About Roles**: Clearly define what each agent should do
2. **Set Boundaries**: Specify what agents should NOT do
3. **Provide Context**: Include relevant information about the codebase
4. **Request Verification**: Ask agents to verify their work
5. **Allow Iteration**: Plan for feedback loops between agents

### Example of a Well-Structured Prompt

```
CONTEXT:
MyAiPlug is a Web Audio mini-studio with modular effects. Each effect 
is a separate file in modules/ that registers with core.js.

GOAL:
Add a Flanger effect module

CONSTRAINTS:
- Must follow existing module pattern
- Use only Web Audio API (no external libraries)
- Keep file size under 1KB
- Include 3 presets minimum

AGENTS NEEDED:
1. Research Agent - Find best Web Audio approach
2. Code Agent - Implement the module
3. Testing Agent - Verify it works
4. Documentation Agent - Update docs

SUCCESS CRITERIA:
- Module loads without errors
- Parameters respond smoothly
- Presets sound good
- Code is well-commented

Please execute this agent chain.
```

### Monitoring Agent Performance

Track these metrics to improve your workflows:

- **Time to completion**: How long the full chain takes
- **Iteration count**: How many loops are needed
- **Quality score**: Subjective rating of output quality
- **Handoff smoothness**: How well agents pass information

---

## Troubleshooting Agent Workflows

### Agent Doesn't Follow Instructions

**Problem**: Agent ignores role assignment or chain structure

**Solution**:
```
You are now acting as the Code Agent. Your ONLY job is to write code.

Do NOT:
- Write documentation
- Create tests
- Make design decisions

DO:
- Write the code as specified
- Add minimal inline comments
- Follow existing code patterns

When done, say "Code Agent task complete. Ready for Testing Agent."
```

### Context Loss Between Agents

**Problem**: Later agents don't have info from earlier agents

**Solution**: Use MCP Memory Server
```
Memory Server: Store the following for future agents:
- Module name: Flanger
- File path: modules/flanger.js
- Parameters: Rate (0.1-10 Hz), Depth (0-100%), Feedback (0-90%)
- Presets: Subtle, Classic, Jet

Next agent can retrieve this info with: "What module details did we store?"
```

### Agent Chain Gets Stuck

**Problem**: Workflow doesn't progress

**Solution**: Add explicit progression
```
ORCHESTRATOR: After each agent completes:
1. Summarize what was done
2. Verify it meets requirements
3. Explicitly call the next agent by name
4. Provide handoff information

Format: "Completed: [task]. Next: @AgentName please [specific task]"
```

---

## Next Steps

1. Try these examples with your MCP-enabled AI client
2. Modify prompts to fit your specific needs
3. Create your own agent patterns
4. Document what works well for future reference

For more information, see:
- [MCP Quick Start Guide](./MCP_QUICKSTART.md)
- [MCP Guide](./MCP_GUIDE.md)
- [Agent Chaining Guide](./AGENT_CHAINING.md)
