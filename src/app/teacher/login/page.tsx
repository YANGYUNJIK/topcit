"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TeacherLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const isLoggedIn = document.cookie.includes("teacher_auth=true");

    if (isLoggedIn) {
      router.push("/teacher");
      router.refresh();
    }
  }, [router]);

  const handleLogin = async () => {
    setError("");

    try {
      const res = await fetch("/api/teacher/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message || "로그인에 실패했습니다.");
        return;
      }

      document.cookie = "teacher_auth=true; path=/; max-age=86400";

      router.push("/teacher");
      router.refresh();
    } catch (error) {
      console.error("로그인 실패:", error);
      setError("로그인 중 오류가 발생했습니다.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-4 text-center text-2xl font-bold text-gray-600">
          로그인
        </h1>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호 입력"
          className="mb-3 w-full rounded-lg border p-3 text-gray-500"
        />

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <button
          onClick={handleLogin}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white"
        >
          들어가기
        </button>
      </div>
    </main>
  );
}
