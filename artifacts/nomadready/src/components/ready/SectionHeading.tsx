import { CategoryIcon, type CategoryType } from "./CategoryIcon";

interface SectionHeadingProps {
  category: CategoryType;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function SectionHeading({ category, children, style }: SectionHeadingProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        ...style,
      }}
    >
      <CategoryIcon type={category} />
      <p className="section-heading" style={{ margin: 0 }}>
        {children}
      </p>
    </div>
  );
}
