import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { COLORS } from "../constants";

export function SortablePersonItem({ person, onDelete, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: person.id });
  return (
    <div ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1,
        background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12,
        padding: "12px 16px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span {...attributes} {...listeners}
          style={{ cursor: "grab", color: COLORS.textMuted, fontSize: 18, touchAction: "none", userSelect: "none", lineHeight: 1 }}>⠿</span>
        <div>
          <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{person.name}</span>
          <span style={{ fontSize: 12, color: COLORS.textMuted, marginLeft: 8 }}>{person.type}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={() => onEdit(person)}
          style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.textMuted, fontSize: 12, cursor: "pointer", padding: "4px 10px" }}>
          編集
        </button>
        <button onClick={() => onDelete(person.id)}
          style={{ background: "none", border: "none", color: COLORS.danger, fontSize: 18, cursor: "pointer", padding: "0 4px" }}>
          ×
        </button>
      </div>
    </div>
  );
}
