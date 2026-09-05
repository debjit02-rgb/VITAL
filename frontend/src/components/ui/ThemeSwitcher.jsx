import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const OPTIONS = [
  { value: "light",  label: "Light",  Icon: Sun },
  { value: "system", label: "System", Icon: Monitor },
  { value: "dark",   label: "Dark",   Icon: Moon },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentOption = OPTIONS.find((o) => o.value === theme) || OPTIONS[2];
  const CurrentIcon = currentOption.Icon;

  return (
    <div ref={ref} className="relative" role="region" aria-label="Theme switcher">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={`Theme: ${currentOption.label}`}
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "36px",
          height: "36px",
          borderRadius: "var(--radius-md)",
          background: "var(--color-surface-elevated)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text-secondary)",
          cursor: "pointer",
          transition: "border-color 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--color-accent-border)";
          e.currentTarget.style.color = "var(--color-accent)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--color-border)";
          e.currentTarget.style.color = "var(--color-text-secondary)";
        }}
      >
        <CurrentIcon size={15} strokeWidth={2} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            minWidth: "140px",
            background: "var(--color-surface-elevated)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            padding: "4px",
            zIndex: 100,
          }}
        >
          {OPTIONS.map(({ value, label, Icon }) => {
            const isActive = theme === value;
            return (
              <button
                key={value}
                type="button"
                role="menuitem"
                onClick={() => { setTheme(value); setOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "7px 10px",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.8125rem",
                  fontWeight: isActive ? 600 : 400,
                  background: isActive ? "var(--color-accent-dim)" : "transparent",
                  color: isActive ? "var(--color-accent)" : "var(--color-text-secondary)",
                  transition: "background 0.12s, color 0.12s",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "var(--color-surface)";
                    e.currentTarget.style.color = "var(--color-text-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--color-text-secondary)";
                  }
                }}
              >
                <Icon size={13} strokeWidth={2} />
                <span>{label}</span>
                {isActive && (
                  <span style={{ marginLeft: "auto", width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-accent)", flexShrink: 0 }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
