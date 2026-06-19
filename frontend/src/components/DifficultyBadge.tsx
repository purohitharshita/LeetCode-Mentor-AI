interface DifficultyBadgeProps {
  difficulty: "easy" | "medium" | "hard";
}

const styles = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

export default function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}
