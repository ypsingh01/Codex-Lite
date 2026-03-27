"use client";

import { useRef, useState, useCallback } from "react";

const STARTER_CODE: Record<string, string> = {
  python: 'print("Hello World")',
  javascript: 'console.log("Hello World")',
  java: `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello World");
  }
}`,
  "c++": `#include<iostream>
using namespace std;
int main() {
  cout << "Hello World";
  return 0;
}`,
};

export const LANGUAGE_OPTIONS = [
  { value: "python", label: "Python 3" },
  { value: "javascript", label: "JavaScript" },
  { value: "java", label: "Java" },
  { value: "c++", label: "C++" },
];

export type CodeEditorLanguage = keyof typeof STARTER_CODE;

export function useCodeEditor(initialLanguage: CodeEditorLanguage = "python") {
  const codeMapRef = useRef<Map<string, string>>(new Map());
  const [language, setLanguageState] = useState<CodeEditorLanguage>(initialLanguage);

  const getCodeForLanguage = useCallback((lang: string) => {
    return codeMapRef.current.get(lang) ?? STARTER_CODE[lang] ?? "";
  }, []);

  const [code, setCode] = useState<string>(() =>
    getCodeForLanguage(initialLanguage) || STARTER_CODE[initialLanguage] || ""
  );

  const setLanguage = useCallback(
    (newLang: CodeEditorLanguage) => {
      codeMapRef.current.set(language, code);
      setLanguageState(newLang);
      const nextCode = codeMapRef.current.get(newLang) ?? STARTER_CODE[newLang] ?? "";
      setCode(nextCode);
    },
    [language, code]
  );

  const handleEditorChange = useCallback((value: string | undefined) => {
    setCode(value ?? "");
  }, []);

  const setCodeFromRemote = useCallback((newCode: string, lang?: string) => {
    setCode(newCode);
    if (lang) codeMapRef.current.set(lang, newCode);
  }, []);

  return {
    code,
    language,
    setLanguage,
    handleEditorChange,
    languageOptions: LANGUAGE_OPTIONS,
    setCodeFromRemote,
    getCodeForLanguage,
  };
}
