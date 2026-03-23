import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

async function checkTeacherAuth(request: NextRequest) {
  const teacherKey = request.cookies.get("teacher-auth")?.value;
  return teacherKey === "ok";
}

function toClientProblem(problem: any) {
  return {
    id: problem.id,
    title: problem.title,
    category: problem.category,
    type: problem.type,
    content: problem.content ?? undefined,
    imageUrl: problem.imageUrl ?? undefined,
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

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authorized = await checkTeacherAuth(request);

  if (!authorized) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const problemId = Number(id);
  const body = await request.json();

  const title = body.title?.trim();
  const content = body.content?.trim() || null;
  const imageUrl = body.imageUrl?.trim() || null;
  const answer = body.answer?.trim() || null;

  if (!title) {
    return NextResponse.json(
      { message: "문제 제목은 필수입니다." },
      { status: 400 },
    );
  }

  const choices = Array.isArray(body.choices)
    ? body.choices.map((choice: string) => choice.trim())
    : [];

  if (body.type === "multiple" && choices.length !== 4) {
    return NextResponse.json(
      { message: "객관식 보기는 정확히 4개여야 합니다." },
      { status: 400 },
    );
  }

  const explanationText = body.explanation?.text?.trim() || null;
  const explanationImages = Array.isArray(body.explanation?.images)
    ? body.explanation.images
        .map((image: string) => image.trim())
        .filter((image: string) => image !== "")
    : [];

  await prisma.problemChoice.deleteMany({
    where: { problemId },
  });

  const existingExplanation = await prisma.problemExplanation.findUnique({
    where: { problemId },
  });

  if (existingExplanation) {
    await prisma.problemExplanationImage.deleteMany({
      where: { explanationId: existingExplanation.id },
    });

    await prisma.problemExplanation.delete({
      where: { problemId },
    });
  }

  const updated = await prisma.problem.update({
    where: { id: problemId },
    data: {
      title,
      category: body.category,
      type: body.type,
      content,
      imageUrl,
      answerText: answer,
      choices:
        body.type === "multiple"
          ? {
              create: choices.map((choice: string, index: number) => ({
                choiceNo: index + 1,
                content: choice,
              })),
            }
          : undefined,
      explanation:
        explanationText || explanationImages.length > 0
          ? {
              create: {
                text: explanationText,
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

  return NextResponse.json(toClientProblem(updated));
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const authorized = await checkTeacherAuth(request);

  if (!authorized) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const problemId = Number(id);

  await prisma.problem.update({
    where: { id: problemId },
    data: {
      isDeleted: true,
    },
  });

  return NextResponse.json({ success: true });
}
