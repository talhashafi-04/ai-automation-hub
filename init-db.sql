-- AI Automation Hub Database Initialization
-- This script creates the initial database structure

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- AUTOMATION REQUESTS TABLE
-- ============================================
CREATE TABLE automation_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    request_type VARCHAR(100) NOT NULL,
    request_data JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    n8n_execution_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT
);

-- ============================================
-- AI PROCESSING RESULTS TABLE
-- ============================================
CREATE TABLE ai_processing_results (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES automation_requests(id),
    ai_provider VARCHAR(50) NOT NULL, -- 'openai', 'claude', etc.
    input_text TEXT NOT NULL,
    output_text TEXT NOT NULL,
    processing_time_ms INTEGER,
    tokens_used INTEGER,
    cost_usd DECIMAL(10, 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- WORKFLOW EXECUTIONS TABLE
-- ============================================
CREATE TABLE workflow_executions (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES automation_requests(id),
    workflow_name VARCHAR(255) NOT NULL,
    execution_status VARCHAR(50) NOT NULL,
    execution_data JSONB,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP,
    error_details TEXT
);

-- ============================================
-- EMAIL LOGS TABLE
-- ============================================
CREATE TABLE email_logs (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES automation_requests(id),
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    email_status VARCHAR(50) DEFAULT 'sent',
    gmail_message_id VARCHAR(255),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT
);

-- ============================================
-- NOTIFICATION LOGS TABLE
-- ============================================
CREATE TABLE notification_logs (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES automation_requests(id),
    platform VARCHAR(50) NOT NULL, -- 'slack', 'discord', etc.
    message TEXT NOT NULL,
    notification_status VARCHAR(50) DEFAULT 'sent',
    webhook_response JSONB,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SYSTEM SETTINGS TABLE
-- ============================================
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INSERT DEFAULT SETTINGS
-- ============================================
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('ai_provider_default', 'openai', 'Default AI provider for processing'),
('max_requests_per_hour', '100', 'Rate limiting for automation requests'),
('email_sender_name', 'AI Automation Hub', 'Default sender name for emails'),
('slack_default_channel', '#general', 'Default Slack channel for notifications');

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_automation_requests_user_id ON automation_requests(user_id);
CREATE INDEX idx_automation_requests_status ON automation_requests(status);
CREATE INDEX idx_automation_requests_created_at ON automation_requests(created_at);
CREATE INDEX idx_ai_processing_results_request_id ON ai_processing_results(request_id);
CREATE INDEX idx_workflow_executions_request_id ON workflow_executions(request_id);
CREATE INDEX idx_email_logs_request_id ON email_logs(request_id);
CREATE INDEX idx_notification_logs_request_id ON notification_logs(request_id);

-- ============================================
-- CREATE VIEWS FOR REPORTING
-- ============================================
CREATE VIEW automation_summary AS
SELECT 
    ar.id,
    u.email as user_email,
    ar.request_type,
    ar.status,
    ar.created_at,
    ar.completed_at,
    EXTRACT(EPOCH FROM (ar.completed_at - ar.created_at)) as processing_time_seconds
FROM automation_requests ar
LEFT JOIN users u ON ar.user_id = u.id;

COMMENT ON TABLE users IS 'Stores user information for the automation hub';
COMMENT ON TABLE automation_requests IS 'Main table tracking all automation requests and their status';
COMMENT ON TABLE ai_processing_results IS 'Stores AI processing results and usage metrics';
COMMENT ON TABLE workflow_executions IS 'Tracks n8n workflow execution details';
COMMENT ON TABLE email_logs IS 'Logs all email communications sent by the system';
COMMENT ON TABLE notification_logs IS 'Tracks notifications sent to Slack/Discord';
COMMENT ON VIEW automation_summary IS 'Summary view for reporting and analytics';