import { useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { parseMsgFile } from "../lib/api";

interface Props {
  subject: string;
  html: string;
  replyTo: string;
  onChange: (d: { subject?: string; html?: string; replyTo?: string }) => void;
  onBack: () => void;
  onNext: () => void;
}

type Tab = "compose" | "html" | "msg";

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`p-1.5 rounded text-sm transition-colors ${
        active ? "bg-gold-100 text-gold-700" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;
  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
        <span className="underline">U</span>
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
        <span className="line-through">S</span>
      </ToolbarButton>
      <div className="w-px h-5 bg-gray-200 mx-1" />
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">
        H1
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
        H2
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
        H3
      </ToolbarButton>
      <div className="w-px h-5 bg-gray-200 mx-1" />
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10H6"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
      </ToolbarButton>
      <div className="w-px h-5 bg-gray-200 mx-1" />
      <ToolbarButton
        onClick={() => {
          const url = window.prompt("Enter URL:");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
        active={editor.isActive("link")}
        title="Insert link"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
      </ToolbarButton>
      <div className="w-px h-5 bg-gray-200 mx-1" />
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/></svg>
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3L21 13"/></svg>
      </ToolbarButton>
    </div>
  );
}

export default function Step2_EmailComposer({ subject, html, replyTo, onChange, onBack, onNext }: Props) {
  const [tab, setTab] = useState<Tab>("compose");
  const [rawHtml, setRawHtml] = useState(html);
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgError, setMsgError] = useState("");
  const [preview, setPreview] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Compose your email here… Use {{firstName}}, {{lastName}}, {{name}} for personalisation." }),
    ],
    content: tab === "compose" ? html : "",
    onUpdate({ editor }) {
      if (tab === "compose") {
        onChange({ html: editor.getHTML() });
      }
    },
  });

  const handleTabChange = (t: Tab) => {
    if (t === "compose" && editor) {
      editor.commands.setContent(html || "");
    }
    setTab(t);
  };

  const handleHtmlChange = (val: string) => {
    setRawHtml(val);
    onChange({ html: val });
  };

  const handleMsgDrop = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsgLoading(true);
    setMsgError("");
    try {
      const result = await parseMsgFile(file);
      onChange({ subject: result.subject, html: result.html });
      setRawHtml(result.html);
      if (editor) editor.commands.setContent(result.html);
      setTab("html");
    } catch (err) {
      setMsgError(err instanceof Error ? err.message : "Failed to parse .msg file");
    } finally {
      setMsgLoading(false);
    }
  }, [editor, onChange]);

  const currentHtml = tab === "compose" ? (editor?.getHTML() ?? html) : rawHtml;
  const canProceed = subject.trim() && currentHtml.trim() && currentHtml !== "<p></p>";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="font-serif text-3xl font-semibold text-navy-900 mb-2">Email Content</h2>
        <p className="text-gray-500 text-sm">Compose your message or import from Outlook / HTML file.</p>
      </div>

      {/* Subject & Reply-To */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Subject Line <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => onChange({ subject: e.target.value })}
            placeholder="Your email subject — supports {{firstName}}, {{name}}, etc."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Reply-To <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="email"
            value={replyTo}
            onChange={(e) => onChange({ replyTo: e.target.value })}
            placeholder="reply-to@yourhotel.com"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
          />
        </div>
      </div>

      {/* Variable hint */}
      <div className="bg-gold-50 border border-gold-200 rounded-lg px-4 py-3 mb-5 flex gap-3 text-sm">
        <svg className="text-gold-600 shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span className="text-gold-800">
          Use <code className="bg-gold-100 px-1 rounded font-mono text-xs">{"{{firstName}}"}</code>,{" "}
          <code className="bg-gold-100 px-1 rounded font-mono text-xs">{"{{lastName}}"}</code>,{" "}
          <code className="bg-gold-100 px-1 rounded font-mono text-xs">{"{{name}}"}</code>,{" "}
          <code className="bg-gold-100 px-1 rounded font-mono text-xs">{"{{email}}"}</code> anywhere in your subject or body for personalisation.
          Any Excel column name also works: <code className="bg-gold-100 px-1 rounded font-mono text-xs">{"{{Company}}"}</code>.
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-0 border-b border-gray-200">
        {(["compose", "html", "msg"] as Tab[]).map((t) => {
          const labels: Record<Tab, string> = { compose: "Compose", html: "Import HTML", msg: "Import .msg (Outlook)" };
          return (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px
                ${tab === t ? "border-gold-500 text-gold-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              {labels[t]}
            </button>
          );
        })}
        <div className="flex-1" />
        <button
          onClick={() => setPreview((v) => !v)}
          className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-navy-900 flex items-center gap-1.5 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
          </svg>
          {preview ? "Hide Preview" : "Preview"}
        </button>
      </div>

      <div className={`grid gap-4 ${preview ? "grid-cols-2" : "grid-cols-1"}`}>
        {/* Editor */}
        <div className="bg-white border border-gray-200 rounded-b-xl shadow-sm overflow-hidden" style={{ borderTopLeftRadius: 0, borderTopRightRadius: preview ? undefined : 0 }}>
          {tab === "compose" && (
            <>
              <EditorToolbar editor={editor} />
              <div className="tiptap-editor">
                <EditorContent editor={editor} />
              </div>
            </>
          )}

          {tab === "html" && (
            <div className="p-4">
              <p className="text-xs text-gray-400 mb-2">Paste or type HTML, or upload an HTML file.</p>
              <div className="mb-3">
                <label className="drop-zone flex flex-col items-center justify-center p-4 cursor-pointer rounded-lg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2" className="mb-1">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span className="text-xs text-gray-500">Upload HTML file</span>
                  <input
                    type="file"
                    accept=".html,.htm"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const text = await file.text();
                      handleHtmlChange(text);
                    }}
                  />
                </label>
              </div>
              <textarea
                value={rawHtml}
                onChange={(e) => handleHtmlChange(e.target.value)}
                placeholder="<p>Dear {{firstName}},</p><p>...</p>"
                rows={14}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-gold-400 resize-y"
              />
            </div>
          )}

          {tab === "msg" && (
            <div className="p-8 flex flex-col items-center gap-4">
              <label className="drop-zone w-full flex flex-col items-center justify-center p-10 cursor-pointer">
                {msgLoading ? (
                  <svg className="animate-spin text-gold-500 mb-2" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                ) : (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="1.5" className="mb-3">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8M16 17H8M10 9H8"/>
                  </svg>
                )}
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {msgLoading ? "Parsing Outlook message…" : "Drop your .msg file here"}
                </p>
                <p className="text-xs text-gray-400">
                  {msgLoading ? "" : "Subject and body will be extracted automatically"}
                </p>
                <input type="file" accept=".msg" className="hidden" onChange={handleMsgDrop} disabled={msgLoading} />
              </label>
              {msgError && (
                <div className="w-full px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {msgError}
                </div>
              )}
              {html && !msgError && (
                <div className="w-full px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Message imported — subject and body ready. Switch to HTML tab to edit.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Preview */}
        {preview && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-100 text-xs font-medium text-gray-500 bg-gray-50">
              Email Preview
            </div>
            <div className="p-3">
              <p className="text-xs text-gray-400 mb-1">Subject: <span className="text-gray-700">{subject || "(no subject)"}</span></p>
            </div>
            <iframe
              srcDoc={currentHtml || "<p style='color:#aaa;padding:16px;font-family:sans-serif;'>Your email will appear here…</p>"}
              className="w-full border-t border-gray-100"
              style={{ height: "420px" }}
              sandbox="allow-same-origin"
              title="Email preview"
            />
          </div>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="flex items-center gap-2 px-6 py-2.5 bg-navy-900 text-white rounded-lg text-sm font-semibold hover:bg-navy-800 disabled:opacity-40 transition-all"
        >
          Continue
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
