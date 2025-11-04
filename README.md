# Microservice Design Document Wizard

A standalone Single Page Application (SPA) built with vanilla HTML, CSS, and JavaScript that helps you create comprehensive microservice design documents step by step.

## Features

### ✨ Step-by-Step Wizard Interface
- **15 comprehensive steps** covering all aspects of microservice design
- **Visual progress tracker** showing completion percentage
- **Easy navigation** between steps with Previous/Next buttons
- **Click-step navigation** - jump to any step directly

### 💾 Auto-Save & Persistence
- **Automatic local storage** - your progress is saved automatically as you type
- **No data loss** - refresh the page without losing your work
- **Progress tracking** - see how much of the document you've completed

### 📤 Import/Export Functionality
- **Export to JSON** - save your work as a JSON file
- **Import from JSON** - resume your work from a saved file
- **Export to Markdown** - generate a filled template ready to use

### 🎨 Professional UI/UX
- **Modern design** - clean, professional interface
- **Responsive layout** - works on desktop, tablet, and mobile
- **Intuitive forms** - well-organized input fields
- **Dynamic lists** - add/remove items like services, events, decisions

### 📋 Comprehensive Coverage

The wizard covers all sections from the microservice design template:

1. **Service Overview** - Name, team, purpose, business context
2. **Service Boundaries** - Functionality, dependencies, consumers
3. **API Specifications** - REST API details, endpoints, documentation
4. **Message Broker Integration** - Rationale, technology, events
5. **Data Storage** - Database, caching, schema design
6. **Security** - Authentication, authorization, data protection
7. **Observability** - Logging, metrics, tracing
8. **Performance & Scalability** - Latency, throughput, scaling
9. **Disaster Recovery** - Circuit breakers, failover, backups
10. **Testing Strategy** - Unit, integration, performance, chaos testing
11. **Deployment** - Containerization, orchestration, CI/CD
12. **Compliance** - GDPR, HIPAA, PCI-DSS, audit trails
13. **Open Questions** - Decisions made, pending questions
14. **Review & Approval** - Stakeholders, approval status
15. **Appendix** - Documentation links, metadata

## Quick Start

### Option 1: Open Directly in Browser
Simply open `index.html` in any modern web browser:
- Double-click the `index.html` file
- Or drag it into your browser window
- Or use `file://` protocol: `file:///path/to/spa/index.html`

### Option 2: Use a Local Server (Recommended)

For the best experience, use a local web server:

#### Python 3:
```bash
cd /Users/amir.goldschmidtgmail.com/spa
python3 -m http.server 8000
```
Then open: http://localhost:8000

#### Node.js (http-server):
```bash
npx http-server -p 8000
```

#### PHP:
```bash
php -S localhost:8000
```

## Usage Guide

### Starting a New Document
1. Open the application in your browser
2. Navigate through steps using Next/Previous buttons
3. Fill in the information for each section
4. Your progress is automatically saved locally

### Adding Dynamic Items
- **Services**: Click "+ Add Downstream/Upstream Service" to add services
- **Events**: Click "+ Add Published/Consumed Event" to add messaging events
- **Decisions**: Click "+ Add Decision" to document decisions
- **Questions**: Click "+ Add Question" to track open questions
- **Remove**: Click "Remove" button on any item to delete it

### Exporting Your Work
1. **Export JSON**: Saves your progress as a JSON file that you can import later
   - Click "Export JSON" button
   - File is automatically downloaded
   
2. **Export Markdown**: Generates a filled template
   - Click "Export Markdown" button
   - A markdown file with all your information is generated
   - Ready to use as your design document

### Importing Previous Work
1. Click "Import JSON" button
2. Select your previously exported JSON file
3. Your data will be loaded and you can continue editing

### Progress Tracking
- The progress bar at the top shows completion percentage
- Green dots indicate completed steps
- Active step is highlighted in blue

## File Structure

```
spa/
├── index.html              # Main HTML structure
├── styles.css              # All styling
├── wizard.js              # Core wizard logic, state management
├── template-renderer.js   # Markdown generation
├── README.md              # This file
└── microservice_design_Template.md  # Original template
```

## Technical Details

### Technologies Used
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables, flexbox, grid
- **Vanilla JavaScript** - No dependencies, lightweight
- **LocalStorage API** - Client-side persistence
- **Blob API** - File downloads

### Browser Compatibility
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

### Data Storage
- Uses browser's `localStorage` for auto-save
- Data key: `microserviceDesignWizard`
- Persists across browser sessions
- Clearing browser data will remove stored progress (export regularly!)

### Privacy & Security
- **100% client-side** - no server, no data transmission
- **Local processing** - all work done in your browser
- **No tracking** - zero analytics or tracking
- **Offline capable** - works without internet

## Tips & Best Practices

1. **Save Regularly**: Export to JSON frequently to avoid data loss
2. **Complete Sections**: Fill out sections systematically
3. **Review Often**: Use the progress bar to see what's missing
4. **Iterate**: Import JSON, make changes, export again
5. **Version Control**: Save different versions with descriptive names

## Troubleshooting

### Data Not Saving
- Check browser settings - ensure localStorage is enabled
- Check browser console for errors
- Try clearing browser cache and reloading

### Progress Bar Not Updating
- Refresh the page
- Check that input fields have `data-path` attributes

### Import Not Working
- Ensure file is valid JSON
- Check file was exported from this wizard
- Look for error messages in browser console

### Export Not Working
- Check browser popup blockers
- Ensure downloads are allowed for your browser
- Try different browser if issue persists

## Customization

### Modifying Template Structure
To add more fields or sections:
1. Update `index.html` to add input fields
2. Update `wizard.js` to handle new fields in state
3. Update `template-renderer.js` to render new fields in markdown

### Styling
Edit `styles.css` to customize:
- Colors: Modify CSS variables in `:root`
- Layout: Adjust flexbox/grid properties
- Typography: Change font families and sizes

## Future Enhancements

Potential features to consider:
- [ ] Multiple document management
- [ ] Collaborative editing (WebRTC/WebSocket)
- [ ] Template customization
- [ ] Print-friendly view
- [ ] Dark mode
- [ ] Undo/redo functionality
- [ ] Field validation
- [ ] Pre-filled templates by service type

## License

This is a standalone tool for internal use. Feel free to modify and adapt to your needs.

## Support

For questions or issues:
1. Check this README
2. Review browser console for errors
3. Ensure you're using a modern browser

---

**Version:** 1.0.0  
**Last Updated:** 2024

