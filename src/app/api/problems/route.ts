import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

function toClientProblem(problem: any) {
  return {
    id: problem.id,
    title: problem.title,
    category: problem.category,
    type: problem.type,
    content: problem.content ?? undefined,
    imageUrl: problem.imageUrl ?? undefined,
    imageUrls: problem.imageUrl ? [problem.imageUrl] : [],
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
      explanation: {
        include: {
          images: true,
        },
      },
    },
  });

  return NextResponse.json(problems.map(toClientProblem));
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

  const created = await prisma.problem.create({
    data: {
      title: body.title.trim(),
      category: body.category,
      type: body.type,
      content: body.content?.trim() || null,
      imageUrl: body.imageUrl?.trim() || null,
      answerText: body.answer?.trim() || null,
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
      explanation: {
        include: {
          images: true,
        },
      },
    },
  });

  return NextResponse.json(toClientProblem(created), { status: 201 });
}
