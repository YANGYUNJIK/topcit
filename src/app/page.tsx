"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import AnswerInput from "@/src/components/AnswerInput";
import CategorySidebar from "@/src/components/CategorySidebar";
import { Problem, ProblemCategory } from "@/src/types/problem";
import { UserCog } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type ExamMode = "category" | "mock";

function shuffleArray<T>(array: T[]) {
  const copied = [...array];

  for (let i = copied.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }

  return copied;
}

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[.,!?()[\]{}'":;~`]/g, "")
    .trim();
}

function getLevenshteinDistance(a: string, b: string): number {
  const matrix = Array.from({ length: b.length + 1 }, () =>
    Array(a.length + 1).fill(0),
  );

  for (let i = 0; i <= a.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= b.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[j][i] = matrix[j - 1][i - 1];
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i] + 1,
          matrix[j][i - 1] + 1,
          matrix[j - 1][i - 1] + 1,
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function getSimilarity(a: string, b: string): number {
  if (!a && !b) return 1;
  if (!a || !b) return 0;

  const distance = getLevenshteinDistance(a, b);
  const maxLength = Math.max(a.length, b.length);

  return 1 - distance / maxLength;
}

function isEssayCorrect(userAnswer: string, correctAnswer: string): boolean {
  const normalizedUser = normalizeText(userAnswer);

  const answerCandidates = correctAnswer
    .split("\n")
    .map((text) => text.trim())
    .filter(Boolean);

  if (!normalizedUser || answerCandidates.length === 0) {
    return false;
  }

  return answerCandidates.some((candidate) => {
    const normalizedCorrect = normalizeText(candidate);

    if (!normalizedCorrect) return false;

    if (normalizedUser === normalizedCorrect) return true;

    if (
      normalizedUser.includes(normalizedCorrect) ||
      normalizedCorrect.includes(normalizedUser)
    ) {
      return true;
    }

    const similarity = getSimilarity(normalizedUser, normalizedCorrect);
    return similarity >= 0.75;
  });
}

function normalizeCode(code: string) {
  return code.replace(/\r\n/g, "\n").replace(/\s+/g, "").trim();
}

function isCodeCorrect(userCode: string, correctCode: string): boolean {
  const normalizedUser = normalizeCode(userCode);
  const normalizedCorrect = normalizeCode(correctCode);

  if (!normalizedUser || !normalizedCorrect) {
    return false;
  }

  return normalizedUser === normalizedCorrect;
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] =
    useState<ProblemCategory | null>(null);
  const [expandedCategory, setExpandedCategory] =
    useState<ProblemCategory | null>(null);

  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [gradingResult, setGradingResult] = useState<
    "correct" | "wrong" | null
  >(null);

  const [examMode, setExamMode] = useState<ExamMode>("category");
  const [submitted, setSubmitted] = useState(false);

  const [mockResult, setMockResult] = useState<{
    score: number;
    total: number;
    correctNumbers: number[];
    wrongNumbers: number[];
    wrongByCategory: Record<string, number[]>;
  } | null>(null);

  useEffect(() => {
    if (!selectedCategory) {
      setProblems([]);
      return;
    }

    const fetchProblems = async () => {
      setLoading(true);

      try {
        const res = await fetch(`/api/problems?category=${selectedCategory}`);
        const data = await res.json();
        setProblems(data);
      } catch (error) {
        console.error("문제 조회 실패:", error);
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [selectedCategory]);

  const filteredProblems = useMemo(() => problems, [problems]);
  const currentProblem = filteredProblems[currentIndex];
  const problemImages =
    currentProblem?.imageUrls && currentProblem.imageUrls.length > 0
      ? currentProblem.imageUrls.filter((image) => image && image.trim() !== "")
      : currentProblem?.imageUrl
        ? [currentProblem.imageUrl]
        : [];

  const handleSelectCategory = (category: ProblemCategory) => {
    if (examMode === "mock" && !submitted) {
      const ok = window.confirm(
        "모의평가를 종료하고 해당 카테고리로 이동하시겠습니까?\n진행 중인 모의평가 내용은 종료됩니다.",
      );

      if (!ok) return;
    }

    setExamMode("category");
    setSubmitted(false);
    setMockResult(null);

    setSelectedCategory(category);
    setExpandedCategory(category);
    setCurrentIndex(0);
    setShowExplanation(false);
    setGradingResult(null);
  };

  const handleToggleCategory = (category: ProblemCategory) => {
    setExpandedCategory((prev) => (prev === category ? null : category));
  };

  const handleSelectProblem = (index: number) => {
    setCurrentIndex(index);
    setShowExplanation(false);
    setGradingResult(null);
  };

  const handleAnswerChange = (value: string) => {
    if (!currentProblem) return;

    setAnswers((prev) => ({
      ...prev,
      [currentProblem.id]: value,
    }));

    setGradingResult(null);
  };

  const goPrev = () => {
    if (submitted) return;

    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowExplanation(false);
      setGradingResult(null);
    }
  };

  const goNext = () => {
    if (submitted) return;

    if (currentIndex < filteredProblems.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowExplanation(false);
      setGradingResult(null);
    }
  };

  const handleGrade = () => {
    if (!currentProblem) return;

    const userAnswer = (answers[currentProblem.id] || "").trim();
    const correctAnswer = (currentProblem.answer || "").trim();

    if (currentProblem.type === "uml") {
      alert("UML 문제는 채점을 제공하지 않습니다.\n해설을 확인하세요.");
      return;
    }

    if (!userAnswer || !correctAnswer) {
      setGradingResult("wrong");
      return;
    }

    if (currentProblem.type === "essay") {
      const correct = isEssayCorrect(userAnswer, correctAnswer);
      setGradingResult(correct ? "correct" : "wrong");
      return;
    }

    if (currentProblem.type === "code") {
      const correct = isCodeCorrect(userAnswer, correctAnswer);
      setGradingResult(correct ? "correct" : "wrong");
      return;
    }

    if (userAnswer === correctAnswer) {
      setGradingResult("correct");
    } else {
      setGradingResult("wrong");
    }
  };

  const startMockExam = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/problems");
      const allProblems: Problem[] = await res.json();

      const mockAvailableProblems = allProblems.filter(
        (problem) => problem.type !== "uml",
      );

      const shuffled = shuffleArray(mockAvailableProblems);
      const selected = shuffled.slice(0, 50).map((p, i) => ({
        ...p,
        mockNumber: i + 1,
      }));

      setProblems(selected);
      setExamMode("mock");
      setSelectedCategory(null);
      setExpandedCategory(null);
      setCurrentIndex(0);
      setAnswers({});
      setShowExplanation(false);
      setGradingResult(null);
      setSubmitted(false);
      setMockResult(null);
    } catch (e) {
      console.error("모의평가 시작 실패", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMock = () => {
    const ok = window.confirm(
      "지금 제출하시겠습니까?\n제출 후 모의평가 결과가 바로 표시됩니다.",
    );

    if (!ok) return;
    const correctNumbers: number[] = [];
    const wrongNumbers: number[] = [];
    const wrongByCategory: Record<string, number[]> = {};

    let score = 0;
    let total = 0;

    problems.forEach((problem, index) => {
      const mockNumber = problem.mockNumber ?? index + 1;

      // if (problem.type !== "multiple" && problem.type !== "short") {
      //   return;
      // }

      total++;

      const userAnswer = (answers[problem.id] || "").trim();
      const correctAnswer = (problem.answer || "").trim();

      const isCorrect =
        userAnswer !== "" &&
        correctAnswer !== "" &&
        userAnswer === correctAnswer;

      if (isCorrect) {
        score++;
        correctNumbers.push(mockNumber);
      } else {
        wrongNumbers.push(mockNumber);

        const category = problem.category;
        const categoryNumber = problem.displayNumber ?? 0;

        if (!wrongByCategory[category]) {
          wrongByCategory[category] = [];
        }

        if (categoryNumber > 0) {
          wrongByCategory[category].push(categoryNumber);
        }
      }
    });

    Object.keys(wrongByCategory).forEach((c) =>
      wrongByCategory[c].sort((a, b) => a - b),
    );

    setMockResult({
      score,
      total,
      correctNumbers,
      wrongNumbers,
      wrongByCategory,
    });

    setSubmitted(true);
  };

  const handleToggleExplanation = () => {
    setShowExplanation((prev) => !prev);
  };

  const chartData = mockResult
    ? Object.entries(mockResult.wrongByCategory).map(([category, nums]) => ({
        name: category,
        wrong: nums.length,
      }))
    : [];

  const accuracyData = mockResult
    ? Object.entries(mockResult.wrongByCategory).map(
        ([category, wrongNums]) => {
          // 해당 카테고리 전체 문제 수 계산
          const totalInCategory = problems.filter(
            (p) => p.category === category,
          ).length;

          const wrongCount = wrongNums.length;
          const correctCount = totalInCategory - wrongCount;

          const accuracy =
            totalInCategory > 0
              ? Math.round((correctCount / totalInCategory) * 100)
              : 0;

          return {
            name: category,
            accuracy,
          };
        },
      )
    : [];

  const pieData = mockResult
    ? [
        { name: "정답", value: mockResult.score },
        { name: "오답", value: mockResult.total - mockResult.score },
      ]
    : [];

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => {
            window.location.href = "/teacher/login";
          }}
          className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white shadow hover:bg-gray-900"
        >
          <UserCog size={16} />
          관리자
        </button>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <CategorySidebar
          selectedCategory={selectedCategory}
          expandedCategory={expandedCategory}
          onSelectCategory={handleSelectCategory}
          onToggleCategory={handleToggleCategory}
          problems={filteredProblems}
          currentIndex={currentIndex}
          onSelectProblem={handleSelectProblem}
        />

        <section className="rounded-2xl bg-white p-6 shadow">
          {examMode === "category" && !selectedCategory ? (
            <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
              <h1 className="mb-4 text-4xl font-bold text-gray-900">
                TOPCIT CBT
              </h1>
              <p className="mb-3 text-lg text-gray-800">
                왼쪽 카테고리를 선택하면 문제를 풀 수 있습니다.
              </p>
              <p className="mb-10 text-sm text-gray-700">
                M1 ~ M7 중 원하는 영역을 선택하세요.
              </p>

              <div className="flex gap-20">
                <div className="text-center">
                  <h1 className="mb-4 text-2xl font-bold text-red-500">
                    1차 시험 일자
                  </h1>
                  <p className="text-2xl text-red-500">2026.05.16.</p>
                </div>

                <div className="text-center">
                  <h1 className="mb-4 text-2xl font-bold text-blue-600">
                    2차 시험 일자
                  </h1>
                  <p className="text-2xl text-blue-600">2026.10.10.</p>
                </div>
              </div>
              <div className="mt-8">
                <button
                  onClick={startMockExam}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
                >
                  모의평가 시작
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="flex min-h-[500px] items-center justify-center text-gray-500">
              문제를 불러오는 중...
            </div>
          ) : !currentProblem ? (
            <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
              <h1 className="mb-4 text-3xl font-bold text-gray-900">
                TOPCIT CBT
              </h1>
              <p className="mb-6 text-gray-800">
                해당 카테고리에 등록된 문제가 없습니다.
              </p>

              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setExpandedCategory(null);
                }}
                className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
              >
                ← 메인으로 돌아가기
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">TOPCIT CBT</h1>
                <p className="text-sm font-semibold text-gray-900">
                  {examMode === "mock"
                    ? `${currentProblem.mockNumber ?? currentIndex + 1} / ${problems.length}`
                    : `${currentProblem.displayNumber ?? currentIndex + 1} / ${problems.length}`}
                </p>
              </div>

              {examMode === "mock" && (
                <div className="mb-4 rounded-lg border-2 border-orange-300 bg-orange-50 px-4 py-3 text-center">
                  <p className="text-base font-bold text-orange-600">
                    {submitted
                      ? "모의평가가 종료되었습니다."
                      : "현재 모의평가를 진행 중입니다."}
                  </p>
                </div>
              )}

              <div className="mb-6">
                <p className="mb-2 text-sm font-semibold text-blue-600">
                  {examMode === "mock"
                    ? `${currentProblem.mockNumber ?? currentIndex + 1}번`
                    : `${currentProblem.displayNumber ?? currentIndex + 1}번`}
                </p>

                <h2 className="mb-2 text-xl font-semibold text-gray-700">
                  {currentProblem.title}
                </h2>

                {currentProblem.content && (
                  <p className="mb-4 whitespace-pre-line text-gray-900">
                    {currentProblem.content}
                  </p>
                )}

                {problemImages.length > 0 && (
                  <div className="mt-4 flex flex-col gap-4">
                    {problemImages.map((image, index) => (
                      <div
                        key={index}
                        className="w-full rounded-xl border bg-gray-100 p-4"
                      >
                        <Image
                          src={image}
                          alt={`${currentProblem.title} 이미지 ${index + 1}`}
                          width={1200}
                          height={900}
                          className="h-auto w-full object-contain"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <AnswerInput
                  problem={currentProblem}
                  value={answers[currentProblem.id] || ""}
                  onChange={handleAnswerChange}
                  gradingResult={gradingResult}
                />
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={submitted || currentIndex === 0}
                  className="rounded-lg bg-gray-600 px-5 py-3 text-white disabled:opacity-50"
                >
                  이전 문제
                </button>

                <div className="flex flex-wrap items-center gap-3">
                  {examMode === "category" && (
                    <>
                      {currentProblem.type !== "uml" && (
                        <button
                          type="button"
                          onClick={handleGrade}
                          className="rounded-lg bg-emerald-600 px-5 py-3 text-base font-semibold text-white"
                        >
                          채점
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleToggleExplanation}
                        className="rounded-lg bg-amber-500 px-5 py-3 text-base font-semibold text-white"
                      >
                        {currentProblem.type === "uml" ? "예시 보기" : "해설"}
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={goNext}
                    disabled={submitted || currentIndex === problems.length - 1}
                    className="rounded-lg bg-blue-600 px-5 py-3 text-white disabled:opacity-50"
                  >
                    다음 문제
                  </button>

                  {examMode === "mock" && !submitted && (
                    <button
                      onClick={handleSubmitMock}
                      className="rounded-lg bg-red-600 px-5 py-3 text-base font-semibold text-white hover:bg-red-700"
                    >
                      지금 제출하기
                    </button>
                  )}
                </div>
              </div>

              {examMode === "category" &&
                showExplanation &&
                (() => {
                  const explanationImages =
                    currentProblem.explanation?.images?.filter(
                      (image) => image && image.trim() !== "",
                    ) || [];

                  return (
                    <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4">
                      <h3 className="mb-2 text-lg font-bold text-yellow-800">
                        해설
                      </h3>

                      <p className="whitespace-pre-line text-gray-900">
                        {currentProblem.explanation?.text ||
                          "등록된 해설이 없습니다."}
                      </p>

                      {explanationImages.length > 0 && (
                        <div className="mt-4 flex flex-col gap-4">
                          {explanationImages.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`해설 이미지 ${index + 1}`}
                              className="mx-auto max-h-[600px] w-auto max-w-full rounded-lg border object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ))}
                        </div>
                      )}

                      {currentProblem.answer && (
                        <p className="mt-4 font-semibold text-gray-900">
                          정답: {currentProblem.answer}
                        </p>
                      )}
                    </div>
                  );
                })()}
            </>
          )}
          {examMode === "mock" && submitted && mockResult && (
            <>
              <div className="mt-8 rounded-xl border bg-white p-6 shadow">
                <h3 className="mb-4 text-xl font-bold text-gray-900">
                  모의평가 결과
                </h3>

                {/* 📊 그래프 영역 */}
                <div className="mt-10 grid md:grid-cols-2 gap-6">
                  {/* 📊 막대 그래프 (카테고리별 약점) */}
                  <div className="rounded-xl border bg-white p-4 shadow">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">
                      카테고리별 취약 영역
                    </h3>

                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="wrong" fill="#6b7280" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* 🥧 원형 그래프 (정답률) */}
                  <div className="rounded-xl border bg-white p-4 shadow">
                    <h3 className="mb-4 text-lg font-bold text-gray-900 text-center">
                      정답률
                    </h3>

                    <div className="h-[300px] w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            dataKey="value"
                            outerRadius={100}
                            label
                          >
                            <Cell fill="#6b7280" />
                            <Cell fill="#d1d5db" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <p className="mt-8 font-semibold text-gray-900">
                  점수: {mockResult.score} / {mockResult.total}
                </p>

                {/* <p className="mt-2 font-semibold text-gray-900">
                  맞은 문제: {mockResult.correctNumbers.join(", ") || "없음"}
                </p>

                <p className="font-semibold text-gray-900">
                  틀린 문제: {mockResult.wrongNumbers.join(", ") || "없음"}
                </p> */}

                {/* <div className="mt-4">
                  <h4 className="font-bold text-gray-900">
                    카테고리별 틀린 문제
                  </h4>

                  {Object.entries(mockResult.wrongByCategory).map(
                    ([cat, nums]) => (
                      <p key={cat} className="font-semibold text-gray-900">
                        {cat}: {nums.join(", ")}
                      </p>
                    ),
                  )}
                </div> */}

                <div className="mt-10">
                  <h3 className="mb-4 text-xl font-bold text-gray-900">
                    카테고리별 정답률
                  </h3>

                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={accuracyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) => `${value}%`} />

                        <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                          {accuracyData.map((entry, index) => {
                            let color = "#d1d5db"; // 기본 (약함)

                            if (entry.accuracy >= 80) color = "#4b5563";
                            else if (entry.accuracy >= 50) color = "#9ca3af";

                            return <Cell key={index} fill={color} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => {
                    setExamMode("category");
                    setSelectedCategory(null);
                    setExpandedCategory(null);
                    setProblems([]);
                    setAnswers({});
                    setCurrentIndex(0);
                    setShowExplanation(false);
                    setGradingResult(null);
                    setSubmitted(false);
                    setMockResult(null);
                  }}
                  className="rounded-lg bg-gray-800 px-6 py-3 text-base font-semibold text-white hover:bg-gray-900"
                >
                  모의평가 종료
                </button>
              </div>
            </>
          )}
        </section>
        <footer className="mt-10 border-t pt-6 text-center text-sm text-gray-500">
          <p className="font-semibold text-gray-700">TOPCIT CBT 학습 플랫폼</p>

          <p className="mt-2">문제 풀이 · 모의평가 · 학습 통계 제공</p>

          <div className="mt-3 flex justify-center gap-4 text-gray-400">
            <span className="cursor-pointer hover:text-gray-600">
              이용 안내
            </span>
            <span className="cursor-pointer hover:text-gray-600">
              문제 신고
            </span>
            {/* <span
              className="cursor-pointer hover:text-gray-600"
              onClick={() => (window.location.href = "/teacher/login")}
            >
              관리자
            </span> */}
          </div>

          <p className="mt-3 text-xs text-gray-400">© 2026 TOPCIT CBT</p>
        </footer>
      </div>
    </main>
  );
}
