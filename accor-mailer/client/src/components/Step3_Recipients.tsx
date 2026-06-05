import { useState, useCallback } from "react";
import type { FieldMapping } from "@shared/types";
import { parseExcel } from "../lib/api";

interface Props {
  contacts: Record<string, string>[];
  excelHeaders: string[];
  fieldMapping: FieldMapping;
  onChange: (d: { contacts?: Record<string, string>[]; excelHeaders?: string[]; fieldMapping?: FieldMapping }) => void;
  onBack: () => void;
  onNext: () => void;
}

const FIELD_LABELS = [
  { key: "emailField", label: "Email Address", required: true },
  { key: "firstNameField", label: "First Name", required: false },
  { key: "lastNameField", label: "Last Name", required: false },
];

export default function Step3_Recipients({ contacts, excelHeaders, fieldMapping, onChange, onBack, onNext }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [allSelected, setAllSelected] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const handleFile = useCallback(async (file: File) => {
    setLoading(true);
    setError("");
    try {
      const result = await parseExcel(file);
      onChange({ contacts: result.rows, excelHeaders: result.headers });

      // Auto-detect email field
      const emailGuess = result.headers.find((h) =>
        /^(email|e-?mail|email.?address|mail)$/i.test(h.trim())
      ) ?? "";
      const firstGuess = result.headers.find((h) =>
        /^(first.?name|firstname|f.name|given.?name|prenom)$/i.test(h.trim())
      ) ?? "";
      const lastGuess = result.headers.find((h) =>
        /^(last.?name|lastname|surname|family.?name|nom)$/i.test(h.trim())
      ) ?? "";

      onChange({
        fieldMapping: {
          emailField: emailGuess,
          firstNameField: firstGuess || undefined,
          lastNameField: lastGuess || undefined,
        },
      });

      const all = new Set(result.rows.map((_, i) => i));
      setSelected(all);
      setAllSelected(true);
      setPage(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file");
    } finally {
      setLoading(false);
    }
  }, [onChange]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) await handleFile(file);
  }, [handleFile]);

  const setField = (key: keyof FieldMapping, val: string) => {
    onChange({ fieldMapping: { ...fieldMapping, [key]: val || undefined } });
  };

  const toggleRow = (i: number) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      setAllSelected(next.size === contacts.length);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
      setAllSelected(false);
    } else {
      setSelected(new Set(contacts.map((_, i) => i)));
      setAllSelected(true);
    }
  };

  const selectedContacts = contacts.filter((_, i) => selected.has(i));
  const totalPages = Math.ceil(contacts.length / PAGE_SIZE);
  const pageContacts = contacts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const validEmail = (row: Record<string, string>) => {
    const v = fieldMapping.emailField ? row[fieldMapping.emailField]?.trim() : "";
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v ?? "");
  };

  const canProceed = selectedContacts.length > 0 && fieldMapping.emailField;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="font-serif text-3xl font-semibold text-navy-900 mb-2">Recipients</h2>
        <p className="text-gray-500 text-sm">Upload your contact list from Excel and map the columns.</p>
      </div>

      {/* Upload zone */}
      {!contacts.length ? (
        <div
          className={`drop-zone flex flex-col items-center justify-center p-16 text-center cursor-pointer ${dragging ? "active" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("excel-input")?.click()}
        >
          {loading ? (
            <svg className="animate-spin text-gold-500 mb-3" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
          ) : (
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.5" className="mb-4">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
          )}
          <p className="text-base font-medium text-gray-700 mb-1">
            {loading ? "Parsing your spreadsheet…" : "Drop your Excel file here"}
          </p>
          <p className="text-sm text-gray-400 mb-4">
            {loading ? "" : "Supports .xlsx and .xls formats"}
          </p>
          {!loading && (
            <button className="px-4 py-2 bg-gold-500 text-white rounded-lg text-sm font-medium hover:bg-gold-600 transition-colors">
              Browse Files
            </button>
          )}
          <input id="excel-input" type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }} />
        </div>
      ) : (
        <>
          {/* File loaded summary + re-upload */}
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-5 py-3 mb-5">
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              <div>
                <p className="text-sm font-semibold text-green-800">{contacts.length} contacts loaded</p>
                <p className="text-xs text-green-600">{excelHeaders.length} columns detected</p>
              </div>
            </div>
            <button
              onClick={() => {
                onChange({ contacts: [], excelHeaders: [] });
                setSelected(new Set());
              }}
              className="text-xs text-green-700 border border-green-300 rounded-lg px-3 py-1.5 hover:bg-green-100 transition-colors"
            >
              Upload different file
            </button>
          </div>

          {/* Field Mapping */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
              Column Mapping
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {FIELD_LABELS.map(({ key, label, required }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    {label} {required && <span className="text-red-400">*</span>}
                  </label>
                  <select
                    value={(fieldMapping as any)[key] ?? ""}
                    onChange={(e) => setField(key as keyof FieldMapping, e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 bg-white"
                  >
                    <option value="">— not mapped —</option>
                    {excelHeaders.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            {!fieldMapping.emailField && (
              <p className="text-xs text-red-500 mt-3">Please map the Email Address column to continue.</p>
            )}
          </div>

          {/* Contact table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-gold-500 w-4 h-4" />
                <span className="text-sm font-medium text-gray-700">
                  {selected.size} of {contacts.length} selected
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="inline-flex items-center gap-1 text-green-600">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                  Valid
                </span>
                <span className="inline-flex items-center gap-1 text-red-500">
                  <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                  Invalid email
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-2.5 text-left w-8" />
                    <th className="px-4 py-2.5 text-left font-medium text-gray-500">#</th>
                    {excelHeaders.slice(0, 6).map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left font-medium text-gray-500 truncate max-w-[160px]">{h}</th>
                    ))}
                    {excelHeaders.length > 6 && <th className="px-4 py-2.5 text-gray-400">+{excelHeaders.length - 6} more</th>}
                  </tr>
                </thead>
                <tbody>
                  {pageContacts.map((row, relIdx) => {
                    const absIdx = page * PAGE_SIZE + relIdx;
                    const valid = validEmail(row);
                    const checked = selected.has(absIdx);
                    return (
                      <tr
                        key={absIdx}
                        onClick={() => toggleRow(absIdx)}
                        className={`border-b border-gray-50 cursor-pointer transition-colors ${checked ? "bg-white hover:bg-gray-50" : "bg-gray-50 opacity-60"}`}
                      >
                        <td className="px-4 py-2.5">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleRow(absIdx)}
                            onClick={(e) => e.stopPropagation()}
                            className="accent-gold-500 w-4 h-4"
                          />
                        </td>
                        <td className="px-4 py-2.5 text-gray-400 text-xs">{absIdx + 1}</td>
                        {excelHeaders.slice(0, 6).map((h) => (
                          <td key={h} className="px-4 py-2.5 max-w-[160px] truncate">
                            {h === fieldMapping.emailField ? (
                              <span className={valid ? "text-green-700 font-medium" : "text-red-600"}>
                                {row[h] || <em className="text-gray-300">empty</em>}
                              </span>
                            ) : (
                              row[h] || <span className="text-gray-300">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 px-5 py-3 border-t border-gray-100">
                <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 rounded border border-gray-200 text-sm disabled:opacity-30 hover:bg-gray-50">←</button>
                <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
                <button disabled={page === totalPages - 1} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 rounded border border-gray-200 text-sm disabled:opacity-30 hover:bg-gray-50">→</button>
              </div>
            )}
          </div>
        </>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 mb-4">{error}</div>
      )}

      <div className="flex justify-between mt-6">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>
        <button
          onClick={() => {
            onChange({ contacts: selectedContacts });
            onNext();
          }}
          disabled={!canProceed}
          className="flex items-center gap-2 px-6 py-2.5 bg-navy-900 text-white rounded-lg text-sm font-semibold hover:bg-navy-800 disabled:opacity-40 transition-all"
        >
          Continue with {selectedContacts.length} recipient{selectedContacts.length !== 1 ? "s" : ""}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
