"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [result, setResult] = useState<string>("Loading...");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`)
      .then((res) => res.json())
      .then((data) => setResult(JSON.stringify(data)))
      .catch((err) => setResult(`Error: ${err.message}`));
  }, []);

  return (
    <div className="flex flex-1 items-center justify-center">
      <pre>{result}</pre>
    </div>
  );
}
