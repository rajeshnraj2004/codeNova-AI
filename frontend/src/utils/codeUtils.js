export const extractCodeFromResponse = (response) => {
  const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g;
  const matches = [...response.matchAll(codeBlockRegex)];
  if (matches.length > 0) {
    return matches[matches.length - 1][1].trim();
  }
  return response;
};

export const downloadCode = (code, filename = 'codenova-snippet.txt') => {
  const blob = new Blob([code], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const copyToClipboard = async (text) => {
  await navigator.clipboard.writeText(text);
};

/** mode: 'client' = browser, 'server' = backend + Piston API */
export const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', runnable: true, mode: 'client' },
  { value: 'typescript', label: 'TypeScript', runnable: true, mode: 'client' },
  { value: 'python', label: 'Python', runnable: true, mode: 'server' },
  { value: 'java', label: 'Java', runnable: true, mode: 'server' },
  { value: 'cpp', label: 'C++', runnable: true, mode: 'server' },
  { value: 'c', label: 'C', runnable: true, mode: 'server' },
  { value: 'go', label: 'Go', runnable: true, mode: 'server' },
  { value: 'rust', label: 'Rust', runnable: true, mode: 'server' },
  { value: 'ruby', label: 'Ruby', runnable: true, mode: 'server' },
  { value: 'php', label: 'PHP', runnable: true, mode: 'server' },
  { value: 'csharp', label: 'C#', runnable: true, mode: 'server' },
  { value: 'kotlin', label: 'Kotlin', runnable: true, mode: 'server' },
  { value: 'bash', label: 'Bash', runnable: true, mode: 'server' },
  { value: 'swift', label: 'Swift', runnable: true, mode: 'server' },
  { value: 'scala', label: 'Scala', runnable: true, mode: 'server' },
  { value: 'r', label: 'R', runnable: true, mode: 'server' },
  { value: 'perl', label: 'Perl', runnable: true, mode: 'server' },
  { value: 'lua', label: 'Lua', runnable: true, mode: 'server' },
  { value: 'haskell', label: 'Haskell', runnable: true, mode: 'server' },
  { value: 'html', label: 'HTML', runnable: true, mode: 'client' },
  { value: 'css', label: 'CSS', runnable: true, mode: 'client' },
  { value: 'json', label: 'JSON', runnable: true, mode: 'client' },
];

export const LANGUAGE_TEMPLATES = {
  javascript: `function greet(name) {
  console.log("Hello, " + name);
}

greet("CodeNova");`,
  typescript: `function greet(name: string): void {
  console.log("Hello, " + name);
}

greet("CodeNova");`,
  python: `def greet(name):
    print(f"Hello, {name}")

greet("CodeNova")`,
  java: `System.out.println("Hello, CodeNova");`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, CodeNova" << endl;
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    printf("Hello, CodeNova\\n");
    return 0;
}`,
  go: `package main

import "fmt"

func main() {
    fmt.Println("Hello, CodeNova")
}`,
  rust: `fn main() {
    println!("Hello, CodeNova");
}`,
  ruby: `puts "Hello, CodeNova"`,
  php: `<?php
echo "Hello, CodeNova\\n";`,
  csharp: `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, CodeNova");
    }
}`,
  kotlin: `fun main() {
    println("Hello, CodeNova")
}`,
  bash: `echo "Hello, CodeNova"`,
  swift: `print("Hello, CodeNova")`,
  scala: `object Main extends App {
  println("Hello, CodeNova")
}`,
  r: `print("Hello, CodeNova\\n")`,
  perl: `print "Hello, CodeNova\\n";`,
  lua: `print("Hello, CodeNova")`,
  haskell: `main = putStrLn "Hello, CodeNova"`,
  html: `<!DOCTYPE html>
<html>
<head><title>CodeNova</title></head>
<body>
  <h1>Hello, CodeNova</h1>
</body>
</html>`,
  css: `body {
  font-family: system-ui, sans-serif;
  background: #020617;
  color: #f8fafc;
  padding: 2rem;
}

h1 {
  color: #818cf8;
}`,
  json: `{
  "message": "Hello, CodeNova",
  "version": 1
}`,
};
