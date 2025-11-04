// Wizard state management
const wizardState = {
    currentStep: 1,
    totalSteps: 15,
    data: {
        serviceName: '',
        teamOwner: '',
        date: new Date().toISOString().split('T')[0],
        version: '1.0',
        status: 'Draft',
        businessProblem: '',
        businessObjectives: '',
        servicePurpose: '',
        coreFunctionalities: '',
        downstream: [],
        upstream: [],
        apiSpec: {},
        messagingRationale: {},
        messagingTech: {},
        publishedEvents: [],
        consumedEvents: [],
        database: {},
        databaseSchemas: [],
        cache: {},
        security: {},
        observability: {},
        performance: {},
        dr: {},
        testing: {},
        deployment: {},
        compliance: {},
        decisions: [],
        openQuestions: [],
        review: {},
        appendix: {}
    }
};

// Step names for display
const stepNames = [
    'Overview', 'Boundaries', 'API', 'Messaging', 'Storage', 'Security',
    'Observability', 'Performance', 'Disaster Recovery', 'Testing',
    'Deployment', 'Compliance', 'Questions', 'Review', 'Appendix'
];

// Initialize wizard
document.addEventListener('DOMContentLoaded', function() {
    loadFromStorage();
    initializeWizard();
    setupEventListeners();
});

function initializeWizard() {
    // Initialize downstream and upstream services with one item if not loaded from storage
    if (!wizardState.data.downstream || wizardState.data.downstream.length === 0) {
        wizardState.data.downstream = [{ name: '', context: '', protocol: 'REST' }];
    }
    if (!wizardState.data.upstream || wizardState.data.upstream.length === 0) {
        wizardState.data.upstream = [{ name: '', useCase: '', protocol: 'REST' }];
    }
    
    renderStepIndicator();
    showStep(wizardState.currentStep);
    updateCounter();
}

function setupEventListeners() {
    // Navigation buttons
    document.getElementById('prevBtn').addEventListener('click', () => {
        if (wizardState.currentStep > 1) {
            showStep(wizardState.currentStep - 1);
        }
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
        if (wizardState.currentStep < wizardState.totalSteps) {
            if (validateCurrentStep()) {
                showStep(wizardState.currentStep + 1);
            }
        }
    });

    // Import/Export buttons
    document.getElementById('importBtn').addEventListener('click', importFromJSON);
    document.getElementById('exportJsonBtn').addEventListener('click', exportToJSON);
    document.getElementById('exportMarkdownBtn').addEventListener('click', exportToMarkdown);
    document.getElementById('exportDocBtn').addEventListener('click', exportToWord);
    document.getElementById('jsonFileInput').addEventListener('change', handleFileImport);
    
    // API Spec file upload
    const apiSpecFile = document.getElementById('apiSpecFile');
    if (apiSpecFile) {
        apiSpecFile.addEventListener('change', handleAPISpecUpload);
    }
    
    // Database technology change listener
    setupDatabaseTechListener();

    // Auto-save on input change
    document.querySelectorAll('input, textarea, select').forEach(element => {
        element.addEventListener('input', () => {
            saveToInputs();
            saveToStorage();
            updateCounter();
        });
        element.addEventListener('change', () => {
            saveToInputs();
            saveToStorage();
            updateCounter();
        });
    });

}

function renderStepIndicator() {
    const indicator = document.getElementById('stepIndicator');
    indicator.innerHTML = '';
    
    for (let i = 1; i <= wizardState.totalSteps; i++) {
        const dot = document.createElement('div');
        dot.className = 'step-dot';
        dot.innerHTML = `<span class="step-number">${i}</span><span class="step-name">${stepNames[i-1]}</span>`;
        dot.dataset.step = i;
        
        if (i === wizardState.currentStep) {
            dot.classList.add('active');
        } else if (i < wizardState.currentStep) {
            dot.classList.add('completed');
        }
        
        // Add click listener to each dot
        dot.addEventListener('click', () => showStep(i));
        
        indicator.appendChild(dot);
    }
}

function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    
    // Show current step
    const currentStepElement = document.querySelector(`.step[data-step="${step}"]`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
    }
    
    wizardState.currentStep = step;
    
    // Load data into inputs for this step
    loadToInputs();
    
    // Special handling for API step
    if (step === 3 && wizardState.data.apiSpec && wizardState.data.apiSpec.endpoints) {
        displayAPIEndpoints(wizardState.data.apiSpec.endpoints);
    }
    
    // Special handling for Messaging step - render existing events
    if (step === 4) {
        renderExistingEvents('published');
        renderExistingEvents('consumed');
    }
    
    // Special handling for Data Storage step - render existing schemas
    if (step === 5) {
        const selectedDb = wizardState.data.database?.technology || '';
        updateSchemaInputsBasedOnDbType(selectedDb);
    }
    
    // Update navigation buttons
    document.getElementById('prevBtn').disabled = step === 1;
    document.getElementById('nextBtn').textContent = step === wizardState.totalSteps ? 'Finish' : 'Next';
    
    // Update step indicator
    renderStepIndicator();
    
    // Save progress
    saveToStorage();
}

function validateCurrentStep() {
    const currentStepElement = document.querySelector(`.step[data-step="${wizardState.currentStep}"]`);
    if (!currentStepElement) return true;
    
    // Clear previous errors
    currentStepElement.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
    currentStepElement.querySelectorAll('.validation-error').forEach(el => el.remove());
    
    let isValid = true;
    const errors = [];
    
    // Get all required inputs in current step
    const requiredInputs = currentStepElement.querySelectorAll('input[required], select[required], textarea[required]');
    
    requiredInputs.forEach(input => {
        const value = input.type === 'checkbox' ? input.checked : input.value.trim();
        
        if (!value) {
            isValid = false;
            input.classList.add('invalid');
            
            const errorMsg = document.createElement('span');
            errorMsg.className = 'validation-error';
            errorMsg.textContent = `${input.placeholder || input.name || 'This field'} is required`;
            input.parentNode.appendChild(errorMsg);
        }
    });
    
    // Special validation for events on messaging step (step 4)
    if (wizardState.currentStep === 4) {
        const publishedEvents = wizardState.data.publishedEvents || [];
        const consumedEvents = wizardState.data.consumedEvents || [];
        
        // Validate each published event
        publishedEvents.forEach((event, index) => {
            if (!event.broker) {
                isValid = false;
                errors.push(`Published Event ${index + 1}: Broker selection is required`);
            } else if (!event.name) {
                isValid = false;
                errors.push(`Published Event ${index + 1}: Event name is required`);
            } else if (event.broker === 'RabbitMQ' && !event.exchange) {
                isValid = false;
                errors.push(`Published Event ${index + 1}: Exchange is required for RabbitMQ`);
            } else if (event.broker === 'Kafka' && !event.topic) {
                isValid = false;
                errors.push(`Published Event ${index + 1}: Topic is required for Kafka`);
            }
        });
        
        // Validate each consumed event
        consumedEvents.forEach((event, index) => {
            if (!event.broker) {
                isValid = false;
                errors.push(`Consumed Event ${index + 1}: Broker selection is required`);
            } else if (!event.name) {
                isValid = false;
                errors.push(`Consumed Event ${index + 1}: Event name is required`);
            } else if (event.broker === 'RabbitMQ') {
                if (!event.exchange) {
                    isValid = false;
                    errors.push(`Consumed Event ${index + 1}: Exchange is required for RabbitMQ`);
                }
                if (!event.queue) {
                    isValid = false;
                    errors.push(`Consumed Event ${index + 1}: Queue is required for RabbitMQ`);
                }
            } else if (event.broker === 'Kafka') {
                if (!event.topic) {
                    isValid = false;
                    errors.push(`Consumed Event ${index + 1}: Topic is required for Kafka`);
                }
                if (!event.consumerGroup) {
                    isValid = false;
                    errors.push(`Consumed Event ${index + 1}: Consumer Group is required for Kafka`);
                }
            }
        });
    }
    
    // Show general errors if any
    if (errors.length > 0) {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'validation-error-message';
        errorContainer.style.cssText = 'background-color: #fef2f2; border: 2px solid var(--danger-color); border-radius: 6px; padding: 15px; margin-bottom: 20px;';
        errorContainer.innerHTML = '<strong style="color: var(--danger-color);">Please fix the following errors:</strong><ul style="margin: 10px 0 0 20px; color: var(--danger-color);">' + 
            errors.map(e => `<li>${e}</li>`).join('') + '</ul>';
        
        const firstFormGroup = currentStepElement.querySelector('.form-group');
        if (firstFormGroup) {
            firstFormGroup.parentNode.insertBefore(errorContainer, firstFormGroup);
        } else {
            currentStepElement.insertBefore(errorContainer, currentStepElement.firstChild);
        }
    }
    
    if (!isValid) {
        // Scroll to first error
        const firstError = currentStepElement.querySelector('.invalid');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
    }
    
    return isValid;
}

function saveToInputs() {
    document.querySelectorAll('input, textarea, select').forEach(element => {
        const path = element.dataset.path;
        if (!path) return;
        
        const value = getValueByType(element);
        setNestedProperty(wizardState.data, path, value);
    });
}

function loadToInputs() {
    document.querySelectorAll('input, textarea, select').forEach(element => {
        const path = element.dataset.path;
        if (!path) return;
        
        const value = getNestedProperty(wizardState.data, path);
        if (value !== undefined && value !== null) {
            setValueByType(element, value);
        }
    });
}

function getValueByType(element) {
    if (element.type === 'checkbox') {
        return element.checked;
    } else if (element.type === 'number') {
        const val = parseInt(element.value);
        return isNaN(val) ? '' : val;
    }
    return element.value;
}

function setValueByType(element, value) {
    if (element.type === 'checkbox') {
        element.checked = value === true;
    } else if (element.type === 'number') {
        element.value = value || '';
    } else {
        element.value = value || '';
    }
}

function getNestedProperty(obj, path) {
    const parts = path.split('.');
    let result = obj;
    
    for (const part of parts) {
        if (result === null || result === undefined) return undefined;
        
        // Handle array notation like "downstream[0].name"
        if (part.includes('[')) {
            const [key, index] = part.split('[');
            const idx = parseInt(index.replace(']', ''));
            result = result[key] ? result[key][idx] : undefined;
        } else {
            result = result[part];
        }
    }
    
    return result;
}

function setNestedProperty(obj, path, value) {
    const parts = path.split('.');
    const lastKey = parts.pop();
    let target = obj;
    
    for (const part of parts) {
        if (!target[part] || typeof target[part] !== 'object') {
            // Handle array notation
            if (part.includes('[')) {
                const [key, index] = part.split('[');
                const idx = parseInt(index.replace(']', ''));
                if (!target[key]) target[key] = [];
                if (!target[key][idx]) target[key][idx] = {};
                target = target[key][idx];
            } else {
                target[part] = {};
                target = target[part];
            }
        } else {
            target = target[part];
        }
    }
    
    // Handle last key if it's array notation
    if (lastKey.includes('[')) {
        const [key, index] = lastKey.split('[');
        const idx = parseInt(index.replace(']', ''));
        if (!target[key]) target[key] = [];
        if (!target[key][idx]) target[key][idx] = {};
        target[key][idx] = value;
    } else {
        target[lastKey] = value;
    }
}

function updateCounter() {
    const totalFields = countCompletedFields(wizardState.data);
    const maxFields = estimateTotalFields();
    const percentage = Math.round((totalFields / maxFields) * 100);
    
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        let afterStyle = document.getElementById('progressBarStyle');
        if (!afterStyle) {
            afterStyle = document.createElement('style');
            afterStyle.id = 'progressBarStyle';
            document.head.appendChild(afterStyle);
        }
        afterStyle.textContent = `#progressBar::after { width: ${percentage}% !important; }`;
    }
    document.getElementById('progressText').textContent = `${percentage}% Complete`;
}

function countCompletedFields(obj, depth = 0) {
    if (depth > 10) return 0;
    
    let count = 0;
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            count += countCompletedFields(obj[key], depth + 1);
        } else if (Array.isArray(obj[key])) {
            count += obj[key].reduce((sum, item) => 
                sum + (typeof item === 'object' ? countCompletedFields(item, depth + 1) : 0), 0);
        } else if (obj[key] !== '' && obj[key] !== null && obj[key] !== undefined) {
            count++;
        }
    }
    return count;
}

function estimateTotalFields() {
    // Rough estimate of total fields in the wizard
    return 200;
}

// Storage functions
function saveToStorage() {
    localStorage.setItem('microserviceDesignWizard', JSON.stringify(wizardState));
}

function loadFromStorage() {
    const saved = localStorage.getItem('microserviceDesignWizard');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            wizardState.data = parsed.data;
            wizardState.currentStep = parsed.currentStep || 1;
            // Don't call loadToInputs or updateCounter here - that happens in 
            // initializeWizard/showStep after the DOM is ready
        } catch (e) {
            console.error('Failed to load from storage:', e);
        }
    }
}

// Dynamic list management
let downstreamIndex = 1;
let upstreamIndex = 1;
let decisionIndex = 0;
let questionIndex = 0;

function addService(type) {
    const listId = type === 'downstream' ? 'downstreamServices' : 'upstreamServices';
    const listContainer = document.getElementById(listId);
    const index = type === 'downstream' ? downstreamIndex++ : upstreamIndex++;
    
    const item = document.createElement('div');
    item.className = 'list-item';
    
    if (type === 'downstream') {
        item.innerHTML = `
            <div class="form-group" style="margin-bottom: 15px;">
                <input type="text" placeholder="Service Name" data-path="${type}[${index}].name" class="form-control">
                <p class="form-help" style="margin-top: 5px;">Name of the service we depend on (e.g., payment-service, notification-service)</p>
            </div>
            <div class="form-group" style="margin-bottom: 15px;">
                <input type="text" placeholder="Context" data-path="${type}[${index}].context" class="form-control">
                <p class="form-help" style="margin-top: 5px;">Business context or purpose of this dependency (e.g., Payment processing, User notifications)</p>
            </div>
            <div class="form-group" style="margin-bottom: 15px;">
                <select data-path="${type}[${index}].protocol" class="form-control" required>
                    <option>REST</option>
                    <option>RabbitMQ</option>
                    <option>Kafka</option>
                </select>
                <p class="form-help" style="margin-top: 5px;">Communication protocol used to interact with this service</p>
            </div>
            <button class="btn btn-remove" onclick="removeItem(this, '${type}')">Remove</button>
        `;
        if (!wizardState.data.downstream) wizardState.data.downstream = [];
        wizardState.data.downstream.push({ name: '', context: '', protocol: 'REST' });
    } else {
        item.innerHTML = `
            <div class="form-group" style="margin-bottom: 15px;">
                <input type="text" placeholder="Service Name" data-path="${type}[${index}].name" class="form-control">
                <p class="form-help" style="margin-top: 5px;">Name of the service that depends on us (e.g., frontend-app, mobile-app)</p>
            </div>
            <div class="form-group" style="margin-bottom: 15px;">
                <input type="text" placeholder="Use Case" data-path="${type}[${index}].useCase" class="form-control">
                <p class="form-help" style="margin-top: 5px;">How this service uses our service (e.g., Display user profile, Fetch payment status)</p>
            </div>
            <div class="form-group" style="margin-bottom: 15px;">
                <select data-path="${type}[${index}].protocol" class="form-control" required>
                    <option>REST</option>
                    <option>RabbitMQ</option>
                    <option>Kafka</option>
                </select>
                <p class="form-help" style="margin-top: 5px;">Communication protocol used to interact with our service</p>
            </div>
            <button class="btn btn-remove" onclick="removeItem(this, '${type}')">Remove</button>
        `;
        if (!wizardState.data.upstream) wizardState.data.upstream = [];
        wizardState.data.upstream.push({ name: '', useCase: '', protocol: 'REST' });
    }
    
    listContainer.appendChild(item);
    
    // Add event listeners
    item.querySelectorAll('input, select').forEach(element => {
        element.addEventListener('input', () => {
            saveToInputs();
            saveToStorage();
            updateCounter();
        });
    });
}

function removeItem(button, type) {
    const item = button.closest('.list-item');
    const index = Array.from(item.parentNode.children).indexOf(item);
    
    if (wizardState.data[type]) {
        wizardState.data[type].splice(index, 1);
    }
    
    item.remove();
    saveToStorage();
    updateCounter();
}

function addEvent(type) {
    const listId = type === 'published' ? 'publishedEvents' : 'consumedEvents';
    const listContainer = document.getElementById(listId);
    
    if (!wizardState.data[listId]) {
        wizardState.data[listId] = [];
    }
    const index = wizardState.data[listId].length;
    
    const item = document.createElement('div');
    item.className = 'list-item event-item';
    item.dataset.index = index;
    
    // Start with broker selection and common fields
    const defaultData = { broker: '', name: '', description: '' };
    
    item.innerHTML = `
        <select class="form-control broker-select" data-path="${listId}[${index}].broker" required>
            <option value="">Select Broker</option>
            <option value="RabbitMQ">RabbitMQ</option>
            <option value="Kafka">Kafka</option>
        </select>
        <input type="text" placeholder="Event Name *" data-path="${listId}[${index}].name" class="form-control" required>
        <div class="broker-specific-fields"></div>
        <button class="btn btn-remove" onclick="removeEventItem(this, '${listId}')">Remove</button>
    `;
    
    wizardState.data[listId].push(defaultData);
    listContainer.appendChild(item);
    
    // Add event listener for broker selection
    const brokerSelect = item.querySelector('.broker-select');
    brokerSelect.addEventListener('change', (e) => handleBrokerChange(e, listId, index, type));
    
    // Add event listeners for all inputs
    item.querySelectorAll('input').forEach(element => {
        element.addEventListener('input', () => {
            saveToInputs();
            saveToStorage();
            updateCounter();
        });
    });
    
    saveToStorage();
    updateCounter();
}

function handleBrokerChange(event, listId, index, eventType) {
    const broker = event.target.value;
    const item = event.target.closest('.event-item');
    const brokerFieldsContainer = item.querySelector('.broker-specific-fields');
    
    let html = '';
    
    if (broker === 'RabbitMQ') {
        if (eventType === 'published') {
            html = `
                <input type="text" placeholder="Exchange *" data-path="${listId}[${index}].exchange" class="form-control" required>
                <input type="text" placeholder="Routing Key" data-path="${listId}[${index}].routingKey" class="form-control">
                <input type="text" placeholder="Schema Version" data-path="${listId}[${index}].schemaVersion" class="form-control">
                <input type="text" placeholder="Description" data-path="${listId}[${index}].description" class="form-control">
            `;
        } else {
            html = `
                <input type="text" placeholder="Exchange *" data-path="${listId}[${index}].exchange" class="form-control" required>
                <input type="text" placeholder="Queue *" data-path="${listId}[${index}].queue" class="form-control" required>
                <input type="text" placeholder="Binding Key" data-path="${listId}[${index}].bindingKey" class="form-control">
                <input type="text" placeholder="Source Service" data-path="${listId}[${index}].sourceService" class="form-control">
                <input type="text" placeholder="Description" data-path="${listId}[${index}].description" class="form-control">
            `;
        }
    } else if (broker === 'Kafka') {
        if (eventType === 'published') {
            html = `
                <input type="text" placeholder="Topic *" data-path="${listId}[${index}].topic" class="form-control" required>
                <input type="text" placeholder="Partition Key" data-path="${listId}[${index}].partitionKey" class="form-control">
                <input type="number" placeholder="Partitions" data-path="${listId}[${index}].partitions" class="form-control">
                <input type="number" placeholder="Replication Factor" data-path="${listId}[${index}].replicationFactor" class="form-control">
                <input type="text" placeholder="Retention Period" data-path="${listId}[${index}].retentionPeriod" class="form-control">
                <input type="text" placeholder="Description" data-path="${listId}[${index}].description" class="form-control">
            `;
        } else {
            html = `
                <input type="text" placeholder="Topic *" data-path="${listId}[${index}].topic" class="form-control" required>
                <input type="text" placeholder="Consumer Group *" data-path="${listId}[${index}].consumerGroup" class="form-control" required>
                <input type="text" placeholder="Source System" data-path="${listId}[${index}].sourceSystem" class="form-control">
                <input type="text" placeholder="Description" data-path="${listId}[${index}].description" class="form-control">
            `;
        }
    }
    
    brokerFieldsContainer.innerHTML = html;
    
    // Add event listeners to new inputs
    brokerFieldsContainer.querySelectorAll('input').forEach(element => {
        element.addEventListener('input', () => {
            saveToInputs();
            saveToStorage();
            updateCounter();
        });
    });
    
    // Load existing data if available
    const eventData = wizardState.data[listId][index];
    if (eventData) {
        brokerFieldsContainer.querySelectorAll('input').forEach(input => {
            const path = input.dataset.path;
            const field = path.split('.')[1].replace(/\[.*?\]/g, '');
            if (eventData[field]) {
                input.value = eventData[field];
            }
        });
    }
    
    saveToInputs();
    saveToStorage();
    updateCounter();
}

function renderExistingEvents(type) {
    const listId = type === 'published' ? 'publishedEvents' : 'consumedEvents';
    const listContainer = document.getElementById(listId);
    const events = wizardState.data[listId] || [];
    
    // Clear existing content
    listContainer.innerHTML = '';
    
    // Re-render all events
    events.forEach((eventData, index) => {
        const item = document.createElement('div');
        item.className = 'list-item event-item';
        item.dataset.index = index;
        
        const defaultData = { broker: eventData.broker || '', name: eventData.name || '', description: '' };
        
        item.innerHTML = `
            <select class="form-control broker-select" data-path="${listId}[${index}].broker" required>
                <option value="">Select Broker</option>
                <option value="RabbitMQ" ${eventData.broker === 'RabbitMQ' ? 'selected' : ''}>RabbitMQ</option>
                <option value="Kafka" ${eventData.broker === 'Kafka' ? 'selected' : ''}>Kafka</option>
            </select>
            <input type="text" placeholder="Event Name *" data-path="${listId}[${index}].name" class="form-control" required value="${eventData.name || ''}">
            <div class="broker-specific-fields"></div>
            <button class="btn btn-remove" onclick="removeEventItem(this, '${listId}')">Remove</button>
        `;
        
        listContainer.appendChild(item);
        
        // Add event listener for broker selection
        const brokerSelect = item.querySelector('.broker-select');
        brokerSelect.addEventListener('change', (e) => handleBrokerChange(e, listId, index, type));
        
        // Trigger broker change to populate fields
        if (eventData.broker) {
            brokerSelect.dispatchEvent(new Event('change'));
        }
        
        // Add event listeners for all inputs
        item.querySelectorAll('input').forEach(element => {
            element.addEventListener('input', () => {
                saveToInputs();
                saveToStorage();
                updateCounter();
            });
        });
    });
}

function removeEventItem(button, type) {
    const item = button.closest('.list-item');
    const listContainer = item.parentNode;
    const index = Array.from(listContainer.children).indexOf(item);
    
    const listId = type === 'published' ? 'publishedEvents' : 'consumedEvents';
    if (wizardState.data[listId]) {
        wizardState.data[listId].splice(index, 1);
    }
    
    item.remove();
    saveToStorage();
    updateCounter();
}

function setupDatabaseTechListener() {
    const dbTechSelect = document.getElementById('databaseTechnologySelect');
    if (dbTechSelect) {
        dbTechSelect.addEventListener('change', (e) => {
            const selectedDb = e.target.value;
            updateSchemaInputsBasedOnDbType(selectedDb);
        });
    }
}

function updateSchemaInputsBasedOnDbType(dbType) {
    const schemaContainer = document.getElementById('schemaDesignContainer');
    const addSchemaBtn = document.getElementById('addSchemaBtn');
    const schemaHelpText = schemaContainer.querySelector('p.form-help');
    
    if (!dbType) {
        schemaHelpText.textContent = 'Please select a database technology above to define schema details.';
        addSchemaBtn.style.display = 'none';
        schemaContainer.querySelector('#databaseSchemas').innerHTML = '';
        return;
    }
    
    // Categorize database types
    const sqlDatabases = ['PostgreSQL', 'MySQL', 'MariaDB', 'SQL Server', 'Oracle'];
    const documentDatabases = ['MongoDB', 'CouchDB', 'DynamoDB'];
    const graphDatabases = ['Neo4j'];
    const keyValueDatabases = ['Redis', 'Cassandra'];
    const searchDatabases = ['Elasticsearch'];
    
    let helpText = '';
    let fileAccept = '';
    
    if (sqlDatabases.includes(dbType)) {
        helpText = 'Upload SQL schema files (.sql or .ddl) for your database tables.';
        fileAccept = '.sql,.ddl';
    } else if (documentDatabases.includes(dbType)) {
        helpText = 'Upload JSON schema files for your document collections.';
        fileAccept = '.json';
    } else if (graphDatabases.includes(dbType)) {
        helpText = 'Upload Cypher schema files or text descriptions for your graph model.';
        fileAccept = '.cypher,.txt';
    } else if (keyValueDatabases.includes(dbType)) {
        helpText = 'Upload JSON or text files describing your data model structure.';
        fileAccept = '.json,.txt';
    } else if (searchDatabases.includes(dbType)) {
        helpText = 'Upload JSON files describing your index mappings and structure.';
        fileAccept = '.json';
    } else {
        helpText = 'Upload schema files appropriate for your database type.';
        fileAccept = '.txt,.json,.sql';
    }
    
    schemaHelpText.textContent = helpText;
    addSchemaBtn.setAttribute('data-file-accept', fileAccept);
    addSchemaBtn.style.display = 'inline-block';
    
    // Re-render existing schemas to update placeholders
    renderExistingSchemas();
}

function addSchemaUpload() {
    const listContainer = document.getElementById('databaseSchemas');
    const addSchemaBtn = document.getElementById('addSchemaBtn');
    const fileAccept = addSchemaBtn.getAttribute('data-file-accept') || '.sql,.ddl,.json,.txt';
    
    if (!wizardState.data.databaseSchemas) {
        wizardState.data.databaseSchemas = [];
    }
    const index = wizardState.data.databaseSchemas.length;
    
    // Determine placeholder and help text based on accepted file types
    let fileNamePlaceholder = 'e.g., table.sql';
    let fileHelpText = 'Upload schema file';
    let descriptionPlaceholder = 'Brief description of this table';
    let descriptionHelpText = 'What this table is used for (e.g., "Stores user profile data")';
    
    if (fileAccept === '.json') {
        fileNamePlaceholder = 'e.g., collection.json';
        fileHelpText = 'Upload JSON schema file';
        descriptionPlaceholder = 'Brief description of this collection';
        descriptionHelpText = 'What this collection is used for (e.g., "Stores user profile data")';
    } else if (fileAccept.includes('.sql') || fileAccept.includes('.ddl')) {
        fileNamePlaceholder = 'e.g., table.sql';
        fileHelpText = 'Upload SQL schema file';
        descriptionPlaceholder = 'Brief description of this table';
        descriptionHelpText = 'What this table is used for (e.g., "Stores user profile data")';
    } else if (fileAccept.includes('.cypher')) {
        fileNamePlaceholder = 'e.g., schema.cypher';
        fileHelpText = 'Upload Cypher schema file';
        descriptionPlaceholder = 'Brief description of this graph model';
        descriptionHelpText = 'What this graph model represents (e.g., "User relationships and interactions")';
    } else if (fileAccept.includes('.json') && fileAccept.includes('.txt')) {
        fileNamePlaceholder = 'e.g., schema.json';
        fileHelpText = 'Upload JSON or text schema file';
        descriptionPlaceholder = 'Brief description of this data model';
        descriptionHelpText = 'What this data model represents';
    }
    
    const item = document.createElement('div');
    item.className = 'list-item';
    
    item.innerHTML = `
        <div class="form-group" style="margin-bottom: 15px;">
            <label>Schema File Name</label>
            <input type="text" placeholder="${fileNamePlaceholder}" data-path="databaseSchemas[${index}].fileName" class="form-control">
            <p class="form-help" style="margin-top: 5px;">Descriptive name for this schema file</p>
        </div>
        <div class="form-group" style="margin-bottom: 15px;">
            <label>Upload Schema File *</label>
            <input type="file" class="form-control schema-file-input" accept="${fileAccept}">
            <p class="form-help" style="margin-top: 5px;">${fileHelpText}</p>
        </div>
        <div class="form-group" style="margin-bottom: 15px;">
            <label>Schema Description (Optional)</label>
            <textarea class="form-control" rows="2" placeholder="${descriptionPlaceholder}" data-path="databaseSchemas[${index}].description"></textarea>
            <p class="form-help" style="margin-top: 5px;">${descriptionHelpText}</p>
        </div>
        <button class="btn btn-remove" onclick="removeSchemaItem(this, ${index})">Remove</button>
    `;
    
    wizardState.data.databaseSchemas.push({ fileName: '', content: '', description: '' });
    listContainer.appendChild(item);
    
    // Add file upload listener
    const fileInput = item.querySelector('.schema-file-input');
    fileInput.addEventListener('change', (e) => handleSchemaFileUpload(e, index));
    
    // Add event listeners for text inputs
    item.querySelectorAll('input:not([type="file"]), textarea').forEach(element => {
        element.addEventListener('input', () => {
            saveToInputs();
            saveToStorage();
            updateCounter();
        });
    });
    
    saveToStorage();
    updateCounter();
}

function handleSchemaFileUpload(event, index) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        wizardState.data.databaseSchemas[index].content = content;
        wizardState.data.databaseSchemas[index].fileName = file.name;
        
        // Update the file name input if it's empty
        const fileNameInput = event.target.closest('.list-item').querySelector('[data-path="databaseSchemas[' + index + '].fileName"]');
        if (fileNameInput && !fileNameInput.value) {
            fileNameInput.value = file.name;
        }
        
        saveToStorage();
        updateCounter();
    };
    reader.readAsText(file);
}

function removeSchemaItem(button, index) {
    const item = button.closest('.list-item');
    const listContainer = item.parentNode;
    const actualIndex = Array.from(listContainer.children).indexOf(item);
    
    if (wizardState.data.databaseSchemas) {
        wizardState.data.databaseSchemas.splice(actualIndex, 1);
    }
    
    item.remove();
    saveToStorage();
    updateCounter();
}

function renderExistingSchemas() {
    const listContainer = document.getElementById('databaseSchemas');
    const schemas = wizardState.data.databaseSchemas || [];
    const addSchemaBtn = document.getElementById('addSchemaBtn');
    const fileAccept = addSchemaBtn ? addSchemaBtn.getAttribute('data-file-accept') || '.sql,.ddl,.json,.txt' : '.sql,.ddl,.json,.txt';
    
    // Clear existing content
    listContainer.innerHTML = '';
    
    // Determine placeholder and help text based on accepted file types
    let fileNamePlaceholder = 'e.g., table.sql';
    let fileHelpText = 'Upload schema file';
    let descriptionPlaceholder = 'Brief description of this table';
    let descriptionHelpText = 'What this table is used for (e.g., "Stores user profile data")';
    
    if (fileAccept === '.json') {
        fileNamePlaceholder = 'e.g., collection.json';
        fileHelpText = 'Upload JSON schema file';
        descriptionPlaceholder = 'Brief description of this collection';
        descriptionHelpText = 'What this collection is used for (e.g., "Stores user profile data")';
    } else if (fileAccept.includes('.sql') || fileAccept.includes('.ddl')) {
        fileNamePlaceholder = 'e.g., table.sql';
        fileHelpText = 'Upload SQL schema file';
        descriptionPlaceholder = 'Brief description of this table';
        descriptionHelpText = 'What this table is used for (e.g., "Stores user profile data")';
    } else if (fileAccept.includes('.cypher')) {
        fileNamePlaceholder = 'e.g., schema.cypher';
        fileHelpText = 'Upload Cypher schema file';
        descriptionPlaceholder = 'Brief description of this graph model';
        descriptionHelpText = 'What this graph model represents (e.g., "User relationships and interactions")';
    } else if (fileAccept.includes('.json') && fileAccept.includes('.txt')) {
        fileNamePlaceholder = 'e.g., schema.json';
        fileHelpText = 'Upload JSON or text schema file';
        descriptionPlaceholder = 'Brief description of this data model';
        descriptionHelpText = 'What this data model represents';
    }
    
    // Re-render all schemas
    schemas.forEach((schemaData, index) => {
        const item = document.createElement('div');
        item.className = 'list-item';
        
        item.innerHTML = `
            <div class="form-group" style="margin-bottom: 15px;">
                <label>Schema File Name</label>
                <input type="text" placeholder="${fileNamePlaceholder}" data-path="databaseSchemas[${index}].fileName" class="form-control" value="${schemaData.fileName || ''}">
                <p class="form-help" style="margin-top: 5px;">Descriptive name for this schema file</p>
            </div>
            <div class="form-group" style="margin-bottom: 15px;">
                <label>Upload Schema File *</label>
                <input type="file" class="form-control schema-file-input" accept="${fileAccept}">
                <p class="form-help" style="margin-top: 5px;">${fileHelpText}</p>
            </div>
            <div class="form-group" style="margin-bottom: 15px;">
                <label>Schema Description (Optional)</label>
                <textarea class="form-control" rows="2" placeholder="${descriptionPlaceholder}" data-path="databaseSchemas[${index}].description">${schemaData.description || ''}</textarea>
                <p class="form-help" style="margin-top: 5px;">${descriptionHelpText}</p>
            </div>
            <button class="btn btn-remove" onclick="removeSchemaItem(this, ${index})">Remove</button>
        `;
        
        listContainer.appendChild(item);
        
        // Add file upload listener
        const fileInput = item.querySelector('.schema-file-input');
        fileInput.addEventListener('change', (e) => handleSchemaFileUpload(e, index));
        
        // Add event listeners for text inputs
        item.querySelectorAll('input:not([type="file"]), textarea').forEach(element => {
            element.addEventListener('input', () => {
                saveToInputs();
                saveToStorage();
                updateCounter();
            });
        });
    });
}

function addDecision() {
    const listContainer = document.getElementById('decisionsMade');
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
        <div class="form-group" style="margin-bottom: 15px;">
            <input type="text" placeholder="Decision" data-path="decisions[${decisionIndex}].decision" class="form-control">
            <p class="form-help" style="margin-top: 5px;">What architectural or technical decision was made?</p>
        </div>
        <div class="form-group" style="margin-bottom: 15px;">
            <input type="text" placeholder="Rationale" data-path="decisions[${decisionIndex}].rationale" class="form-control">
            <p class="form-help" style="margin-top: 5px;">Why was this decision made?</p>
        </div>
        <div class="form-group" style="margin-bottom: 15px;">
            <input type="text" placeholder="Decided By" data-path="decisions[${decisionIndex}].decidedBy" class="form-control">
            <p class="form-help" style="margin-top: 5px;">Who made this decision (e.g., team name, architect name)</p>
        </div>
        <div class="form-group" style="margin-bottom: 15px;">
            <input type="date" data-path="decisions[${decisionIndex}].date" class="form-control">
            <p class="form-help" style="margin-top: 5px;">When was this decision made?</p>
        </div>
        <button class="btn btn-remove" onclick="removeDecisionItem(this)">Remove</button>
    `;
    
    if (!wizardState.data.decisions) wizardState.data.decisions = [];
    wizardState.data.decisions.push({ decision: '', rationale: '', decidedBy: '', date: '' });
    
    listContainer.appendChild(item);
    decisionIndex++;
    
    item.querySelectorAll('input').forEach(element => {
        element.addEventListener('input', () => {
            saveToInputs();
            saveToStorage();
            updateCounter();
        });
    });
    
    saveToStorage();
    updateCounter();
}

function removeDecisionItem(button) {
    const item = button.closest('.list-item');
    const listContainer = item.parentNode;
    const index = Array.from(listContainer.children).indexOf(item);
    
    if (wizardState.data.decisions) {
        wizardState.data.decisions.splice(index, 1);
    }
    
    item.remove();
    saveToStorage();
    updateCounter();
}

function addOpenQuestion() {
    const listContainer = document.getElementById('openQuestions');
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
        <div class="form-group" style="margin-bottom: 15px;">
            <input type="text" placeholder="e.g., Should we implement cache warming strategy?" data-path="openQuestions[${questionIndex}].question" class="form-control">
            <p class="form-help" style="margin-top: 5px;">What unresolved question or concern needs to be addressed?</p>
        </div>
        <button class="btn btn-remove" onclick="removeQuestionItem(this)">Remove</button>
    `;
    
    if (!wizardState.data.openQuestions) wizardState.data.openQuestions = [];
    wizardState.data.openQuestions.push({ question: '' });
    
    listContainer.appendChild(item);
    questionIndex++;
    
    item.querySelector('input').addEventListener('input', () => {
        saveToInputs();
        saveToStorage();
        updateCounter();
    });
    
    saveToStorage();
    updateCounter();
}

function removeQuestionItem(button) {
    const item = button.closest('.list-item');
    const listContainer = item.parentNode;
    const index = Array.from(listContainer.children).indexOf(item);
    
    if (wizardState.data.openQuestions) {
        wizardState.data.openQuestions.splice(index, 1);
    }
    
    item.remove();
    saveToStorage();
    updateCounter();
}

// Export/Import functions
function exportToJSON() {
    saveToInputs();
    
    // Validate that service name is provided
    if (!wizardState.data.serviceName || wizardState.data.serviceName.trim() === '') {
        alert('Please provide a Service Name before exporting. This field is required.');
        // Navigate to step 1 where service name is located
        showStep(1);
        return;
    }
    
    const dataStr = JSON.stringify(wizardState, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${wizardState.data.serviceName}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

function exportToMarkdown() {
    saveToInputs();
    
    // Validate that service name is provided
    if (!wizardState.data.serviceName || wizardState.data.serviceName.trim() === '') {
        alert('Please provide a Service Name before exporting. This field is required.');
        // Navigate to step 1 where service name is located
        showStep(1);
        return;
    }
    
    const markdown = renderMarkdown(wizardState.data);
    const dataBlob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${wizardState.data.serviceName}-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
}

function exportToWord() {
    saveToInputs();
    
    // Validate that service name is provided
    if (!wizardState.data.serviceName || wizardState.data.serviceName.trim() === '') {
        alert('Please provide a Service Name before exporting. This field is required.');
        // Navigate to step 1 where service name is located
        showStep(1);
        return;
    }
    
    const markdown = renderMarkdown(wizardState.data);
    
    // Convert markdown to HTML for better Word compatibility
    const html = markdownToHtml(markdown);
    
    // Create Word-compatible HTML structure
    const wordHtml = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' 
      xmlns:w='urn:schemas-microsoft-com:office:word' 
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
    <meta charset='utf-8'>
    <title>Microservice Design Document</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
            line-height: 1.6;
        }
        h1 {
            color: #c00;
            border-bottom: 3px solid #c00;
            padding-bottom: 10px;
        }
        h2 {
            color: #c00;
            margin-top: 30px;
            border-bottom: 2px solid #ccc;
            padding-bottom: 5px;
        }
        h3 {
            color: #666;
            margin-top: 20px;
        }
        h4 {
            color: #888;
            margin-top: 15px;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 15px 0;
        }
        table th {
            background-color: #c00;
            color: white;
            padding: 10px;
            text-align: left;
            border: 1px solid #ddd;
        }
        table td {
            border: 1px solid #ddd;
            padding: 8px;
        }
        table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        code {
            background-color: #f4f4f4;
            padding: 2px 5px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        pre {
            background-color: #f4f4f4;
            padding: 10px;
            border-left: 4px solid #c00;
            overflow-x: auto;
        }
        pre code {
            background-color: transparent;
            padding: 0;
        }
        ul, ol {
            margin: 10px 0;
            padding-left: 30px;
        }
        li {
            margin: 5px 0;
        }
        p {
            margin: 10px 0;
        }
        blockquote {
            border-left: 4px solid #ccc;
            margin: 15px 0;
            padding-left: 15px;
            color: #666;
        }
        hr {
            border: none;
            border-top: 2px solid #ccc;
            margin: 30px 0;
        }
        .page-break {
            page-break-before: always;
        }
        a {
            color: #0066cc;
            text-decoration: underline;
        }
        a:visited {
            color: #0066cc;
        }
    </style>
</head>
<body>
    ${html}
</body>
</html>`;
    
    // Create blob with BOM for UTF-8 encoding
    const blob = new Blob(['\ufeff', wordHtml], {
        type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${wizardState.data.serviceName}-${Date.now()}.doc`;
    link.click();
    URL.revokeObjectURL(url);
}

function markdownToHtml(markdown) {
    // Convert markdown to HTML for Word document
    const lines = markdown.split('\n');
    let html = '';
    let inCodeBlock = false;
    let codeBlockLanguage = '';
    let tableRows = [];
    let inTable = false;
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Handle code blocks
        if (line.startsWith('```')) {
            if (!inCodeBlock) {
                codeBlockLanguage = line.substring(3).trim();
                html += '<pre><code>';
                inCodeBlock = true;
            } else {
                html += '</code></pre>';
                inCodeBlock = false;
            }
            continue;
        }
        
        if (inCodeBlock) {
            // Escape HTML in code blocks
            html += line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '\n';
            continue;
        }
        
        // Handle tables
        if (line.includes('|') && !line.startsWith('|---')) {
            if (!inTable) {
                // Start new table
                tableRows = [];
                inTable = true;
                
                // Parse header row
                const cells = line.split('|').filter(c => c.trim() !== '');
                const headerRow = '<tr>' + cells.map(c => `<th>${c.trim()}</th>`).join('') + '</tr>';
                tableRows.push(headerRow);
            } else {
                // Parse data row
                const cells = line.split('|').filter(c => c.trim() !== '');
                if (cells.length > 0) {
                    const dataRow = '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
                    tableRows.push(dataRow);
                }
            }
            continue;
        } else if (inTable) {
            // End of table
            html += '<table>' + tableRows.join('') + '</table>';
            inTable = false;
            tableRows = [];
        }
        
        // Handle headers with anchor support
        if (line.startsWith('# ')) {
            let headerText = line.substring(2);
            const anchorMatch = headerText.match(/^(.+)\s\{#(.+)\}$/);
            if (anchorMatch) {
                html += `<a name="${anchorMatch[2]}"></a><h1>${anchorMatch[1]}</h1>`;
            } else {
                html += '<h1>' + headerText + '</h1>';
            }
            continue;
        } else if (line.startsWith('## ')) {
            let headerText = line.substring(3);
            const anchorMatch = headerText.match(/^(.+)\s \{#(.+)\}$/);
            if (anchorMatch) {
                html += `<a name="${anchorMatch[2]}"></a><h2>${anchorMatch[1]}</h2>`;
            } else {
                html += '<h2>' + headerText + '</h2>';
            }
            continue;
        } else if (line.startsWith('### ')) {
            let headerText = line.substring(4);
            const anchorMatch = headerText.match(/^(.+)\s \{#(.+)\}$/);
            if (anchorMatch) {
                html += `<a name="${anchorMatch[2]}"></a><h3>${anchorMatch[1]}</h3>`;
            } else {
                html += '<h3>' + headerText + '</h3>';
            }
            continue;
        } else if (line.startsWith('#### ')) {
            let headerText = line.substring(5);
            const anchorMatch = headerText.match(/^(.+)\s \{#(.+)\}$/);
            if (anchorMatch) {
                html += `<a name="${anchorMatch[2]}"></a><h4>${anchorMatch[1]}</h4>`;
            } else {
                html += '<h4>' + headerText + '</h4>';
            }
            continue;
        }
        
        // Handle horizontal rules
        if (line.trim() === '---') {
            html += '<hr>';
            continue;
        }
        
        // Handle checkboxes
        line = line.replace(/☐ /g, '☐&nbsp;');
        line = line.replace(/☑ /g, '☑&nbsp;');
        
        // Handle bullet lists
        if (/^[\*\+\-] /.test(line)) {
            // Handle nested lists (simple approach)
            const indent = line.match(/^[\s]*/)[0].length;
            line = line.trim();
            const content = line.substring(2);
            
            // Apply inline formatting
            let formattedContent = content
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>')
                .replace(/`(.+?)`/g, '<code>$1</code>');
            
            html += `<ul>${'<ul>'.repeat(Math.floor(indent / 2))}<li>${formattedContent}</li></ul>`;
            if (i === lines.length - 1 || !/^[\*\+\-] /.test(lines[i + 1])) {
                html += '</ul>'.repeat(Math.floor(indent / 2) + 1);
            }
            continue;
        }
        
        // Handle regular paragraph text
        if (line.trim() !== '') {
            // Apply inline formatting
            let formattedLine = line
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>')
                .replace(/`(.+?)`/g, '<code>$1</code>')
                .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
            
            // Check if next line is also text (keep in same paragraph)
            if (i < lines.length - 1 && lines[i + 1].trim() !== '' && 
                !lines[i + 1].startsWith('#') && !lines[i + 1].includes('|') && 
                !/^[\*\+\-] /.test(lines[i + 1]) && !lines[i + 1].startsWith('```')) {
                html += formattedLine + '<br>';
            } else {
                html += '<p>' + formattedLine + '</p>';
            }
        }
    }
    
    // Close any open table
    if (inTable) {
        html += '<table>' + tableRows.join('') + '</table>';
    }
    
    return html;
}

function importFromJSON() {
    document.getElementById('jsonFileInput').click();
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (imported.data) {
                Object.assign(wizardState.data, imported.data);
                if (imported.currentStep) wizardState.currentStep = imported.currentStep;
                // Load inputs and update UI
                showStep(wizardState.currentStep);
                updateCounter();
                saveToStorage();
                alert('Data imported successfully!');
            } else {
                throw new Error('Invalid file format');
            }
        } catch (error) {
            alert('Failed to import file. Please ensure it\'s a valid JSON file.');
            console.error('Import error:', error);
        }
    };
    reader.readAsText(file);
}

function handleAPISpecUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            let spec;
            const content = e.target.result;
            
            // Parse JSON
            spec = JSON.parse(content);
            
            if (spec && spec.paths) {
                const endpoints = parseOpenAPISpec(spec);
                displayAPIEndpoints(endpoints);
                // Preserve existing documentationLink if present
                const existingLink = wizardState.data.apiSpec?.documentationLink || '';
                wizardState.data.apiSpec = { 
                    file: file.name, 
                    endpoints: endpoints,
                    documentationLink: existingLink
                };
                saveToStorage();
                alert(`Successfully parsed ${endpoints.length} API endpoints!`);
            } else {
                throw new Error('Invalid OpenAPI/Swagger spec');
            }
        } catch (error) {
            alert('Failed to parse OpenAPI/Swagger file. Please check the file format.');
            console.error('API Spec parse error:', error);
        }
    };
    reader.readAsText(file);
}

function parseOpenAPISpec(spec) {
    const endpoints = [];
    
    if (!spec.paths) return endpoints;
    
    for (const [path, methods] of Object.entries(spec.paths)) {
        for (const [method, details] of Object.entries(methods)) {
            if (['get', 'post', 'put', 'patch', 'delete'].includes(method.toLowerCase())) {
                endpoints.push({
                    method: method.toUpperCase(),
                    path: path,
                    summary: details.summary || '',
                    description: details.description || '',
                    operationId: details.operationId || `${method}-${path.replace(/[^a-zA-Z0-9]/g, '-')}`,
                    parameters: details.parameters || [],
                    requestBody: details.requestBody || null,
                    responses: details.responses || {}
                });
            }
        }
    }
    
    return endpoints;
}

function displayAPIEndpoints(endpoints) {
    const preview = document.getElementById('apiSpecPreview');
    const list = document.getElementById('apiEndpointsList');
    
    if (!preview || !list || endpoints.length === 0) return;
    
    preview.style.display = 'block';
    list.innerHTML = '<ul>';
    
    endpoints.forEach((endpoint, idx) => {
        const badges = `<span style="background-color: #dc2626; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; margin-right: 5px;">${endpoint.method}</span>`;
        list.innerHTML += `<li style="margin-bottom: 15px; padding: 10px; background: #fef2f2; border-radius: 5px;">
            ${badges}<strong>${endpoint.path}</strong><br>
            <span style="color: #6b7280; font-size: 13px;">${endpoint.summary || 'No summary'}</span>
        </li>`;
    });
    
    list.innerHTML += '</ul>';
}

