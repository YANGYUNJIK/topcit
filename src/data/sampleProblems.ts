import { Problem } from "@/src/types/problem";

export const sampleProblems: Problem[] = [
  {
    id: 1,
    title: "M1. 소프트웨어 개발 - 1번 문제",
    category: "M1",
    imageUrl: "/problems/problem-001.png",
    content:
      "다음 중 소프트웨어 개발 과정에 대한 설명으로 가장 적절한 것을 고르시오.",
    type: "multiple",
    choices: ["1", "2", "3", "4"],
    answer: "1",
    explanation: {
      text: "요구사항 분석과 구현 단계를 구분하는 것이 핵심이다. 정답은 1번이다.",
      images: ["/explanations/ex-001.png"],
    },
  },
  {
    id: 2,
    title: "M2. 데이터 관리 - 1번 문제",
    category: "M2",
    imageUrl: "/problems/problem-002.png",
    content: "데이터 중복 최소화와 이상 현상 방지를 위한 개념을 쓰시오.",
    type: "short",
    answer: "정규화",
    explanation: {
      text: "중복 최소화와 이상 현상 방지를 설명하므로 정답은 정규화이다.",
    },
  },
  {
    id: 3,
    title: "M3. 시스템 아키텍처와 정보보안 - 1번 문제",
    category: "M3",
    imageUrl: "/problems/problem-003.png",
    content: "보안 위협 대응 방안을 서술하시오.",
    type: "essay",
    answer: "모범답안 예시",
    explanation: {
      text: "서술형은 자동 채점 기준을 어떻게 둘지 아직 확정되지 않았으므로 현재는 예시 답안 중심으로 보여준다.",
    },
  },
  {
    id: 4,
    title: "M4. IT 비즈니스 - 1번 문제",
    category: "M4",
    imageUrl: "/problems/problem-004.png",
    content: "주어진 조건에 맞는 코드를 작성하시오.",
    type: "code",
    answer: "function solution() {}",
    explanation: {
      text: "코드 작성형은 띄어쓰기와 개행 처리 기준을 추후 정하면 된다.",
    },
  },
];
