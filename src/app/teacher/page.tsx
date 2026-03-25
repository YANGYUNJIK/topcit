"use client";

import { useEffect, useState } from "react";
import { Problem, ProblemCategory, ProblemType } from "@/src/types/problem";

const categories: { key: ProblemCategory; label: string }[] = [
  { key: "M1", label: "M1. 소프트웨어 개발" },
  { key: "M2", label: "M2. 데이터 관리" },
  { key: "M3", label: "M3. 시스템 아키텍처와 정보보안" },
  { key: "M4", label: "M4. IT 비즈니스" },
  { key: "M5", label: "M5. IT비즈니스와 윤리" },
  { key: "M6", label: "M6. TC와 PM" },
  { key: "M7", label: "M7. 통합역량" },
];

const types: { key: ProblemType; label: string }[] = [
  { key: "multiple", label: "객관식" },
  { key: "short", label: "단답형" },
  { key: "essay", label: "서술형" },
  { key: "code", label: "코드 작성" },
];

export default function TeacherPage() {
  const [savedProblems, setSavedProblems] = useState<Problem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ProblemCategory>("M1");
  const [type, setType] = useState<ProblemType>("multiple");
  const [questionText, setQuestionText] = useState("");
  // const [questionImageUrl, setQuestionImageUrl] = useState("");
  const [questionImages, setQuestionImages] = useState<string[]>([""]);
  const [choices, setChoices] = useState(["", "", "", ""]);
  const [answer, setAnswer] = useState("");
  const [explanationText, setExplanationText] = useState("");
  const [explanationImages, setExplanationImages] = useState([""]);
  const [loading, setLoading] = useState(false);

  const handleQuestionImageChange = (index: number, value: string) => {
    setQuestionImages((prev) =>
      prev.map((item, i) => (i === index ? value : item)),
    );
  };

  const addQuestionImageInput = () => {
    setQuestionImages((prev) => [...prev, ""]);
  };

  const removeQuestionImageInput = (index: number) => {
    setQuestionImages((prev) => {
      if (prev.length <= 1) return [""];
      return prev.filter((_, i) => i !== index);
    });
  };

  const [filterCategory, setFilterCategory] = useState<ProblemCategory | "ALL">(
    "ALL",
  );
  const [searchTitle, setSearchTitle] = useState("");

  const filteredProblems = savedProblems.filter((problem) => {
    const matchesCategory =
      filterCategory === "ALL" || problem.category === filterCategory;

    const matchesTitle = problem.title
      .toLowerCase()
      .includes(searchTitle.toLowerCase().trim());

    return matchesCategory && matchesTitle;
  });

  const fetchProblems = async () => {
    try {
      const res = await fetch("/api/problems");
      const data = await res.json();
      setSavedProblems(data);
    } catch (error) {
      console.error("문제 목록 조회 실패:", error);
      setSavedProblems([]);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    const isLoggedIn = document.cookie.includes("teacher_auth=true");

    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      window.location.href = "/teacher/login";
    }
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setCategory("M1");
    setType("multiple");
    setQuestionText("");
    // setQuestionImageUrl("");
    setQuestionImages([""]);
    setChoices(["", "", "", ""]);
    setAnswer("");
    setExplanationText("");
    setExplanationImages([""]);
  };

  const handleChoiceChange = (index: number, value: string) => {
    setChoices((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const handleExplanationImageChange = (index: number, value: string) => {
    setExplanationImages((prev) =>
      prev.map((item, i) => (i === index ? value : item)),
    );
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || "업로드 실패");
    }

    return res.json();
  };

  const addChoiceInput = () => {
    setChoices((prev) => [...prev, ""]);
  };

  const removeChoiceInput = (index: number) => {
    setChoices((prev) => {
      if (prev.length <= 2) {
        alert("객관식은 최소 2개의 보기가 필요합니다.");
        return prev;
      }

      return prev.filter((_, i) => i !== index);
    });
  };

  const addExplanationImageInput = () => {
    setExplanationImages((prev) => [...prev, ""]);
  };

  const removeExplanationImageInput = (index: number) => {
    setExplanationImages((prev) => {
      if (prev.length <= 1) {
        return [""];
      }

      return prev.filter((_, i) => i !== index);
    });
  };

  // const buildPayload = () => {
  //   const trimmedChoices = choices.map((choice) => choice.trim());

  //   const firstQuestionImage =
  //     questionImages.find((image) => image.trim() !== "")?.trim() || "";

  //   const filteredExplanationImages = explanationImages
  //     .map((image) => image.trim())
  //     .filter((image) => image !== "");

  //   return {
  //     title: title.trim(),
  //     category,
  //     type,
  //     content: questionText.trim() || undefined,
  //     imageUrl: firstQuestionImage || undefined,
  //     choices: type === "multiple" ? trimmedChoices : undefined,
  //     answer: answer.trim() || undefined,
  //     explanation:
  //       explanationText.trim() || filteredExplanationImages.length > 0
  //         ? {
  //             text: explanationText.trim(),
  //             images: filteredExplanationImages,
  //           }
  //         : undefined,
  //   };
  // };

  const buildPayload = () => {
    const trimmedChoices = choices.map((choice) => choice.trim());

    const filteredQuestionImages = questionImages
      .map((image) => image.trim())
      .filter((image) => image !== "");

    const filteredExplanationImages = explanationImages
      .map((image) => image.trim())
      .filter((image) => image !== "");

    return {
      title: title.trim(),
      category,
      type,
      content: questionText.trim() || undefined,
      imageUrl: filteredQuestionImages[0] || undefined, // 기존 호환 유지
      imageUrls: filteredQuestionImages, // 새 배열 추가
      choices: type === "multiple" ? trimmedChoices : undefined,
      answer: answer.trim() || undefined,
      explanation:
        explanationText.trim() || filteredExplanationImages.length > 0
          ? {
              text: explanationText.trim(),
              images: filteredExplanationImages,
            }
          : undefined,
    };
  };

  const validateForm = () => {
    if (!title.trim()) {
      alert("문제 제목을 입력해주세요.");
      return false;
    }

    if (type === "multiple") {
      const trimmedChoices = choices.map((choice) => choice.trim());
      const hasEmptyChoice = trimmedChoices.some((choice) => choice === "");

      if (hasEmptyChoice) {
        alert("객관식 보기는 4개 모두 입력해주세요.");
        return false;
      }
    }

    return true;
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = buildPayload();

      const res = await fetch(`/api/problems/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);

        if (res.status === 401) {
          alert(
            "로그인이 만료되었거나 인증되지 않았습니다. 다시 로그인해주세요.",
          );
          window.location.href = "/teacher/login";
          return;
        }

        alert(errorData?.message || "문제 수정에 실패했습니다.");
        return;
      }

      alert("문제가 수정되었습니다.");
      resetForm();
      await fetchProblems();
    } catch (error) {
      console.error("문제 수정 실패:", error);
      alert("문제 수정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const filteredChoices = choices
      .map((choice) => choice.trim())
      .filter((choice) => choice !== "");

    const filteredExplanationImages = explanationImages
      .map((image) => image.trim())
      .filter((image) => image !== "");

    if (!title.trim()) {
      alert("문제 제목을 입력해주세요.");
      return;
    }

    if (type === "multiple" && filteredChoices.length < 2) {
      alert("객관식은 최소 2개 이상의 보기가 필요합니다.");
      return;
    }

    setLoading(true);

    try {
      if (!validateForm()) return;
      const payload = buildPayload();

      const res = await fetch("/api/problems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // body: JSON.stringify(problem),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);

        if (res.status === 401) {
          alert(
            "로그인이 만료되었거나 인증되지 않았습니다. 다시 로그인해주세요.",
          );
          window.location.href = "/teacher/login";
          return;
        }

        alert(errorData?.message || "문제 저장에 실패했습니다.");
        return;
      }

      alert("문제가 저장되었습니다.");
      resetForm();
      await fetchProblems();
    } catch (error) {
      console.error("문제 저장 실패:", error);
      alert("문제 저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (problem: Problem) => {
    setEditingId(problem.id);
    setTitle(problem.title);
    setCategory(problem.category);
    setType(problem.type);
    setQuestionText(problem.content || "");
    // setQuestionImageUrl(problem.imageUrl || "");
    // problem.imageUrl ? [problem.imageUrl] : [""];
    setQuestionImages(
      problem.imageUrls && problem.imageUrls.length > 0
        ? problem.imageUrls
        : problem.imageUrl
          ? [problem.imageUrl]
          : [""],
    );
    setChoices(
      problem.type === "multiple"
        ? [
            problem.choices?.[0] || "",
            problem.choices?.[1] || "",
            problem.choices?.[2] || "",
            problem.choices?.[3] || "",
          ]
        : ["", "", "", ""],
    );
    setAnswer(problem.answer || "");
    setExplanationText(problem.explanation?.text || "");
    setExplanationImages(
      problem.explanation?.images && problem.explanation.images.length > 0
        ? problem.explanation.images
        : [""],
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (problemId: number) => {
    const ok = window.confirm("이 문제를 삭제하시겠습니까?");
    if (!ok) return;

    try {
      const res = await fetch(`/api/problems/${problemId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);

        if (res.status === 401) {
          alert(
            "로그인이 만료되었거나 인증되지 않았습니다. 다시 로그인해주세요.",
          );
          window.location.href = "/teacher/login";
          return;
        }

        alert(errorData?.message || "문제 삭제에 실패했습니다.");
        return;
      }

      await fetchProblems();
    } catch (error) {
      console.error("문제 삭제 실패:", error);
      alert("문제 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-gray-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-2xl bg-white p-6 shadow">
          {/* <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              문제 관리 페이지
            </h1>

            <button
              onClick={() => {
                window.location.href = "/";
              }}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-100"
            >
              ← 메인으로
            </button>

            {editingId && (
              <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800">
                수정 모드
              </span>
            )}
          </div> */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              문제 관리 페이지
            </h1>

            <div className="flex items-center gap-3">
              {editingId && (
                <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800">
                  수정 모드
                </span>
              )}

              <button
                type="button"
                onClick={() => (window.location.href = "/")}
                className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-lg font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
              >
                ← 메인으로
              </button>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-semibold text-gray-900">
                문제 제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-500"
                placeholder="예: M1 - 1번 문제"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-gray-900">
                카테고리
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProblemCategory)}
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
              >
                {categories.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-6">
            <label className="mb-2 block font-semibold text-gray-900">
              문제 유형
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ProblemType)}
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
            >
              {types.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-6">
            <label className="mb-2 block font-semibold text-gray-900">
              문제 본문
            </label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-500"
              placeholder="문제 내용을 입력하세요."
            />
          </div>
          <div className="mt-6">
            {/* <label className="mb-2 block font-semibold text-gray-900">
              문제 이미지 URL
            </label> */}
            <div className="mt-3">
              <div className="mt-6">
                <div className="space-y-3">
                  {questionImages.map((image, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <label
                          htmlFor={`question-image-upload-${index}`}
                          className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                          문제 이미지 등록
                        </label>

                        <input
                          id={`question-image-upload-${index}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            try {
                              setLoading(true);
                              const data = await uploadImage(file);
                              handleQuestionImageChange(index, data.url);
                            } catch (error) {
                              console.error(error);
                              alert("문제 이미지 업로드에 실패했습니다.");
                            } finally {
                              setLoading(false);
                            }
                          }}
                        />

                        {image ? (
                          <img
                            src={image}
                            alt={`문제 이미지 ${index + 1}`}
                            className="h-20 rounded-lg border object-contain"
                          />
                        ) : (
                          <span className="text-sm text-gray-500">
                            선택된 파일 없음
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeQuestionImageInput(index)}
                        className="rounded-lg bg-red-500 px-3 py-2 text-white"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addQuestionImageInput}
                  className="mt-3 rounded-lg bg-gray-200 px-4 py-2"
                >
                  문제 이미지 추가
                </button>
              </div>
            </div>
          </div>
          {type === "multiple" && (
            <div className="mt-6">
              <label className="mb-2 block font-semibold text-gray-900">
                보기 입력
              </label>

              <div className="space-y-3">
                {choices.map((choice, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={choice}
                      onChange={(e) =>
                        handleChoiceChange(index, e.target.value)
                      }
                      className="flex-1 rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-500"
                      placeholder={`보기 ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-6">
            <label className="mb-2 block font-semibold text-gray-900">
              정답
            </label>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-500"
              placeholder={
                type === "multiple"
                  ? "예: 1 또는 보기 내용"
                  : "정답을 입력하세요"
              }
            />
          </div>
          <div className="mt-6">
            <label className="mb-2 block font-semibold text-gray-900">
              해설
            </label>
            <textarea
              value={explanationText}
              onChange={(e) => setExplanationText(e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-500"
              placeholder="해설 내용을 입력하세요. 비워도 됩니다."
            />
          </div>
          <div className="mt-6">
            {/* <label className="mb-2 block font-semibold text-gray-900">
              해설 이미지 URL
            </label> */}

            <div className="space-y-3">
              {explanationImages.map((image, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <label
                        htmlFor={`explanation-image-upload-${index}`}
                        className="cursor-pointer rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                      >
                        해설 이미지 등록
                      </label>

                      <input
                        id={`explanation-image-upload-${index}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          try {
                            setLoading(true);
                            const data = await uploadImage(file);
                            handleExplanationImageChange(index, data.url);
                          } catch (error) {
                            console.error(error);
                            alert("해설 이미지 업로드에 실패했습니다.");
                          } finally {
                            setLoading(false);
                          }
                        }}
                      />
                      <span className="text-sm text-gray-700">
                        {/* {image ? "업로드 완료" : "선택된 파일 없음"} */}
                        {image ? (
                          <img
                            src={image}
                            alt={`해설 이미지 미리보기 ${index + 1}`}
                            className="h-20 rounded-lg border border-gray-300 object-contain"
                          />
                        ) : (
                          <span className="text-sm text-gray-700">
                            선택된 파일 없음
                          </span>
                        )}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExplanationImageInput(index)}
                      className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addExplanationImageInput}
              className="mt-3 rounded-lg bg-gray-200 px-4 py-2 text-gray-900 hover:bg-gray-300"
            >
              해설 이미지 추가
            </button>
          </div>
          <div className="mt-8 flex gap-3">
            {editingId ? (
              <>
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="rounded-lg bg-amber-600 px-6 py-3 text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  {loading ? "수정 중..." : "문제 수정"}
                </button>

                <button
                  onClick={resetForm}
                  type="button"
                  className="rounded-lg bg-gray-300 px-6 py-3 text-gray-900 hover:bg-gray-400"
                >
                  취소
                </button>
              </>
            ) : (
              <button
                onClick={handleSave}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-3 text-white disabled:opacity-50"
              >
                {loading ? "저장 중..." : "문제 저장"}
              </button>
            )}
          </div>
        </section>
        <section className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              등록된 문제 목록
            </h2>

            <div className="grid w-full gap-3 md:w-auto md:grid-cols-[180px_260px]">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  카테고리 필터
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) =>
                    setFilterCategory(e.target.value as ProblemCategory | "ALL")
                  }
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
                >
                  <option value="ALL">전체</option>
                  {categories.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.key}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  제목 검색
                </label>
                <input
                  type="text"
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  placeholder="문제 제목 검색"
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>

          <p className="mb-4 text-sm text-gray-700">
            검색 결과 {filteredProblems.length}개 / 전체 {savedProblems.length}
            개
          </p>

          {savedProblems.length === 0 ? (
            <p className="text-gray-800">등록된 문제가 없습니다.</p>
          ) : filteredProblems.length === 0 ? (
            <p className="text-gray-800">조건에 맞는 문제가 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {filteredProblems.map((problem) => (
                <div
                  key={problem.id}
                  className="flex items-center justify-between rounded-lg border border-gray-300 p-4"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {problem.title}
                    </p>
                    <p className="text-sm text-gray-800">
                      {problem.category} / {problem.type}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(problem)}
                      className="rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
                    >
                      수정
                    </button>

                    <button
                      onClick={() => handleDelete(problem.id)}
                      className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
