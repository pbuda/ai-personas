# Claude Persona Manager

A Chrome extension that enables seamless persona management for Claude.ai with smart tab switching, personalized theming, and comprehensive persona management.

## ✨ Features

### 🎭 **Smart Persona Management**
- **Multiple Personas**: Create unlimited personas with custom prompts, names, and colors
- **Smart Tab Switching**: Automatically switches to existing persona conversations or creates new ones
- **Tab Persistence**: Each tab maintains its persona across page refreshes
- **Visual Theming**: Site background adapts to active persona color

### 🚀 **Enhanced User Experience**
- **Overlay Interface**: Direct persona switching from Claude.ai without leaving the page
- **No Confirmation for Existing Tabs**: Instant switching to already-open persona conversations
- **Personalized Backgrounds**: Strong visual themes based on persona colors
- **Quick Actions**: Easy access to manage personas and report issues

### ⚙️ **Comprehensive Management**
- **Full CRUD Operations**: Add, edit, delete, and organize personas
- **Import/Export**: JSON-based backup and sharing of persona collections
- **Settings Control**: Customize extension behavior (confirmations, theming, etc.)
- **GitHub Integration**: Direct issue reporting from the extension

## 🚀 Quick Start

### Prerequisites
- Chrome browser (or Chromium-based browser)
- Git (for cloning the repository)
- Node.js and npm (for building from source)

### Installation

Since this extension is not yet available in the Chrome Web Store, you'll need to build and install it manually:

1. **Clone** the repository:
   ```bash
   git clone git@github.com:pbuda/ai-personas.git
   cd ai-personas
   ```

2. **Install** dependencies:
   ```bash
   npm install
   ```

3. **Build** the extension:
   ```bash
   npm run build
   ```

4. **Load** in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked" button
   - Select the `dist/` folder (not the root folder!)

5. **Start using** the extension on [Claude.ai](https://claude.ai)

## 📖 How to Use

### Creating Your First Persona

1. **Click** the extension icon in Chrome's toolbar or look for the floating persona switcher on Claude.ai
2. **Click** "Manage" or "+ Add Persona" 
3. **Fill in** the persona details:
   - **Name**: A descriptive name for your persona
   - **Description**: Optional short description
   - **Color**: Visual theme color for the persona
   - **Prompt**: The system prompt that defines the persona's behavior
4. **Save** the persona

### Switching Between Personas

1. **Visit** [Claude.ai](https://claude.ai)
2. **Use** the floating persona switcher overlay on the right side
3. **Click** any persona to switch:
   - **Existing conversation**: Switches to that tab instantly
   - **New conversation**: Creates a new conversation with that persona

### Managing Personas

- **Edit**: Click "Manage" → Edit any persona's details
- **Delete**: Remove personas you no longer need
- **Export**: Backup your personas as JSON
- **Import**: Share personas with others or restore from backup
- **Settings**: Customize extension behavior

## 🛠️ Development

### Project Structure
```
claude-persona-manager/
├── src/                    # Source code
│   ├── background.ts       # Extension background script
│   ├── content.ts         # Claude.ai page integration
│   ├── manifest.json      # Extension configuration
│   ├── popup/             # Extension popup UI
│   ├── options/           # Settings and management UI
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Shared utilities
├── dist/                  # Built extension (created after build)
├── package.json           # Dependencies and scripts
└── webpack.config.js      # Build configuration
```

### Development Commands

```bash
# Install dependencies
npm install

# Development build with file watching
npm run dev

# Production build
npm run build

# Clean build artifacts
npm run clean

# Check version synchronization
grep '"version"' package.json src/manifest.json
```

### Testing Changes

1. **Make changes** in the `src/` directory
2. **Rebuild** the extension (`npm run build`)
3. **Reload** the extension in `chrome://extensions` (click "Update")
4. **Refresh** Claude.ai tabs to see changes

## 🐛 Troubleshooting

### Extension Not Working
- Ensure you loaded the `dist/` folder (not the root folder)
- Check that Developer mode is enabled in Chrome
- Reload the extension after any changes

### Personas Not Switching
- Check browser console (F12) for error messages
- Ensure you have personas created in the options page
- Try refreshing the Claude.ai page

### Background Not Changing
- Check if "Apply persona color to site background" is enabled in settings
- Ensure the persona has a color assigned
- Try switching to a different persona to see if the issue persists

### Getting Help
- **Report Issues**: Click the 🐛 button in the persona switcher or visit [GitHub Issues](https://github.com/pbuda/ai-personas/issues)
- **Debug Mode**: Open browser console to see extension logs
- **Reset Extension**: Remove and reload the extension to start fresh

## 🔒 Privacy & Security

- **Local Storage Only**: All persona data is stored locally in your browser
- **No External Servers**: No data is sent to external services
- **Open Source**: Full source code available for audit
- **Minimal Permissions**: Only requests necessary Chrome extension permissions

## 🤝 Contributing

Contributions are welcome! Please:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code style and TypeScript practices
- Update version numbers in both `package.json` and `src/manifest.json`
- Test thoroughly across different personas and browser scenarios
- Add appropriate console logging for debugging

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the [Claude.ai](https://claude.ai) platform by Anthropic
- Inspired by the need for better persona management in AI conversations
- Thanks to the Chrome Extensions API for making this possible

---

**Note**: This extension is not affiliated with or endorsed by Anthropic. Claude is a trademark of Anthropic.