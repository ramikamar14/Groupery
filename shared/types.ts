export interface SmtpConfig {
  fromName: string;
  fromEmail: string;
  password: string;
  host: string;
  port: number;
}

export interface ExcelParseResult {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

export interface MsgParseResult {
  subject: string;
  html: string;
  fromName?: string;
  fromEmail?: string;
}

export interface FieldMapping {
  emailField: string;
  firstNameField?: string;
  lastNameField?: string;
  customFields?: Record<string, string>;
}

export interface SendJobRequest {
  smtp: SmtpConfig;
  subject: string;
  html: string;
  contacts: Record<string, string>[];
  fieldMapping: FieldMapping;
  replyTo?: string;
}

export interface SendResult {
  email: string;
  name: string;
  status: "sent" | "failed";
  error?: string;
}

export interface JobStatus {
  id: string;
  total: number;
  processed: number;
  sent: number;
  failed: number;
  done: boolean;
  results: SendResult[];
  error?: string;
  startedAt: string;
}
