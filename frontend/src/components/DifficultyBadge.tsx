interface DifficultyBadgeProps {
  difficulty: "easy" | "medium" | "hard";
}

const styles = {
  easy: "bg-green-500/20 text-green-400 border border-green-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  hard: "bg-red-500/20 text-red-400 border border-red-500/30",
};

export default function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[difficulty]}`}>
      {difficulty}
    </span>
  );
}
