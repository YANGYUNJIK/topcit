import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

function toClientProblem(problem: any) {
  const sortedProblemImages =
    problem.images
      ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
      .map((image: any) => image.imageUrl)
      .filter((url: string) => url && url.trim() !== "") ?? [];

  return {
    id: problem.id,
    title: problem.title,
    category: problem.category,
    type: problem.type,
    content: problem.content ?? undefined,
    imageUrl: problem.imageUrl ?? undefined,
    imageUrls:
      sortedProblemImages.length > 0
        ? sortedProblemImages
        : problem.imageUrl
          ? [problem.imageUrl]
          : [],
    choices:
      problem.choices
        ?.sort((a: any, b: any) => a.choiceNo - b.choiceNo)
        .map((choice: any) => choice.content) ?? [],
    answer: problem.answerText ?? undefined,
    explanation: problem.explanation
      ? {
          text: problem.explanation.text ?? "",
          images:
            problem.explanation.images
              ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
              .map((image: any) => image.imageUrl)
              .filter((url: string) => url && url.trim() !== "") ?? [],
        }
      : undefined,
  };
}

function shuffleArray<T>(array: T[]) {
  const copied = [...array];

  for (let i = copied.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }

  return copied;
}

function attachDisplayNumbers(problems: any[]) {
  const counters: Record<string, number> = {};

  return problems.map((problem) => {
    const category = problem.category;

    if (!counters[category]) {
      counters[category] = 1;
    } else {
      counters[category] += 1;
    }

    return {
      ...problem,
      displayNumber: counters[category],
    };
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const problems = await prisma.problem.findMany({
    where: {
      isDeleted: false,
      ...(category ? { category: category as any } : {}),
    },
    orderBy: {
      id: "asc",
    },
    include: {
      choices: true,
      images: true,
      explanation: {
        include: {
          images: true,
        },
      },
    },
  });

  const clientProblems = problems.map(toClientProblem);
  const numberedProblems = attachDisplayNumbers(clientProblems);

  return NextResponse.json(numberedProblems);
}

async function checkTeacherAuth(request: NextRequest) {
  const teacherKey = request.cookies.get("teacher-auth")?.value;
  return teacherKey === "ok";
}

export async function POST(request: NextRequest) {
  const authorized = await checkTeacherAuth(request);
  if (!authorized) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const choices = Array.isArray(body.choices)
    ? body.choices
        .map((choice: string) => choice.trim())
        .filter((choice: string) => choice !== "")
    : [];

  const explanationImages = Array.isArray(body.explanation?.images)
    ? body.explanation.images
        .map((image: string) => image.trim())
        .filter((image: string) => image !== "")
    : [];

  const questionImages = Array.isArray(body.imageUrls)
    ? body.imageUrls
        .map((image: string) => image.trim())
        .filter((image: string) => image !== "")
    : body.imageUrl?.trim()
      ? [body.imageUrl.trim()]
      : [];

  const created = await prisma.problem.create({
    data: {
      title: body.title.trim(),
      category: body.category,
      type: body.type,
      content: body.content?.trim() || null,
      imageUrl: questionImages[0] || null,
      answerText: body.answer?.trim() || null,

      images:
        questionImages.length > 0
          ? {
              create: questionImages.map((image: string, index: number) => ({
                imageUrl: image,
                sortOrder: index,
              })),
            }
          : undefined,

      choices:
        body.type === "multiple" && choices.length > 0
          ? {
              create: choices.map((choice: string, index: number) => ({
                choiceNo: index + 1,
                content: choice,
              })),
            }
          : undefined,

      explanation:
        body.explanation?.text?.trim() || explanationImages.length > 0
          ? {
              create: {
                text: body.explanation?.text?.trim() || null,
                images:
                  explanationImages.length > 0
                    ? {
                        create: explanationImages.map(
                          (image: string, index: number) => ({
                            imageUrl: image,
                            sortOrder: index,
                          }),
                        ),
                      }
                    : undefined,
              },
            }
          : undefined,
    },
    include: {
      choices: true,
      images: true,
      explanation: {
        include: {
          images: true,
        },
      },
    },
  });

  return NextResponse.json(toClientProblem(created), { status: 201 });
}
