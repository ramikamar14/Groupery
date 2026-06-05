import { useState } from "react";
import type { SmtpConfig, FieldMapping } from "@shared/types";
import StepIndicator from "./components/StepIndicator";
import Step1_SmtpConfig from "./components/Step1_SmtpConfig";
import Step2_EmailComposer from "./components/Step2_EmailComposer";
import Step3_Recipients from "./components/Step3_Recipients";
import Step4_Send from "./components/Step4_Send";

export type WizardState = {
  smtp: SmtpConfig;
  subject: string;
  html: string;
  replyTo: string;
  contacts: Record<string, string>[];
  excelHeaders: string[];
  fieldMapping: FieldMapping;
};

const defaultSmtp: SmtpConfig = {
  fromName: "",
  fromEmail: "",
  password: "",
  host: "smtp.office365.com",
  port: 587,
};

export default function App() {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>({
    smtp: defaultSmtp,
    subject: "",
    html: "",
    replyTo: "",
    contacts: [],
    excelHeaders: [],
    fieldMapping: { emailField: "" },
  });

  const update = (patch: Partial<WizardState>) => setState((s) => ({ ...s, ...patch }));

  const steps = ["SMTP Setup", "Email Content", "Recipients", "Send"];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-navy-900 text-white py-4 px-6 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="font-serif text-xl font-semibold leading-tight">Accor Email Marketing</h1>
              <p className="text-xs text-gold-300 leading-none">Fairmont · Raffles · Sofitel</p>
            </div>
          </div>
          <span className="text-xs text-white/40 font-mono">O365 SMTP</span>
        </div>
      </header>

      {/* Step indicator */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <StepIndicator steps={steps} current={step} />
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <div className="step-enter">
          {step === 0 && (
            <Step1_SmtpConfig
              smtp={state.smtp}
              onChange={(smtp) => update({ smtp })}
              onNext={() => setStep(1)}
            />
          )}
          {step === 1 && (
            <Step2_EmailComposer
              subject={state.subject}
              html={state.html}
              replyTo={state.replyTo}
              onChange={(d) => update(d)}
              onBack={() => setStep(0)}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <Step3_Recipients
              contacts={state.contacts}
              excelHeaders={state.excelHeaders}
              fieldMapping={state.fieldMapping}
              onChange={(d) => update(d)}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <Step4_Send
              state={state}
              onBack={() => setStep(2)}
            />
          )}
        </div>
      </main>

      <footer className="text-center py-3 text-xs text-gray-400 border-t border-gray-100">
        Accor Email Marketing Tool — Internal Use Only
      </footer>
    </div>
  );
}
