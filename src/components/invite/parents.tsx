import type { EventData, InvitationText } from "@/lib/types";

/** [father, mother] of the groom and of the bride, blanks removed. */
export type ParentSides = [string[], string[]];

/** The wedding parents to show, or null when it isn't a wedding or none are filled in. */
export function weddingParents(event: Pick<EventData, "type">, text: InvitationText): ParentSides | null {
  if (event.type !== "wedding") return null;
  const clean = (...names: string[]) => names.map((n) => n.trim()).filter(Boolean);
  const sides: ParentSides = [clean(text.father_a, text.mother_a), clean(text.father_b, text.mother_b)];
  return sides[0].length || sides[1].length ? sides : null;
}

/** Two columns, groom's parents on the left and bride's on the right, each under a small label. */
export function ParentsGrid({
  sides,
  labels,
  className = "",
  labelClassName = "",
  nameClassName = "",
  labelStyle,
}: {
  sides: ParentSides;
  labels: [string, string];
  className?: string;
  labelClassName?: string;
  nameClassName?: string;
  labelStyle?: React.CSSProperties;
}) {
  return (
    <div className={`grid grid-cols-2 gap-x-4 gap-y-2 text-center ${className}`}>
      {sides.map((names, i) => (
        <div key={i}>
          <p className={labelClassName} style={labelStyle}>
            {labels[i]}
          </p>
          {names.map((n, k) => (
            <p key={k} className={nameClassName}>
              {n}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
