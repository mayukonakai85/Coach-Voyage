export const CATEGORIES = [
  {
    name: "入会特典",
    slug: "nyukai-tokuten",
    description: "DRONE QUESTIONとビジネスマインドセミナーのフル動画！",
    icon: "🎁",
  },
  {
    name: "Business doc",
    slug: "business-doc",
    description: "コーチングビジネスに必要な知識やマインドを学ぶ",
    icon: "💼",
  },
  {
    name: "Coaching doc",
    slug: "coaching-doc",
    description: "コーチとしての成長に必要なスキルやマインドを学ぶ",
    icon: "📚",
  },
  {
    name: "Short movie",
    slug: "short-movie",
    description: "コーチの疑問に答えます",
    icon: "🎬",
  },
] as const;

export type CategorySlug = typeof CATEGORIES[number]["slug"];

export function getCategoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getCategoryByName(name: string) {
  return CATEGORIES.find((c) => c.name === name);
}
