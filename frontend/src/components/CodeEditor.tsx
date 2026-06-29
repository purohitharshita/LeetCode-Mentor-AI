"use client";

import Editor from "@monaco-editor/react";

const LANGUAGES = [
  { label: "Python", value: "python" },
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Java", value: "java" },
  { label: "C++", value: "cpp" },
  { label: "Go", value: "go" },
];

const STARTERS: Record<string, string> = {
  python: "class Solution:\n    def solve(self):\n        pass\n",
  javascript: "/**\n * @param {number[]} nums\n * @return {number[]}\n */\nvar solve = function(nums) {\n    \n};\n",
  typescript: "function solve(): void {\n    \n}\n",
  java: "class Solution {\n    public void solve() {\n        \n    }\n}\n",
  cpp: "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solve() {\n        \n    }\n};\n",
  go: "package main\n\nfunc solve() {\n    \n}\n",
};

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
  onLanguageChange: (lang: string) => void;
}

export default function CodeEditor({
  code,
  language,
  onChange,
  onLanguageChange,
}: CodeEditorProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-[#2d2d4e] bg-[#13131f] px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/70" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
            <div className="h-3 w-3 rounded-full bg-green-500/70" />
          </div>
          <span className="text-xs text-[#4a4a6a]">solution</span>
        </div>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="rounded-lg border border-[#2d2d4e] bg-[#0d0d1a] px-2 py-1 text-xs text-[#a0a0c0] focus:border-violet-500 focus:outline-none"
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(val) => onChange(val ?? "")}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: "on",
            renderLineHighlight: "line",
            automaticLayout: true,
            tabSize: 4,
            wordWrap: "on",
            padding: { top: 12 },
          }}
        />
      </div>
    </div>
  );
}
