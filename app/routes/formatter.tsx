import React, { useMemo, useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router'
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
  FileJson,
  ChevronDown,
  ChevronRight,
  ChevronsDown,
  ChevronsUp,
  CloudUpload,
} from 'lucide-react'
import type { Route } from './+types/formatter'
import {
  validateJsonString,
  formatJson,
  minifyJson,
  processJsonToDataset,
  type ParseErrorDetails,
} from '../lib/json-processor'
import { useWorkspace } from '../context/WorkspaceContext'

interface JsonTreeNodeProps {
  value: unknown
  label?: string | number
  depth?: number
  initiallyExpanded?: boolean
  expandedByDefaultDepth?: number
}

function JsonTreeNode({
  value,
  label,
  depth = 0,
  initiallyExpanded = false,
  expandedByDefaultDepth = 0,
}: JsonTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(
    initiallyExpanded || expandedByDefaultDepth > 0,
  )
  const isArray = Array.isArray(value)
  const isObject = value !== null && typeof value === 'object' && !isArray
  const isContainer = isArray || isObject

  if (!isContainer) {
    const displayValue =
      typeof value === 'string' ? JSON.stringify(value) : String(value)
    const valueColor =
      value === null
        ? 'text-slate-400'
        : typeof value === 'string'
          ? 'text-emerald-600 dark:text-emerald-300'
          : typeof value === 'number'
            ? 'text-sky-600 dark:text-sky-300'
            : 'text-violet-600 dark:text-violet-300'

    return (
      <div
        role="treeitem"
        className="flex min-h-7 items-center gap-2 font-mono text-xs sm:text-sm"
        style={{ paddingLeft: `${depth * 16}px` }}
      >
        {label !== undefined && (
          <span className="text-slate-500 dark:text-slate-400">{label}:</span>
        )}
        <span className={valueColor}>{displayValue}</span>
      </div>
    )
  }

  const entries = isArray
    ? value.map((item, index) => [index, item] as const)
    : Object.entries(value as Record<string, unknown>)
  const containerLabel = isArray
    ? `Array [${entries.length}]`
    : `Object {${entries.length}}`

  return (
    <div role="treeitem" aria-expanded={isExpanded}>
      <button
        type="button"
        onClick={() => setIsExpanded((expanded) => !expanded)}
        className="flex min-h-7 w-full items-center gap-1.5 rounded px-1 text-left font-mono text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-slate-800/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        style={{ paddingLeft: `${depth * 16}px` }}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${label === undefined ? containerLabel : String(label)}`}
      >
        {isExpanded ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-500" />
        )}
        {label !== undefined && (
          <span className="text-slate-500 dark:text-slate-400">{label}</span>
        )}
        <span className="text-slate-800 dark:text-slate-100">
          {containerLabel}
        </span>
      </button>

      {isExpanded && (
        <div role="group">
          {entries.map(([key, child]) => (
            <JsonTreeNode
              key={String(key)}
              value={child}
              label={key}
              depth={depth + 1}
              expandedByDefaultDepth={Math.max(0, expandedByDefaultDepth - 1)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function meta({}: Route.MetaArgs) {
  return [
    {
      title:
        'JSON Formatter & Minifier — Prettify, Compact & Validate JSON Locally',
    },
    {
      name: 'description',
      content:
        'Free local JSON formatter and minifier. Prettify, compact, validate, and convert JSON to interactive tables directly in your browser with zero server transmission.',
    },
    {
      name: 'keywords',
      content:
        'json formatter, json minifier, prettify json, format json online, validate json, offline json beautifier, json to table',
    },
    {
      tagName: 'link',
      rel: 'canonical',
      href: 'https://jsonvisualiser.com/formatter',
    },
  ]
}

export default function FormatterPage() {
  const { addDataset } = useWorkspace()
  const navigate = useNavigate()

  const [inputJson, setInputJson] = useState('')
  const [outputJson, setOutputJson] = useState('')
  const [activeMode, setActiveMode] = useState<'prettify' | 'minify'>(
    'prettify',
  )
  const [indentSize, setIndentSize] = useState<number>(2)
  const [fileName, setFileName] = useState<string>('data.json')
  const [validationError, setValidationError] =
    useState<ParseErrorDetails | null>(null)
  const [leftCopied, setLeftCopied] = useState(false)
  const [rightCopied, setRightCopied] = useState(false)
  const [isProcessingWorkspace, setIsProcessingWorkspace] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [treeExpansionDepth, setTreeExpansionDepth] = useState(1)
  const [treeRenderKey, setTreeRenderKey] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounterRef = useRef(0)

  // Auto-sync: left changes automatically reflect on right
  useEffect(() => {
    if (!inputJson.trim()) {
      setOutputJson('')
      setValidationError(null)
      return
    }
    const validation = validateJsonString(inputJson)
    if (!validation.isValid) {
      setValidationError(validation.error || { message: 'Invalid JSON' })
      return
    }
    setValidationError(null)
    try {
      if (activeMode === 'minify') {
        setOutputJson(minifyJson(inputJson))
      } else {
        setOutputJson(formatJson(inputJson, indentSize))
      }
    } catch {
      const val = validateJsonString(inputJson)
      if (!val.isValid) setValidationError(val.error || null)
    }
  }, [inputJson, indentSize, activeMode])

  // File Upload
  const handleFileUpload = (file: File) => {
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = (e.target?.result as string) || ''
      setInputJson(content)
      setValidationError(null)
    }
    reader.readAsText(file)
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounterRef.current += 1
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounterRef.current -= 1
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0
      setIsDragging(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounterRef.current = 0
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  // Prettify - formats left-side data
  const handlePrettify = () => {
    if (!inputJson.trim()) return
    try {
      const formatted = formatJson(inputJson, indentSize)
      setInputJson(formatted)
      setActiveMode('prettify')
      setValidationError(null)
    } catch {
      const val = validateJsonString(inputJson)
      if (!val.isValid && val.error) {
        setValidationError(val.error)
      }
    }
  }

  // Minify - formats left-side data
  const handleMinify = () => {
    if (!inputJson.trim()) return
    try {
      const minified = minifyJson(inputJson)
      setInputJson(minified)
      setActiveMode('minify')
      setValidationError(null)
    } catch {
      const val = validateJsonString(inputJson)
      if (!val.isValid && val.error) {
        setValidationError(val.error)
      }
    }
  }

  // Copy Left (Raw Input)
  const handleCopyLeft = async () => {
    if (!inputJson.trim()) return
    try {
      await navigator.clipboard.writeText(inputJson)
      setLeftCopied(true)
      setTimeout(() => setLeftCopied(false), 2000)
    } catch (err) {
      // ignore
    }
  }

  // Copy Right (Formatted/Minified Output)
  const handleCopyRight = async () => {
    const text = outputJson || inputJson
    if (!text.trim()) return
    try {
      await navigator.clipboard.writeText(text)
      setRightCopied(true)
      setTimeout(() => setRightCopied(false), 2000)
    } catch (err) {
      // ignore
    }
  }

  // Download Output
  const handleDownload = () => {
    const content = outputJson || inputJson
    if (!content.trim()) return
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName ? `formatted-${fileName}` : 'formatted.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Send to Workspace Table
  const handleOpenInWorkspace = async () => {
    const contentToProcess = outputJson || inputJson
    if (!contentToProcess.trim()) return

    const val = validateJsonString(contentToProcess)
    if (!val.isValid) {
      setValidationError(val.error || { message: 'Invalid JSON' })
      return
    }

    setIsProcessingWorkspace(true)
    try {
      const dataset = await processJsonToDataset(
        contentToProcess,
        fileName.trim() || 'data.json',
      )
      await addDataset(dataset)
      setIsProcessingWorkspace(false)
      navigate('/workspace/data')
    } catch (err: any) {
      setIsProcessingWorkspace(false)
      setValidationError({
        message: `Workspace conversion failed: ${err?.message || 'Unable to tabularize JSON.'}`,
        suggestion:
          'Make sure your JSON is an array of objects or structured records.',
      })
    }
  }

  // Stats
  const inputSize = new Blob([inputJson]).size
  const outputSize = new Blob([outputJson]).size
  const inputLines = inputJson ? inputJson.split('\n').length : 0
  const outputLines = outputJson ? outputJson.split('\n').length : 0
  const compressionRatio =
    inputSize > 0 && outputSize > 0
      ? Math.round(((inputSize - outputSize) / inputSize) * 100)
      : null
  const getItemCount = (json: string): number | null => {
    if (!json.trim()) return 0
    try {
      const parsed: unknown = JSON.parse(json)
      if (Array.isArray(parsed)) return parsed.length
      if (parsed !== null && typeof parsed === 'object') {
        const object = parsed as Record<string, unknown>
        const arrayKeys = Object.keys(object).filter((key) =>
          Array.isArray(object[key]),
        )
        if (arrayKeys.length === 1)
          return (object[arrayKeys[0]] as unknown[]).length
      }
      return 1
    } catch {
      return null
    }
  }
  const inputItemCount = useMemo(() => getItemCount(inputJson), [inputJson])
  const outputItemCount = useMemo(() => getItemCount(outputJson), [outputJson])
  const parsedOutput = useMemo<unknown | undefined>(() => {
    if (!outputJson.trim()) return undefined
    try {
      return JSON.parse(outputJson)
    } catch {
      return undefined
    }
  }, [outputJson])

  return (
    <div className="flex-1 flex flex-col min-h-0 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 lg:py-6 space-y-4">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.jsonl,.txt"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files[0])
          }
        }}
        className="hidden"
      />

      {/* TOP / UPPER SECTION: Action Buttons & Controls Bar */}
      <div className="p-3 rounded-xl bg-white dark:bg-[#0e1422] border border-slate-200/90 dark:border-slate-800/90 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
        {/* Left Action Buttons: Upload, Open in Workspace */}
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

        {/* Right Controls: Indent Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Indent Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
            <button
              onClick={() => {
                setIndentSize(2)
                setActiveMode('prettify')
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
                setIndentSize(4)
                setActiveMode('prettify')
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

      {/* 2 SECTIONS: SIDE-BY-SIDE SPLIT PANES - equal height, never exceed viewport */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 flex-1 min-h-0 items-stretch max-h-[calc(100dvh-180px)] lg:max-h-[calc(100dvh-200px)] overflow-hidden">
        {/* LEFT SECTION: Raw Input & File Import */}
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative flex flex-col flex-1 min-h-0 max-h-[calc(100dvh-180px)] lg:max-h-[calc(100dvh-200px)] rounded-2xl bg-white dark:bg-[#0e1422] border transition-all shadow-xs overflow-hidden ${
            isDragging
              ? 'border-emerald-500 ring-2 ring-emerald-500/30'
              : 'border-slate-200/90 dark:border-slate-800/90'
          }`}
        >
          {/* Left Pane Header */}
          <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileJson className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {fileName && (
                <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {fileName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono whitespace-nowrap">
                <span>
                  {inputItemCount === null
                    ? 'Invalid JSON'
                    : `${inputItemCount} items`}
                </span>
                <span>•</span>
                <span>{inputLines} lines</span>
                <span>•</span>
                <span>{(inputSize / 1024).toFixed(1)} KB</span>
              </div>

              <button
                onClick={handleMinify}
                disabled={!inputJson.trim()}
                className="inline-flex items-center justify-center p-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
                title="Minify JSON"
                aria-label="Minify JSON"
                aria-pressed={activeMode === 'minify'}
              >
                <Minimize2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              </button>
              <button
                onClick={handlePrettify}
                disabled={!inputJson.trim()}
                className="inline-flex items-center justify-center p-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
                title="Prettify JSON"
                aria-label="Prettify JSON"
                aria-pressed={activeMode === 'prettify'}
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              </button>
              <button
                onClick={handleCopyLeft}
                disabled={!inputJson.trim()}
                className="inline-flex items-center justify-center p-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
                title="Copy raw input JSON to clipboard"
                aria-label={
                  leftCopied ? 'Raw JSON copied' : 'Copy raw input JSON'
                }
              >
                {leftCopied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Left Textarea */}
          <div className="relative flex-1 min-h-0 overflow-hidden p-2">
            <textarea
              value={inputJson}
              onChange={(e) => {
                setInputJson(e.target.value)
                if (validationError) setValidationError(null)
              }}
              placeholder={`// 1. Paste raw JSON here, or\n// 2. Click "Upload JSON File" above, or\n// 3. Drag and drop a .json file directly into this area.\n\n{\n  "name": "JSON Visualiser",\n  "offline": true\n}`}
              spellCheck={false}
              className="w-full h-full min-h-0 p-4 font-mono text-xs sm:text-sm text-slate-900 dark:text-slate-100 bg-transparent border-0 focus:outline-none resize-none leading-relaxed selection:bg-emerald-500/20 overflow-auto"
            />
          </div>

          {/* Drag & Drop Preview Overlay - pointer-events-none prevents flicker */}
          {isDragging && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-[#0e1a22]/70 backdrop-blur-[2px] border-2 border-dashed border-emerald-500 rounded-2xl m-2 pointer-events-none">
              <CloudUpload className="w-10 h-10 text-emerald-400" />
              <p className="text-emerald-300 font-semibold text-sm tracking-wide">
                Drop your JSON file here
              </p>
            </div>
          )}
        </div>

        {/* RIGHT SECTION: Formatted / Minified Output */}
        <div className="flex flex-col flex-1 min-h-0 max-h-[calc(100dvh-180px)] lg:max-h-[calc(100dvh-200px)] rounded-2xl bg-white dark:bg-[#0e1422] border border-slate-200/90 dark:border-slate-800/90 shadow-xs overflow-hidden">
          {/* Right Pane Header */}
          <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono whitespace-nowrap">
                {compressionRatio !== null && activeMode === 'minify' && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {compressionRatio > 0 ? `-${compressionRatio}%` : '0%'}
                  </span>
                )}
                <span>
                  {outputItemCount === null
                    ? 'Invalid JSON'
                    : `${outputItemCount} items`}
                </span>
                <span>•</span>
                <span>{outputLines} lines</span>
                <span>•</span>
                <span>{(outputSize / 1024).toFixed(1)} KB</span>
              </div>

              <button
                onClick={() => {
                  setTreeExpansionDepth(Number.MAX_SAFE_INTEGER)
                  setTreeRenderKey((key) => key + 1)
                }}
                disabled={parsedOutput === undefined}
                className="inline-flex items-center justify-center p-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
                title="Expand all JSON nodes"
                aria-label="Expand all JSON nodes"
              >
                <ChevronsDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              </button>
              <button
                onClick={() => {
                  setTreeExpansionDepth(0)
                  setTreeRenderKey((key) => key + 1)
                }}
                disabled={parsedOutput === undefined}
                className="inline-flex items-center justify-center p-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
                title="Collapse all JSON nodes"
                aria-label="Collapse all JSON nodes"
              >
                <ChevronsUp className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              </button>
              <button
                onClick={handleDownload}
                disabled={!outputJson && !inputJson}
                className="inline-flex items-center justify-center p-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
                title="Download formatted JSON"
                aria-label="Download formatted JSON"
              >
                <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              </button>
              <button
                onClick={handleCopyRight}
                disabled={!outputJson && !inputJson}
                className="inline-flex items-center justify-center p-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
                title="Copy formatted output to clipboard"
                aria-label={
                  rightCopied
                    ? 'Formatted JSON copied'
                    : 'Copy formatted output JSON'
                }
              >
                {rightCopied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Right JSON Tree */}
          <div className="relative flex-1 min-h-0 overflow-auto bg-slate-50/40 p-3 dark:bg-slate-950/30">
            {parsedOutput === undefined ? (
              <p className="p-2 font-mono text-xs leading-relaxed text-slate-400">
                // Formatted JSON will appear here automatically as you type.
                <br />
                // Use Minify / Prettify on the left to toggle formatting.
              </p>
            ) : (
              <div
                role="tree"
                aria-label="Formatted JSON structure"
                className="min-w-max"
              >
                <JsonTreeNode
                  key={treeRenderKey}
                  value={parsedOutput}
                  expandedByDefaultDepth={treeExpansionDepth}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
