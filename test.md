Generate a CLAUDE.MD file for this project:

**Project**: Web app using typescript, this will be used to run automations and AI Agents as well using OpenAI Agents JS SDK. We will be connecting several social API's from youtube, instagram and tiktok then scraping the data to display in our table. A file 'kentab_ui.html' has been provided for the table and theme.
**Stack**: Typescript, openai agents js SDK

Include ALL of these sections:

## Project Overview
- What this project does and its architecture
- Key dependencies and their purposes
- Directory structure explanation

## Development Commands
```bash
# Core commands
build: 
test: 
lint: 
format: 
typecheck: 
run: 
dev: 

# Git workflow
pre-commit: 
```

## Code Standards
- **Files**: Max 300 lines, split into focused modules, one class/component per file
- **Functions**: Max 50 lines, single responsibility, max 5 params, early returns
- **Testing**: Write tests FIRST (TDD), mirror source file names, independent tests
- **Errors**: Explicit handling, proper logging, clear messages, never silent catches
- **Documentation**: Document all public APIs, explain "why" not "what"
- **Security**: No hardcoded secrets, validate all inputs, use env vars

## Development Workflow
1. Write failing test first
2. Implement minimal code to pass
3. Run linting and type checking
4. Commit with clear message
5. Never commit: commented code, debug logs, generated files

## Stack-Specific Guidelines
[Framework conventions, package manager quirks, common patterns] <-- Edit this

## Critical Rules
- Run ALL tests before saying "done"
- Check linting and formatting before commits
- Ask before installing new dependencies
- Follow existing patterns in the codebase
- When fixing issues, verify the fix works

## Project-Specific Context
Web app will be deployed to Netlify

Keep it concise but comprehensive. This file will be loaded into every Claude Code session.