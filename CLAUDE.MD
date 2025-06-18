# Universal AI Coding Assistant Rules

## Core Principles
- **Never assume. Always research with 90%+ confidence or ask.**
- **Simplicity over complexity. Clean over clever.**
- **Test everything. Break nothing.**

## 1. Research & Knowledge
- **ALWAYS** check Context7/documentation before implementing
- If confidence < 90%, research using Context7 or web search
- If approach unclear after research, inform user before proceeding
- No assumptions about syntax, patterns, or best practices

## 2. Code Structure
- **300 LOC maximum** per file/module (unless justified)
- **One primary purpose** per file/module
- Split when file becomes complex or serves multiple purposes
- Sequential thinking for complex problems - break into steps

## 3. Code Quality
- **Simple solutions only** - if one approach works, use it (no multiple fallbacks)
- Early returns over nested conditions
- Clear variable/function names that explain purpose
- Remove all commented-out code
- No premature optimization

## 4. File Organization
- Descriptive names that explain file purpose
- Group related files in folders
- Maximum 3-4 folder nesting levels
- Consistent naming convention throughout project

## 5. Import Management
- Remove ALL unused imports after changes
- Order imports logically (standard → third-party → local)
- Check imports after refactoring
- One import statement per line

## 6. Testing Protocol
- Run existing tests after ANY code change
- Write unit tests for new functions/features
- Write integration tests for APIs/major features
- Verify all tests pass before completing work
- Only skip tests for comment/documentation changes

## 7. Error Handling
- Handle all external calls (APIs, database, file operations)
- User errors: Show clear, actionable messages
- System errors: Log internally, show generic "Something went wrong" to user
- Never expose stack traces or system details to users
- Always handle edge cases explicitly

## 8. Logging Strategy
### Development
- Use environment flag for debug logs
- Log format: `[timestamp] [module/function] [level] message`
- Log: function entry (with params), state changes, external calls, errors
- Include context for debugging

### Production
- Only log system errors and critical issues
- User errors show helpful messages (not logs)
- No console outputs visible to users
- Remove/disable debug logging

## 9. Production Build
- Remove all debug code and logging
- Minify/optimize where applicable
- Remove development dependencies
- Validate no sensitive data in code
- Apply platform-appropriate optimizations

## 10. Code Changes Protocol
1. Research approach using Context7/documentation
2. Implement changes
3. Clean up imports
4. Run tests
5. Add/update tests if needed
6. Verify no regressions
7. Ensure debug logging added for new features

## 11. Comments & Documentation
- Comment WHY, not WHAT
- Document complex algorithms
- Add examples for utility functions
- Keep comments updated with code changes
- Remove outdated comments

## 12. Security & Validation
- Validate ALL user inputs
- Sanitize data before database operations
- Never trust external data
- Use parameterized queries (if applicable)
- Hash passwords appropriately (if applicable)

## 13. MANDATORY POST-EXECUTION STEP
After completing any code modification task, you must:

1. Run: `find . -name "src" -type d | head -1 | xargs tokei --files -t typescript,javascript,python,rust,go,java,cpp,c`
2. Identify any files exceeding 300 lines of code
3. For each violation, provide specific refactoring recommendations

---

# Language-Specific Applications

## If TypeScript/JavaScript
- File naming: camelCase (`userAuth.ts`), PascalCase for components
- Tree-shaking and bundling for production
- Console.log for debug logging with NODE_ENV check
- Jest/Vitest for testing

## If Python
- File naming: snake_case (`user_auth.py`)
- Use logging module with DEBUG level
- No tree-shaking - use requirements.txt for dependencies
- pytest for testing framework

## If HTML/CSS
- File naming: kebab-case (`user-profile.html`)
- Semantic HTML elements required
- Mobile-first CSS approach
- Minify for production

## If Rust
- File naming: snake_case (`user_auth.rs`)
- Use `Result<T, E>` for error handling
- `cargo build --release` for production
- Use `log` crate for logging

# Important

- Always address the user as "Ken" for every response back to the user