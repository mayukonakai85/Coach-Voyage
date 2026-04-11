const COLORS = [
  "bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500",
  "bg-pink-500", "bg-teal-500", "bg-indigo-500", "bg-rose-500",
  "bg-cyan-500", "bg-amber-500", "bg-violet-500", "bg-emerald-500",
];

export function getAvatarColor(name: string) {
  return COLORS[name.charCodeAt(0) % COLORS.length];
}

type AvatarProps = {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
};

export function Avatar({ name, avatarUrl, size = "md" }: AvatarProps) {
  const color = getAvatarColor(name);
  const sizeClass = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-14 h-14 text-xl",
    xl: "w-20 h-20 text-3xl",
  }[size];

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        loading="lazy"
        decoding="async"
        className={`${sizeClass} rounded-full object-cover shrink-0`}
      />
    );
  }

  return (
    <div className={`${sizeClass} ${color} rounded-full text-white flex items-center justify-center font-bold shrink-0 select-none`}>
      {name.charAt(0)}
    </div>
  );
}
