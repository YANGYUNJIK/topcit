"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import AnswerInput from "@/src/components/AnswerInput";
import CategorySidebar from "@/src/components/CategorySidebar";
import { Problem, ProblemCategory } from "@/src/types/problem";
import { UserCog } from "lucide-react";

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

  const handleSelectCategory = (category: ProblemCategory) => {
    setSelectedCategory(category);
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
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowExplanation(false);
      setGradingResult(null);
    }
  };

  const goNext = () => {
    if (currentIndex < filteredProblems.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowExplanation(false);
      setGradingResult(null);
    }
  };

  const handleGrade = () => {
    if (!currentProblem) return;

    if (currentProblem.type === "essay" || currentProblem.type === "code") {
      alert("서술형 및 코드 문제는 현재 자동 채점을 지원하지 않습니다.");
      return;
    }

    const userAnswer = (answers[currentProblem.id] || "").trim();
    const correctAnswer = (currentProblem.answer || "").trim();

    if (!userAnswer || !correctAnswer) {
      setGradingResult("wrong");
      return;
    }

    if (userAnswer === correctAnswer) {
      setGradingResult("correct");
    } else {
      setGradingResult("wrong");
    }
  };

  const handleToggleExplanation = () => {
    setShowExplanation((prev) => !prev);

    if (!showExplanation) {
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }, 50);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => {
            window.location.href = "/teacher/login";
          }}
          className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-gray-900"
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
          {!selectedCategory ? (
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
                <p className="text-sm text-gray-700">
                  {currentIndex + 1} / {filteredProblems.length}
                </p>
              </div>

              <div className="mb-6">
                <h2 className="mb-2 text-xl font-semibold text-gray-700">
                  {currentProblem.title}
                </h2>

                {currentProblem.content && (
                  <p className="mb-4 whitespace-pre-line text-gray-900">
                    {currentProblem.content}
                  </p>
                )}

                {currentProblem.imageUrl && (
                  // <div className="relative flex w-full justify-center overflow-hidden rounded-xl border bg-gray-100 p-4">
                  <div className="w-full rounded-xl border bg-gray-100 p-4">
                    <Image
                      src={currentProblem.imageUrl}
                      alt={currentProblem.title}
                      width={1200}
                      height={900}
                      className="w-full h-auto object-contain"
                      // className="mx-auto h-auto max-h-[700px] w-auto max-w-full object-contain"
                    />
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

              <div className="mb-6 flex flex-wrap justify-between gap-3">
                <button
                  onClick={goPrev}
                  disabled={currentIndex === 0}
                  className="rounded-lg bg-gray-600 px-4 py-2 text-white disabled:opacity-50"
                >
                  이전 문제
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={handleGrade}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-white"
                  >
                    채점
                  </button>

                  <button
                    onClick={handleToggleExplanation}
                    className="rounded-lg bg-amber-500 px-4 py-2 text-white"
                  >
                    해설
                  </button>

                  <button
                    onClick={goNext}
                    disabled={currentIndex === filteredProblems.length - 1}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                  >
                    다음 문제
                  </button>
                </div>
              </div>

              {showExplanation &&
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
        </section>
      </div>
    </main>
  );
}
