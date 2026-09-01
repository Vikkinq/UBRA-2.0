"use client";

import { useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export default function Home() {
  const [result, setResult] = useState<string>("");

  const testConnection = async () => {
    try {
      const res = await api.get("/api/test");
      setResult(JSON.stringify(res.data, null, 2));
    } catch (err: any) {
      setResult(`Error: ${err.message}`);
    }
  };

  return (
    <main className="p-10">
      <button
        onClick={testConnection}
        className="rounded bg-black px-4 py-2 text-white hover:cursor-pointer hover:bg-gray-800"
      >
        Test Backend Connection
      </button>
      <pre className="mt-4">{result}</pre>
    </main>
  );
}
