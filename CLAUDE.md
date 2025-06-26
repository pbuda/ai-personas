# Claude Persona Manager - Chrome Extension Specification

## Project Overview

Chrome extension for managing personas in Claude.ai with smart tab switching, personalized backgrounds, and comprehensive persona management.

## Core Features

- **Smart Tab Management** - Switches to existing persona conversations or creates new ones
- **Persona Switcher Overlay** - Direct persona switching from Claude.ai interface
- **Personalized Backgrounds** - Site theming based on active persona color
- **Full CRUD Management** - Complete persona management via options page
- **Tab Persistence** - Each tab maintains its persona across refreshes
- **Import/Export** - JSON-based persona backup and sharing

## Tech Stack

- **TypeScript** - Type safety for Chrome APIs
- **Webpack** - Bundle and build management
- **Pure DOM manipulation** - No framework dependencies
- **Chrome Extension Manifest V3**
- **Session Storage** - Tab-specific persona persistence

## Project Structure

```
claude-persona-manager/
├── src/
│   ├── background.ts           # Tab management & message handling
│   ├── content.ts             # Persona injection & UI overlay
│   ├── manifest.json          # Extension configuration
│   ├── types/index.ts         # TypeScript interfaces
│   ├── utils/storage.ts       # Chrome storage utilities
│   ├── popup/                 # Quick persona switching
│   ├── options/               # Full persona management
│   └── icons/                 # Extension icons
├── dist/                      # Build output (git ignored)
├── package.json              # Dependencies & scripts
├── tsconfig.json             # TypeScript configuration
├── webpack.config.js         # Build configuration
└── .gitignore               # Git ignore rules
```

## Development Agreements & Standards

### Version Management

**CRITICAL**: Always keep `package.json` and `src/manifest.json` versions synchronized!

#### Version Synchronization Rules

1. **Major and Minor versions MUST match** between `package.json` and `src/manifest.json`
2. **Patch versions SHOULD match** (slight differences acceptable for build-specific needs)
3. **Always update both files** when bumping major or minor versions

#### Versioning Guidelines

- **Patch (0.0.x)**: Bug fixes, styling tweaks, small improvements
- **Minor (0.x.0)**: New features, significant enhancements
- **Major (x.0.0)**: Breaking changes, major architecture changes

#### Version Update Process

1. **Determine version type** (patch/minor/major)
2. **Update `src/manifest.json`** first (primary source)
3. **Update `package.json`** to match major.minor
4. **Run `npm install`** to sync package-lock.json
5. **Commit with version in message**: `"v0.1.3: Fix tab persona persistence bug"`

### Build & Release Workflow

#### Development Workflow

1. **Make changes** in `src/` directory
2. **Update versions** if significant changes (see version guidelines above)
3. **Run `npm install`** after package.json version changes
4. **Wait for explicit release command** before running `npm run build`

#### Release Process

- **Development**: Only run `npm install` after version updates
- **Production**: Only run `npm run build` when explicitly requested for release
- **Never**: Run build automatically after version changes

### Git Repository Standards

#### Local Configuration

- **All git config must be local** (`--local` flag required)
- **User name**: "Piotr Buda"
- **User email**: "pibuda@gmail.com"

#### Files to Ignore

- `node_modules/` - Dependencies
- `dist/` - Build output
- `CLAUDE.md` - Project instructions (not committed)
- Standard IDE and OS files

### GitHub Integration

- **Issues link**: Embedded in persona switcher overlay (🐛 button)
- **Repository**: `git@github.com:pbuda/ai-personas.git`
- **Commit messages**: Include version numbers for releases

## Key Features Implementation

### Smart Tab Switching

- **Background script** tracks persona-tab associations
- **Existing tabs**: Switch directly without confirmation
- **New conversations**: Show confirmation if enabled in settings
- **Cross-window support**: Focus correct window when switching

### Tab Persistence

- **Session Storage**: Each tab stores its persona ID
- **Refresh-safe**: Persona maintained across page reloads
- **Tab-specific**: Independent persona per tab
- **Auto-cleanup**: Session storage clears on tab close

### Persona Switcher Overlay

- **Always visible**: Floating overlay on Claude.ai
- **All personas**: Show complete list with color indicators
- **Active highlighting**: Visual indication of current persona
- **Quick actions**: Manage, Issues, Add buttons
- **Settings respect**: Can be disabled via options

### Personalized Backgrounds

- **Dynamic theming**: Site colors match active persona
- **Strong opacity**: Enhanced visibility (12-20% gradient)
- **Multiple elements**: Body, content, messages, inputs, headers
- **Settings controlled**: Can be toggled on/off
- **Performance optimized**: CSS injection with cleanup

### Full Options Page

- **Complete CRUD**: Add, edit, delete, activate personas
- **Import/Export**: JSON-based backup/restore
- **Settings management**: All extension preferences
- **Visual previews**: Persona colors and descriptions
- **Validation**: Required fields, character limits

## Technical Standards

### Message Passing Architecture

- **Background ↔ Content**: Persona switching, tab registration
- **Content → Background**: Options page opening, confirmation dialogs
- **Proper cleanup**: Remove listeners and observers
- **Error handling**: Graceful fallbacks for failed operations

### Storage Strategy

- **Chrome Local Storage**: Personas, settings, active persona
- **Session Storage**: Tab-specific persona associations
- **No cross-contamination**: Tab storage independent
- **Data validation**: Type checking and sanitization

### Performance Requirements

- **Observer cleanup**: Disconnect after injection
- **Minimal DOM queries**: Cache selectors and elements
- **Efficient styling**: CSS injection over inline styles
- **Memory management**: Remove unused event listeners

### Security Practices

- **Input sanitization**: Escape all user content in HTML
- **XSS prevention**: No innerHTML with user data
- **Content Security**: Proper script isolation
- **Storage limits**: Handle quota exceeded gracefully

## Development Environment

### Required Tools

- Node.js with npm
- TypeScript compiler
- Chrome browser for testing
- Git for version control

### Quick Commands

```bash
npm install          # Sync dependencies after version changes
npm run dev          # Development build with watch mode
npm run clean        # Clean build artifacts
grep '"version"' package.json src/manifest.json  # Check version sync
```

### Testing Process

1. **Load extension** in `chrome://extensions` (Developer mode)
2. **Point to `dist/` folder** (not src)
3. **Refresh after changes** using "Update" button
4. **Test on claude.ai** with console open for debugging
5. **Verify across tabs** and browser windows

## Current Status

### Implemented Features

✅ Smart tab switching with existing conversation detection  
✅ Persona switcher overlay with all personas  
✅ Personalized backgrounds with strong theming  
✅ Tab-specific persona persistence across refreshes  
✅ Complete options page with CRUD operations  
✅ Import/Export functionality for personas  
✅ Settings management for all preferences  
✅ GitHub issues integration in overlay  
✅ Confirmation dialogs for new conversations only  

### Active Development

🔧 Debugging persona prompt injection issues  
🔧 Console logging for troubleshooting  
🔧 Race condition fixes in content script  

## Support & Issues

- **GitHub Issues**: https://github.com/pbuda/ai-personas/issues
- **Direct Access**: 🐛 button in persona switcher overlay
- **Debug Mode**: Check browser console for extension logs