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
  function handleLanguageChange(lang: string) {
    onLanguageChange(lang);
    if (!code || code === STARTERS[language]) {
      onChange(STARTERS[lang] ?? "");
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <span className="text-xs text-gray-400">solution</span>
        </div>
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
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
