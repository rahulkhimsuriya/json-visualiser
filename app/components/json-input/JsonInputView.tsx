import React, { useState, useRef } from 'react'
import {
  UploadCloud,
  FileCode2,
  Sparkles,
  Minimize2,
  Copy,
  Trash2,
  AlertCircle,
  Play,
  Check,
  Database,
  ArrowRight,
  HelpCircle,
} from 'lucide-react'
import {
  validateJsonString,
  parseJsonString,
  formatJson,
  minifyJson,
  processParsedJsonToDataset,
  type ParseErrorDetails,
} from '../../lib/json-processor'
import {
  PRESET_DATASETS,
  type SampleDatasetPreset,
} from '../../lib/sample-data'
import { ProgressBar } from '../common/ProgressBar'
import type { Dataset } from '../../types/dataset'

const INLINE_EDITOR_FILE_LIMIT_BYTES = 2 * 1024 * 1024
const JSON_EXAMPLE = JSON.stringify(
  [
    {
      id: 1,
      name: 'Rahul',
      address: { city: 'Ahmedabad', country: 'India' },
    },
  ],
  null,
  2,
)

interface JsonInputViewProps {
  onDatasetCreated: (dataset: Dataset) => void
  onCancel?: () => void
  canCancel?: boolean
}

export const JsonInputView: React.FC<JsonInputViewProps> = ({
  onDatasetCreated,
  onCancel,
  canCancel = false,
}) => {
  const [jsonText, setJsonText] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [datasetName, setDatasetName] = useState('dataset.json')
  const [isDragging, setIsDragging] = useState(false)
  const [validationError, setValidationError] =
    useState<ParseErrorDetails | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleTextChange = (text: string) => {
    setJsonText(text)
    setUploadedFile(null)
    if (validationError) {
      setValidationError(null)
    }
  }

  const handleFileUpload = (file: File) => {
    if (!file) return
    setDatasetName(file.name)
    setValidationError(null)

    // Rendering a multi-megabyte JSON document in a controlled textarea causes
    // React and the browser to retain several copies of it. Keep large files out
    // of the editor and only read them when the user explicitly starts ingestion.
    if (file.size > INLINE_EDITOR_FILE_LIMIT_BYTES) {
      setJsonText('')
      setUploadedFile(file)
      return
    }

    const reader = new FileReader()
    reader.onerror = () => {
      setValidationError({
        message: `Could not read ${file.name}. Please try selecting it again.`,
      })
    }
    reader.onload = (e) => {
      const content = e.target?.result as string
      setJsonText(content || '')
      setUploadedFile(null)
    }
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFormat = () => {
    try {
      const formatted = formatJson(jsonText)
      setJsonText(formatted)
      setValidationError(null)
    } catch (err) {
      const val = validateJsonString(jsonText)
      if (!val.isValid && val.error) {
        setValidationError(val.error)
      }
    }
  }

  const handleMinify = () => {
    try {
      const minified = minifyJson(jsonText)
      setJsonText(minified)
      setValidationError(null)
    } catch (err) {
      const val = validateJsonString(jsonText)
      if (!val.isValid && val.error) {
        setValidationError(val.error)
      }
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // ignore
    }
  }

  const handleClear = () => {
    setJsonText('')
    setUploadedFile(null)
    setValidationError(null)
  }

  const handleLoadPreset = (preset: SampleDatasetPreset) => {
    const raw = JSON.stringify(preset.data, null, 2)
    setJsonText(raw)
    setUploadedFile(null)
    setDatasetName(preset.filename)
    setValidationError(null)
  }

  const handleProcess = async () => {
    setValidationError(null)
    setIsProcessing(true)
    setProgress(5)
    setProgressMessage(
      uploadedFile
        ? `Reading ${uploadedFile.name} locally...`
        : 'Starting in-browser JSON analysis...',
    )

    try {
      const rawJson = uploadedFile ? await uploadedFile.text() : jsonText
      const parsed = parseJsonString(rawJson)
      if (!parsed.isValid) {
        setValidationError(parsed.error)
        return
      }

      const dataset = await processParsedJsonToDataset(
        parsed.value,
        rawJson,
        datasetName.trim() || 'dataset.json',
        (pct, msg) => {
          setProgress(pct)
          setProgressMessage(msg)
        },
      )

      onDatasetCreated(dataset)
    } catch (err: any) {
      setValidationError({
        message: `Processing failed: ${err?.message || 'Unable to process JSON structure.'}`,
        suggestion:
          'Ensure the JSON is an array of objects or a standard structured object.',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col space-y-4 flex-1 min-h-0 w-full">
      {/* Top Banner / Privacy Callout */}
      <div className="p-3 rounded-xl bg-white/70 dark:bg-[#0e1320]/70 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Import & Ingest JSON</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
              <Sparkles className="w-3 h-3 text-emerald-500" /> Auto Type Detection
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            100% Client-side. Automatically detects numbers, decimals, dates, datetimes, and timestamps.
          </p>
        </div>

        {/* Quick Sample Dataset Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-emerald-500" /> Samples:
          </span>
          {PRESET_DATASETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleLoadPreset(p)}
              className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer shadow-2xs"
              title={p.description}
            >
              {p.filename}
            </button>
          ))}
        </div>
      </div>

      {/* Main Box */}
      <div className="bg-white dark:bg-[#0e1320] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-xs overflow-hidden">
        {/* Name input & upload bar */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Dataset Name:
            </span>
            <input
              type="text"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              placeholder="e.g. users.json, sales_data.json"
              className="px-3 py-1.5 text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-1 max-w-xs shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.jsonl,.txt"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileUpload(e.target.files[0])
                }
                // Allow choosing the same file again after it has been cleared.
                e.currentTarget.value = ''
              }}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5 text-emerald-500" />
              Upload JSON File
            </button>
          </div>
        </div>

        {/* Drag & Drop Zone / Editor */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative transition-all ${
            isDragging ? 'ring-4 ring-emerald-500/25 bg-emerald-50/10' : ''
          }`}
        >
          {isDragging && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-emerald-500/10 backdrop-blur-xs border-2 border-dashed border-emerald-500 rounded-xl m-2 pointer-events-none">
              <UploadCloud className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mb-2 animate-bounce" />
              <p className="text-base font-bold text-emerald-700 dark:text-emerald-300">
                Drop your JSON file here
              </p>
            </div>
          )}

          {/* Textarea Editor */}
          <div className="relative flex">
            {uploadedFile && (
              <div className="m-4 w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
                <div className="flex items-center gap-2 font-semibold">
                  <FileCode2 className="h-4 w-4 shrink-0" />
                  {uploadedFile.name}
                </div>
                <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                  {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB — kept out
                  of the editor to prevent browser memory spikes. Select Process
                  JSON to read and analyze it locally.
                </p>
              </div>
            )}
            <textarea
              value={jsonText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={
                uploadedFile
                  ? 'This large file is ready to process.'
                  : JSON_EXAMPLE
              }
              rows={18}
              className="w-full p-4 font-mono text-xs sm:text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-y leading-relaxed selection:bg-emerald-500/20"
              disabled={uploadedFile !== null}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Validation Error Message Box */}
        {validationError && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border-t border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-900 dark:text-rose-200 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm">
              <p className="font-bold text-rose-800 dark:text-rose-300">
                Invalid JSON
              </p>
              <p className="mt-1 whitespace-pre-wrap font-mono">
                {validationError.message}
              </p>
              {validationError.snippet && (
                <div className="mt-2 p-2.5 rounded-xl bg-rose-100 dark:bg-rose-900/60 font-mono text-xs text-rose-950 dark:text-rose-100 border border-rose-200 dark:border-rose-800">
                  {validationError.snippet}
                </div>
              )}
              {validationError.suggestion && (
                <p className="mt-1.5 text-xs text-rose-700 dark:text-rose-400 font-medium">
                  Hint: {validationError.suggestion}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Processing Progress Bar */}
        {isProcessing && (
          <div className="p-6 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50">
            <ProgressBar progress={progress} message={progressMessage} />
          </div>
        )}

        {/* Action Toolbar */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
          {/* Editor utilities */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleFormat}
              disabled={!jsonText.trim() || isProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs transition-colors disabled:opacity-40 cursor-pointer"
              title="Pretty format JSON"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              Format JSON
            </button>

            <button
              onClick={handleMinify}
              disabled={!jsonText.trim() || isProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs transition-colors disabled:opacity-40 cursor-pointer"
              title="Minify JSON"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              Minify
            </button>

            <button
              onClick={handleCopy}
              disabled={!jsonText.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs transition-colors disabled:opacity-40 cursor-pointer"
              title="Copy JSON to clipboard"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copied ? 'Copied' : 'Copy'}
            </button>

            <button
              onClick={handleClear}
              disabled={(!jsonText.trim() && !uploadedFile) || isProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs transition-colors disabled:opacity-40 cursor-pointer"
              title="Clear input"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>

          {/* Process Button */}
          <div className="flex items-center gap-2">
            {canCancel && onCancel && (
              <button
                onClick={onCancel}
                disabled={isProcessing}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}

            <button
              onClick={handleProcess}
              disabled={(!jsonText.trim() && !uploadedFile) || isProcessing}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-md shadow-emerald-600/25 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              {isProcessing ? 'Processing...' : 'Process JSON'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
