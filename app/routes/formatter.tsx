import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  UploadCloud,
  Sparkles,
  Minimize2,
  Copy,
  Check,
  Table,
  Download,
  AlertCircle,
  FileCode,
  ArrowRight,
  FileJson
} from 'lucide-react';
import type { Route } from './+types/formatter';
import {
  validateJsonString,
  formatJson,
  minifyJson,
  processJsonToDataset,
  type ParseErrorDetails
} from '../lib/json-processor';
import { useWorkspace } from '../context/WorkspaceContext';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "JSON Formatter & Minifier — Prettify, Compact & Validate JSON Locally" },
    {
      name: "description",
      content:
        "Free local JSON formatter and minifier. Prettify, compact, validate, and convert JSON to interactive tables directly in your browser with zero server transmission.",
    },
    {
      name: "keywords",
      content:
        "json formatter, json minifier, prettify json, format json online, validate json, offline json beautifier, json to table",
    },
    { tagName: "link", rel: "canonical", href: "https://jsonvisualiser.com/formatter" },
  ];
}

export default function FormatterPage() {
  const { addDataset } = useWorkspace();
  const navigate = useNavigate();

  const [inputJson, setInputJson] = useState('');
  const [outputJson, setOutputJson] = useState('');
  const [activeMode, setActiveMode] = useState<'prettify' | 'minify' | null>(null);
  const [indentSize, setIndentSize] = useState<number>(2);
  const [fileName, setFileName] = useState<string>('data.json');
  const [validationError, setValidationError] = useState<ParseErrorDetails | null>(null);
  const [leftCopied, setLeftCopied] = useState(false);
  const [rightCopied, setRightCopied] = useState(false);
  const [isProcessingWorkspace, setIsProcessingWorkspace] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload
  const handleFileUpload = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = (e.target?.result as string) || '';
      setInputJson(content);
      setValidationError(null);
      setOutputJson('');
      setActiveMode(null);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Prettify
  const handlePrettify = () => {
    if (!inputJson.trim()) return;
    try {
      const formatted = formatJson(inputJson, indentSize);
      setOutputJson(formatted);
      setActiveMode('prettify');
      setValidationError(null);
    } catch (err) {
      const val = validateJsonString(inputJson);
      if (!val.isValid && val.error) {
        setValidationError(val.error);
      }
    }
  };

  // Minify
  const handleMinify = () => {
    if (!inputJson.trim()) return;
    try {
      const minified = minifyJson(inputJson);
      setOutputJson(minified);
      setActiveMode('minify');
      setValidationError(null);
    } catch (err) {
      const val = validateJsonString(inputJson);
      if (!val.isValid && val.error) {
        setValidationError(val.error);
      }
    }
  };

  // Copy Left (Raw Input)
  const handleCopyLeft = async () => {
    if (!inputJson.trim()) return;
    try {
      await navigator.clipboard.writeText(inputJson);
      setLeftCopied(true);
      setTimeout(() => setLeftCopied(false), 2000);
    } catch (err) {
      // ignore
    }
  };

  // Copy Right (Formatted/Minified Output)
  const handleCopyRight = async () => {
    const text = outputJson || inputJson;
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      setRightCopied(true);
      setTimeout(() => setRightCopied(false), 2000);
    } catch (err) {
      // ignore
    }
  };

  // Download Output
  const handleDownload = () => {
    const content = outputJson || inputJson;
    if (!content.trim()) return;
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName ? `formatted-${fileName}` : 'formatted.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Send to Workspace Table
  const handleOpenInWorkspace = async () => {
    const contentToProcess = outputJson || inputJson;
    if (!contentToProcess.trim()) return;

    const val = validateJsonString(contentToProcess);
    if (!val.isValid) {
      setValidationError(val.error || { message: 'Invalid JSON' });
      return;
    }

    setIsProcessingWorkspace(true);
    try {
      const dataset = await processJsonToDataset(
        contentToProcess,
        fileName.trim() || 'data.json'
      );
      await addDataset(dataset);
      setIsProcessingWorkspace(false);
      navigate('/workspace/data');
    } catch (err: any) {
      setIsProcessingWorkspace(false);
      setValidationError({
        message: `Workspace conversion failed: ${err?.message || 'Unable to tabularize JSON.'}`,
        suggestion: 'Make sure your JSON is an array of objects or structured records.',
      });
    }
  };

  // Stats
  const inputSize = new Blob([inputJson]).size;
  const outputSize = new Blob([outputJson]).size;
  const inputLines = inputJson ? inputJson.split('\n').length : 0;
  const outputLines = outputJson ? outputJson.split('\n').length : 0;
  const compressionRatio =
    inputSize > 0 && outputSize > 0
      ? Math.round(((inputSize - outputSize) / inputSize) * 100)
      : null;

  return (
    <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-4">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.jsonl,.txt"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {/* TOP / UPPER SECTION: Action Buttons & Controls Bar */}
      <div className="p-3 rounded-xl bg-white dark:bg-[#0e1422] border border-slate-200/90 dark:border-slate-800/90 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
        {/* Left Action Buttons: Upload, Download, Open in Workspace */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg shadow-sm shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer"
            title="Import JSON file from your device"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload JSON File</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={!outputJson && !inputJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
            title="Download formatted JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Download</span>
          </button>

          <button
            onClick={handleOpenInWorkspace}
            disabled={(!outputJson && !inputJson) || isProcessingWorkspace}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300/80 dark:border-emerald-800/80 rounded-lg shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
            title="Convert to interactive spreadsheet table and run SQL queries"
          >
            <Table className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Open in Workspace</span>
            <ArrowRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          </button>
        </div>

        {/* Right Action Buttons: Indent Selector, Minify & Prettify */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Indent Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
            <button
              onClick={() => {
                setIndentSize(2);
                if (inputJson) {
                  try {
                    setOutputJson(formatJson(inputJson, 2));
                    setActiveMode('prettify');
                  } catch (e) {}
                }
              }}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                indentSize === 2
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              2 Spaces
            </button>
            <button
              onClick={() => {
                setIndentSize(4);
                if (inputJson) {
                  try {
                    setOutputJson(formatJson(inputJson, 4));
                    setActiveMode('prettify');
                  } catch (e) {}
                }
              }}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                indentSize === 4
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              4 Spaces
            </button>
          </div>

          {/* Minify Button */}
          <button
            onClick={handleMinify}
            disabled={!inputJson.trim()}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer ${
              activeMode === 'minify'
                ? 'bg-teal-600 text-white ring-1 ring-teal-400/50 shadow-teal-500/20'
                : 'bg-teal-500/15 hover:bg-teal-500/25 text-teal-700 dark:text-teal-300 border border-teal-300/60 dark:border-teal-700/60'
            } disabled:opacity-40`}
            title="Minify JSON (strip whitespace & newlines)"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Minify</span>
          </button>

          {/* Prettify Button */}
          <button
            onClick={handlePrettify}
            disabled={!inputJson.trim()}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer ${
              activeMode === 'prettify'
                ? 'bg-emerald-600 text-white ring-1 ring-emerald-400/50 shadow-emerald-500/20'
                : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60'
            } disabled:opacity-40`}
            title="Prettify and format JSON with indentation"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Prettify</span>
          </button>
        </div>
      </div>

      {/* Validation Error Alert Banner */}
      {validationError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 flex items-start gap-3 shadow-2xs animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm space-y-1">
            <div className="font-bold flex items-center gap-2">
              <span>Invalid JSON: {validationError.message}</span>
              {validationError.line && (
                <span className="px-2 py-0.5 rounded bg-rose-200/80 dark:bg-rose-900 text-rose-900 dark:text-rose-100 text-xs font-mono font-semibold">
                  Line {validationError.line}, Col {validationError.column}
                </span>
              )}
            </div>
            {validationError.snippet && (
              <pre className="font-mono text-xs bg-rose-100/70 dark:bg-rose-900/50 p-2 rounded-lg overflow-x-auto text-rose-900 dark:text-rose-200">
                {validationError.snippet}
              </pre>
            )}
            {validationError.suggestion && (
              <p className="text-xs text-rose-700 dark:text-rose-400 font-medium">
                Suggestion: {validationError.suggestion}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 2 SECTIONS: SIDE-BY-SIDE SPLIT PANES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[560px]">
        {/* LEFT SECTION: Raw Input & File Import */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col rounded-2xl bg-white dark:bg-[#0e1422] border transition-all shadow-xs overflow-hidden ${
            isDragging
              ? 'border-emerald-500 ring-2 ring-emerald-500/30'
              : 'border-slate-200/90 dark:border-slate-800/90'
          }`}
        >
          {/* Left Pane Header */}
          <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileJson className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Raw Input JSON
              </span>
              {fileName && (
                <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {fileName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span>{inputLines} lines</span>
                <span>•</span>
                <span>{(inputSize / 1024).toFixed(1)} KB</span>
              </div>

              {/* Copy Button with Icon on Left Side */}
              <button
                onClick={handleCopyLeft}
                disabled={!inputJson.trim()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
                title="Copy raw input JSON to clipboard"
              >
                {leftCopied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                )}
                <span>{leftCopied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Left Textarea */}
          <div className="relative flex-1 p-2">
            <textarea
              value={inputJson}
              onChange={(e) => {
                setInputJson(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder={`// 1. Paste raw JSON here, or\n// 2. Click "Upload JSON File" above, or\n// 3. Drag and drop a .json file directly into this area.\n\n{\n  "name": "JSON Visualiser",\n  "offline": true\n}`}
              spellCheck={false}
              className="w-full h-full min-h-[460px] p-4 font-mono text-xs sm:text-sm text-slate-900 dark:text-slate-100 bg-transparent border-0 focus:outline-none resize-none leading-relaxed selection:bg-emerald-500/20"
            />
          </div>
        </div>

        {/* RIGHT SECTION: Formatted / Minified Output */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200/90 dark:border-slate-800/90 shadow-xs overflow-hidden">
          {/* Right Pane Header */}
          <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                {activeMode === 'minify' ? 'Minified JSON' : 'Prettified JSON'}
              </span>

              {activeMode && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    activeMode === 'prettify'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/50 dark:border-emerald-800/50'
                      : 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-300/50 dark:border-teal-800/50'
                  }`}
                >
                  {activeMode === 'prettify' ? `Prettified (${indentSize}sp)` : 'Minified'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
                {compressionRatio !== null && activeMode === 'minify' && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {compressionRatio > 0 ? `-${compressionRatio}%` : '0%'}
                  </span>
                )}
                <span>{outputLines} lines</span>
                <span>•</span>
                <span>{(outputSize / 1024).toFixed(1)} KB</span>
              </div>

              {/* Copy Button with Icon on Right Side */}
              <button
                onClick={handleCopyRight}
                disabled={!outputJson && !inputJson}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
                title="Copy formatted output to clipboard"
              >
                {rightCopied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                )}
                <span>{rightCopied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Right Textarea / Output Display */}
          <div className="relative flex-1 p-2">
            <textarea
              readOnly
              value={outputJson}
              placeholder={`// Formatted JSON will appear here.\n// Click "Prettify" or "Minify" in the upper toolbar to format the JSON from the left section.`}
              spellCheck={false}
              className="w-full h-full min-h-[460px] p-4 font-mono text-xs sm:text-sm text-slate-900 dark:text-slate-100 bg-slate-50/40 dark:bg-slate-950/30 border-0 focus:outline-none resize-none leading-relaxed selection:bg-emerald-500/20"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
