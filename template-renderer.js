// Markdown template renderer
function renderMarkdown(data) {
    const lines = [
        '---',
        `abstract: "${escapeYaml(data.serviceName || '[Service Name]')} Design Document"`,
        '---',
        '',
        '# Table of Contents {#table-of-contents .TOC-Heading}',
        '',
        '[Service Overview](#service-overview)',
        '[Purpose & Business Context](#purpose-business-context)',
        '[1. Service Boundaries & Responsibilities](#service-boundaries-responsibilities)',
        '[2. API Specifications](#api-specifications)',
        '[3. Message Broker Integration](#message-broker-integration)',
        '[4. Data Storage](#data-storage)',
        '[5. Security](#security)',
        '[6. Observability](#observability)',
        '[7. Performance & Scalability](#performance-scalability)',
        '[8. Disaster Recovery & Resilience](#disaster-recovery-resilience)',
        '[9. Testing Strategy](#testing-strategy)',
        '[10. Deployment](#deployment)',
        '[11. Compliance & Governance](#compliance-governance)',
        '[12. Open Questions & Decisions](#open-questions-decisions)',
        '[13. Review & Approval](#review-approval)',
        '[14. Appendix](#appendix)',
        '',
        '## Service Overview {#service-overview}',
        '',
        `**Service Name:** ${data.serviceName || '[Service Name]'}`,
        `**Team/Owner:** ${data.teamOwner || '[Team Name]'}`,
        `**Date:** ${data.date || '[YYYY-MM-DD]'}`,
        `**Version:** ${data.version || '[X.X]'}`,
        `**Status:** ${data.status || 'Draft'}`,
        '',
        '### Purpose & Business Context {#purpose-business-context}',
        '',
        `**Business Problem:** ${data.businessProblem || '[Describe the business problem]'}`,
        '',
        `**Key Business Objectives:** ${formatList(data.businessObjectives)}`,
        '',
        `**Service Purpose:** ${data.servicePurpose || '[Describe service purpose]'}`,
        '',
        '# 1. Service Boundaries & Responsibilities {#service-boundaries-responsibilities}',
        '',
        '## 1.1 Service Core Functionality',
        '',
        formatList(data.coreFunctionalities),
        '',
        '## 1.2 Dependencies (Downstream Services)',
        '',
        renderTable(['Service Name', 'Context', 'Protocol'], (data.downstream || []).map(s => [s.name || 'TBD', s.context || 'TBD', s.protocol || 'TBD'])),
        '',
        '## 1.3 Consumers (Upstream Services)',
        '',
        renderTable(['Service Name', 'Use Case', 'Protocol'], (data.upstream || []).map(s => [s.name || 'TBD', s.useCase || 'TBD', s.protocol || 'TBD'])),
        '',
        '# 2. API Specifications {#api-specifications}',
        '',
        '### REST APIs',
        '',
        ...renderAPISpec(data.apiSpec || {}),
        '',
        '# 3. Message Broker Integration {#message-broker-integration}',
        '',
        '### 3.1 Rationale for Using Messaging',
        '',
        `**Why messaging is used instead of REST for this service:**`,
        '',
        ...formatMessagingRationale(data.messagingRationale),
        '',
        '### 3.2 Technology Choice',
        '',
        `**Internal Communication (within Kubernetes):** ${data.messagingTech?.internal || 'RabbitMQ'}`,
        `**External Communication (outside Kubernetes):** ${data.messagingTech?.external || 'Kafka'}`,
        '',
        '### 3.3 Events Published',
        '',
        ...renderEventsByBroker(data.publishedEvents || [], 'Published'),
        '',
        '### 3.4 Events Consumed',
        '',
        ...renderEventsByBroker(data.consumedEvents || [], 'Consumed'),
        '',
        '# 4. Data Storage {#data-storage}',
        '',
        '### 4.1 Primary Database',
        '',
        `**Technology:** ${data.database?.technology || '[Database Type]'}`,
        `**Rationale:** ${data.database?.rationale || '[Rationale]'}`,
        '',
        ...renderDatabaseSchemas(data.databaseSchemas || []),
        '',
        '### 4.2 Caching Layer',
        '',
        `**Technology:** ${data.cache?.technology || '[Cache Type]'}`,
        `**Rationale:** ${data.cache?.rationale || '[Rationale]'}`,
        '',
        '# 5. Security {#security}',
        '',
        '### 5.1 Authentication',
        '',
        `- **Method:** ${data.security?.authMethod || '[Method]'}`,
        '',
        '### 5.2 Authorization',
        '',
        `- **Model:** ${data.security?.authzModel || '[Model]'}`,
        '',
        '### 5.3 Data Protection',
        '',
        `- **PII Fields:** ${formatPIIFields(data.security?.piiFields) || '[List PII fields]'}`,
        `- **Encryption at Rest:** ${data.security?.encryptionAtRest || 'Yes'}`,
        `- **Encryption in Transit:** ${data.security?.encryptionInTransit || 'Yes'}`,
        '',
        '# 6. Observability {#observability}',
        '',
        '### 6.1 Logging',
        '',
        `**Log Level:**`,
        `- Production: ${data.observability?.prodLogLevel || 'INFO'}`,
        `- Staging: ${data.observability?.stageLogLevel || 'INFO'}`,
        `- Development: ${data.observability?.devLogLevel || 'DEBUG'}`,
        '',
        `**Log Aggregation Stack:** ${data.observability?.loggingSystem || '[Stack]'}`,
        '',
        '### 6.2 Metrics',
        '',
        `**Metrics System:** ${data.observability?.metricsSystem || '[System]'}`,
        '',
        '### 6.3 Tracing',
        '',
        `**Tracing System:** ${data.observability?.tracingSystem || '[System]'}`,
        '',
        '# 7. Performance & Scalability {#performance-scalability}',
        '',
        '### 7.1 Performance Requirements',
        '',
        `- **Target Latency:** ${data.performance?.targetLatency || '[X]'}ms`,
        `- **Peak Throughput:** ${data.performance?.peakThroughput || '[X]'} req/sec`,
        `- **Average Throughput:** ${data.performance?.avgThroughput || '[Y]'} req/sec`,
        '',
        '### 7.2 Scalability Strategy',
        '',
        `- **Horizontal Scaling:** ${data.performance?.horizontalScaling || 'Yes'}`,
        `- **Auto-scaling:** ${data.performance?.autoScaling || 'Yes'}`,
        '',
        '# 8. Disaster Recovery & Resilience {#disaster-recovery-resilience}',
        '',
        '### 8.1 Circuit Breaker',
        '',
        `- **Failure Threshold:** ${data.dr?.circuitBreakerFailure || '50'}%`,
        `- **Timeout:** ${data.dr?.circuitBreakerTimeout || '[X]'} seconds`,
        '',
        '### 8.2 Multi-AZ Deployment',
        '',
        `- **Multi-AZ:** ${data.dr?.multiAZ || 'Yes'}`,
        `- **RTO:** ${data.dr?.rto || '[X]'} hours`,
        `- **RPO:** ${data.dr?.rpo || '[Y]'} hours`,
        `- **Backup Frequency:** ${data.dr?.backupFrequency || '[Frequency]'}`,
        '',
        '# 9. Testing Strategy {#testing-strategy}',
        '',
        '### 9.1 Unit Tests',
        '',
        `- **Coverage Target:** >${data.testing?.unitTestCoverage || '85'}%`,
        `- **Framework:** ${data.testing?.unitTestFramework || '[Framework]'}`,
        '',
        '### 9.2 Integration Tests',
        '',
        `- **Environment:** ${data.testing?.integrationEnv || '[Environment]'}`,
        '',
        '### 9.3 Performance Tests',
        '',
        `- **Tool:** ${data.testing?.performanceTool || '[Tool]'}`,
        '',
        '### 9.4 Chaos Testing',
        '',
        `☐ ${data.testing?.chaosTesting || 'Not Implemented'}`,
        '',
        '# 10. Deployment {#deployment}',
        '',
        '### 10.1 Containerization',
        '',
        `- **Base Image:** ${data.deployment?.baseImage || '[Image]'}`,
        `- **Image Size:** <${data.deployment?.imageSize || '[X]'}MB`,
        '',
        '### 10.2 Orchestration',
        '',
        `- **Platform:** ${data.deployment?.orchestration || 'Kubernetes'}`,
        `- **Service Mesh:** ${data.deployment?.serviceMesh || '[Mesh]'}`,
        `- **Strategy:** ${data.deployment?.strategy || '[Strategy]'}`,
        '',
        '### 10.3 CI/CD Pipeline',
        '',
        `- **Tool:** ${data.deployment?.cicdTool || '[Tool]'}`,
        '',
        '# 11. Compliance & Governance {#compliance-governance}',
        '',
        '### 11.1 Regulatory Requirements',
        '',
        ...renderCompliance(data.compliance || {}),
        '',
        '### 11.2 Data Retention Policy',
        '',
        data.compliance?.dataRetention || '[Retention policy]',
        '',
        '### 11.3 Audit Trail',
        '',
        `☐ ${data.compliance?.auditTrail === 'Yes' ? 'Enabled' : 'Disabled'}`,
        '',
        '# 12. Open Questions & Decisions {#open-questions-decisions}',
        '',
        '## 12.1 Decisions Made',
        '',
        renderDecisions(data.decisions || []),
        '',
        '## 12.2 Open Questions',
        '',
        renderOpenQuestions(data.openQuestions || []),
        '',
        '# 13. Review & Approval {#review-approval}',
        '',
        '## 13.4 Reviewers',
        '',
        `- Tech Lead: ${data.review?.techLead || '___________________'} Date: ______`,
        `- Solutions Architect: ${data.review?.solutionsArchitect || '___________________'} Date: ______`,
        `- Security Architect: ${data.review?.securityArchitect || '___________________'} Date: ______`,
        `- DevOps Lead: ${data.review?.devOpsLead || '___________________'} Date: ______`,
        `- Product Owner: ${data.review?.productOwner || '___________________'} Date: ______`,
        '',
        '## 13.5 Approval Status',
        '',
        `☐ ${data.review?.approvalStatus || 'Pending'}`,
        '',
        '# 14. Appendix {#appendix}',
        '',
        '### A. API Documentation',
        '',
        data.appendix?.apiDocsLink || '[Link to API docs]',
        '',
        '### D. Architecture Diagrams',
        '',
        data.appendix?.architectureDiagramsLink || '[Link to diagrams]',
        '',
        '',
        `**Document Version:** ${data.appendix?.docVersion || '1.0'}`,
        `**Date:** ${data.date || '[YYYY-MM-DD]'}`,
        `**Document Owner:** ${data.appendix?.docOwner || '[Owner]'}`,
        `**Distribution:** ${data.appendix?.distribution || '[Level]'}`,
    ];
    
    return lines.join('\n');
}

function formatList(text) {
    if (!text) return 'TBD';
    const items = text.split('\n').filter(item => item.trim());
    if (items.length === 0) return 'TBD';
    return items.map(item => `- ${item.trim()}`).join('\n');
}

function formatMessagingRationale(rationale) {
    if (!rationale) return ['☐ TBD'];
    
    const options = [];
    if (rationale.async) options.push('☑ Communication can be asynchronous');
    else options.push('☐ Communication can be asynchronous');
    
    if (rationale.decouple) options.push('☑ Need to decouple services');
    else options.push('☐ Need to decouple services');
    
    if (rationale.broadcast) options.push('☑ Broadcasting events to multiple consumers');
    else options.push('☐ Broadcasting events to multiple consumers');
    
    if (rationale.delivery) options.push('☑ Need guaranteed delivery');
    else options.push('☐ Need guaranteed delivery');
    
    if (rationale.volume) options.push('☑ High-volume events');
    else options.push('☐ High-volume events');
    
    if (rationale.replay) options.push('☑ Need event replay capability');
    else options.push('☐ Need event replay capability');
    
    if (rationale.eventDriven) options.push('☑ Event-driven architecture pattern');
    else options.push('☐ Event-driven architecture pattern');
    
    if (rationale.other) {
        options.push(`\n**Other reasons:** ${rationale.other}`);
    }
    
    return options;
}

function renderEvents(events, type) {
    if (!events || events.length === 0) {
        return ['_No events specified._'];
    }
    
    const lines = [];
    events.forEach((event, idx) => {
        lines.push(`**Event ${idx + 1}:** ${event.name || '[Event Name]'}`);
        lines.push(`- **Topic/Exchange:** ${event.topic || '[Topic]'}`);
        if (event.description) {
            lines.push(`- **Description:** ${event.description}`);
        }
        lines.push('');
    });
    
    return lines;
}

function renderTable(headers, rows) {
    const lines = [];
    
    // If no rows, create a single row with TBD
    if (rows.length === 0) {
        rows = [headers.map(() => 'TBD')];
    }
    
    const widths = headers.map((_, i) => Math.max(
        headers[i].length,
        ...rows.map(row => (row[i] || '').toString().length)
    ));
    
    // Header
    lines.push('| ' + headers.map((h, i) => h.padEnd(widths[i])).join(' | ') + ' |');
    lines.push('| ' + headers.map((_, i) => '-'.repeat(widths[i])).join(' | ') + ' |');
    
    // Rows
    rows.forEach(row => {
        lines.push('| ' + row.map((cell, i) => {
            const value = cell ? cell.toString() : '';
            return value.padEnd(widths[i]);
        }).join(' | ') + ' |');
    });
    
    return lines.join('\n');
}

function renderCompliance(compliance) {
    const lines = [];
    
    if (compliance.gdpr) {
        lines.push('**GDPR:** ☐ Applicable');
        lines.push('- Data minimization: ☐ Implemented');
        lines.push('- Consent management: ☐ Tracked and enforced');
        lines.push('');
    }
    
    if (compliance.hipaa) {
        lines.push('**HIPAA:** ☐ Applicable');
        lines.push('- PHI encryption: ☐ At rest and in transit');
        lines.push('- Access logging: ☐ All PHI access logged');
        lines.push('');
    }
    
    if (compliance.pciDss) {
        lines.push('**PCI-DSS:** ☐ Applicable');
        lines.push('- Cardholder data: ☐ Not stored / Tokenized / Encrypted');
        lines.push('- Network security: ☐ Firewalls, encrypted transmission');
        lines.push('');
    }
    
    if (compliance.soc2) {
        lines.push('**SOC 2 Type II:** ☐ Applicable');
        lines.push('- Security controls documented');
        lines.push('- Annual audit compliance');
        lines.push('');
    }
    
    if (lines.length === 0) {
        lines.push('_No specific regulatory requirements specified._');
    }
    
    return lines;
}

function renderDecisions(decisions) {
    if (decisions.length === 0) {
        return '_No decisions documented yet._';
    }
    
    const lines = [
        '| Decision | Rationale | Date | Decided By |',
        '|----------|-----------|------|------------|'
    ];
    
    decisions.forEach(decision => {
        lines.push(`| ${decision.decision || '[Decision]'} | ${decision.rationale || '[Rationale]'} | ${decision.date || '[Date]'} | ${decision.decidedBy || '[Person/Team]'} |`);
    });
    
    return lines.join('\n');
}

function renderOpenQuestions(questions) {
    if (questions.length === 0) {
        return '_No open questions yet._';
    }
    
    const lines = [];
    questions.forEach(question => {
        lines.push(`- [ ] ${question.question || '[Question]'}`);
    });
    
    return lines.join('\n');
}

function formatPIIFields(piiFields) {
    if (!piiFields || typeof piiFields !== 'object') return '';
    
    const selected = [];
    const fieldNames = {
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        address: 'Address',
        ssn: 'SSN',
        dateOfBirth: 'Date of Birth',
        paymentDetails: 'Payment Details',
        ipAddress: 'IP Address',
        location: 'Location',
        medicalInfo: 'Medical Information'
    };
    
    for (const key in piiFields) {
        if (piiFields[key] === true && fieldNames[key]) {
            selected.push(fieldNames[key]);
        }
    }
    
    return selected.length > 0 ? selected.join(', ') : '';
}

function renderAPISpec(apiSpec) {
    const lines = [];
    
    if (apiSpec.documentationLink) {
        lines.push(`**API Documentation:** ${apiSpec.documentationLink}`);
        lines.push('');
    }
    
    if (apiSpec.endpoints && apiSpec.endpoints.length > 0) {
        lines.push(`**Uploaded Spec:** ${apiSpec.file || 'API Specification'}`);
        lines.push('');
        lines.push('**Endpoints:**');
        lines.push('');
        
        apiSpec.endpoints.forEach(endpoint => {
            lines.push(`#### ${endpoint.method} ${endpoint.path}`);
            if (endpoint.summary) {
                lines.push(`- **Summary:** ${endpoint.summary}`);
            }
            if (endpoint.description) {
                lines.push(`- **Description:** ${endpoint.description}`);
            }
            lines.push('');
        });
    } else {
        lines.push('_[API details to be documented based on specific service needs]_');
        lines.push('');
    }
    
    return lines;
}

function renderEventsByBroker(events, type) {
    if (!events || events.length === 0) {
        return ['_No events specified._'];
    }
    
    const rabbitEvents = events.filter(e => e.broker === 'RabbitMQ');
    const kafkaEvents = events.filter(e => e.broker === 'Kafka');
    
    const lines = [];
    
    // Render RabbitMQ events
    if (rabbitEvents.length > 0) {
        if (type === 'Published') {
            lines.push('#### 3.3.1 Via RabbitMQ (Internal)');
        } else {
            lines.push('#### 3.4.1 Events Consumed from RabbitMQ (Internal)');
        }
        lines.push('');
        
        rabbitEvents.forEach((event, idx) => {
            lines.push(`**Event ${idx + 1}:** ${event.name || '[Event Name]'}`);
            if (event.exchange) lines.push(`- **Exchange:** ${event.exchange}`);
            if (type === 'Published' && event.routingKey) lines.push(`- **Routing Key:** ${event.routingKey}`);
            if (type === 'Consumed' && event.queue) lines.push(`- **Queue:** ${event.queue}`);
            if (type === 'Consumed' && event.bindingKey) lines.push(`- **Binding Key:** ${event.bindingKey}`);
            if (type === 'Consumed' && event.sourceService) lines.push(`- **Source Service:** ${event.sourceService}`);
            if (event.schemaVersion) lines.push(`- **Schema Version:** ${event.schemaVersion}`);
            if (event.description) lines.push(`- **Description:** ${event.description}`);
            lines.push('');
        });
    }
    
    // Render Kafka events
    if (kafkaEvents.length > 0) {
        if (type === 'Published') {
            lines.push('#### 3.3.2 Via Kafka (External)');
        } else {
            lines.push('#### 3.4.2 Events Consumed from Kafka (External)');
        }
        lines.push('');
        
        kafkaEvents.forEach((event, idx) => {
            lines.push(`**Event ${idx + 1}:** ${event.name || '[Event Name]'}`);
            if (event.topic) lines.push(`- **Topic:** ${event.topic}`);
            if (type === 'Published' && event.partitionKey) lines.push(`- **Partition Key:** ${event.partitionKey}`);
            if (type === 'Published' && event.partitions) lines.push(`- **Partitions:** ${event.partitions}`);
            if (type === 'Published' && event.replicationFactor) lines.push(`- **Replication Factor:** ${event.replicationFactor}`);
            if (type === 'Published' && event.retentionPeriod) lines.push(`- **Retention Period:** ${event.retentionPeriod}`);
            if (type === 'Consumed' && event.consumerGroup) lines.push(`- **Consumer Group:** ${event.consumerGroup}`);
            if (type === 'Consumed' && event.sourceSystem) lines.push(`- **Source System:** ${event.sourceSystem}`);
            if (event.description) lines.push(`- **Description:** ${event.description}`);
            lines.push('');
        });
    }
    
    return lines;
}

function renderDatabaseSchemas(schemas) {
    if (!schemas || schemas.length === 0) {
        return ['4.1.1 Schema Design', '', '_No schema files uploaded._'];
    }
    
    const lines = [];
    lines.push('4.1.1 Schema Design');
    lines.push('');
    
    schemas.forEach((schema, idx) => {
        const schemaName = schema.fileName || `schema_${idx + 1}`;
        lines.push(`**${schemaName}**`);
        
        if (schema.description) {
            lines.push(`- **Description:** ${schema.description}`);
        }
        
        if (schema.content) {
            // Determine if it's a code block by extension
            const ext = schemaName.split('.').pop()?.toLowerCase();
            const lang = (ext === 'json') ? 'json' : 
                        (ext === 'sql' || ext === 'ddl') ? 'sql' : 
                        (ext === 'cypher') ? 'cypher' :
                        (ext === 'txt') ? 'text' : '';
            
            lines.push('');
            lines.push('```' + lang);
            lines.push(schema.content);
            lines.push('```');
        } else {
            lines.push('_Schema content not available._');
        }
        lines.push('');
    });
    
    return lines;
}

function escapeYaml(str) {
    if (!str) return '';
    return str.replace(/"/g, '\\"');
}

