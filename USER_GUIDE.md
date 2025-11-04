# Modernozation Microservice Detailed Design Wizard – Quick Guide

This wizard helps you fill a complete microservice detailed design and export it as Markdown or a Word document.

## Before you start
- To run this wizard, double-click "external/external_detailed_design.html". It will open in your browser.
- Fill “Service name” first. Exports are enabled only after this.
- Required fields are marked with “*”. If something is missing, the export shows “TBD”.

## Navigation
- Use the numbered pills at the top to jump between sections.
- Click Next/Back inside a step to move sequentially.

## Action buttons (top-right)
- Import Json: Load a previously saved JSON file and continue where you left off.
- Save Progress: Exports your current work as JSON. You can import it later.
- Export Markdown: Exports the design as a Markdown (.md) file with “TBD” markers.
- Export full .doc: Exports a true DOCX file in landscape with a clickable Table of Contents. The file is named {service-name}-DetailedDesign-{version}.docx.
- Clear Form: Resets everything to the initial state (also clears local saved state).

Notes:
- The version in exported filenames comes from the “Version” field in Service Overview. If it matches your last export, it auto-increments the patch number on Save Progress.
- Import Json works at any time (no service name needed) to restore your progress.

## Dynamic inputs and context help
- Many inputs are dropdowns/multi-selects to reduce free text.
- Some sections change based on choices (e.g., Kafka vs RabbitMQ, SQL vs Document DB). When options change, required fields and file types adapt automatically.
- Hover over inputs and read the small help text under fields for guidance.

## API Specifications
- You can upload an OpenAPI/Swagger JSON. Endpoints are parsed and included in exports.

## Events (Messaging)
- For each event, choose the broker (RabbitMQ or Kafka). The wizard shows fields relevant to your selection. Both summary tables and detailed lists are exported.

## Data Storage
- Choose the primary database type. For Document DB, upload JSON; for Relational DB, upload SQL/DDL. Multiple schemas are supported.

## Troubleshooting
- Exports blocked? Make sure “Service name” is filled in Step 1.
- Missing field in DOCX? The export shows a detailed list under each section; look for red “TBD”.
- Clear Form didn’t reset? Click Clear Form again; the page should return to its initial state.


