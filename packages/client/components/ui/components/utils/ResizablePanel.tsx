import { JSX, createEffect, createSignal, onCleanup } from "solid-js";

import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

interface ResizablePanelProps {
  /**
   * The side where the resize handle appears
   */
  resizeFrom: "left" | "right";

  /**
   * Default width in pixels
   */
  defaultWidth: number;

  /**
   * Minimum width in pixels
   */
  minWidth?: number;

  /**
   * Maximum width in pixels
   */
  maxWidth?: number;

  /**
   * Storage key for persisting width
   */
  storageKey: string;

  /**
   * Panel content
   */
  children: JSX.Element;

  /**
   * Additional class name
   */
  class?: string;

  /**
   * Additional styles
   */
  style?: JSX.CSSProperties;
}

/**
 * A panel that can be resized by dragging a handle
 */
export function ResizablePanel(props: ResizablePanelProps) {
  const minWidth = props.minWidth ?? 200;
  const maxWidth = props.maxWidth ?? 600;

  // Load saved width from localStorage
  const savedWidth = localStorage.getItem(props.storageKey);
  const initialWidth = savedWidth
    ? Math.max(minWidth, Math.min(maxWidth, parseInt(savedWidth, 10)))
    : props.defaultWidth;

  const [width, setWidth] = createSignal(initialWidth);
  const [isResizing, setIsResizing] = createSignal(false);

  // Save width to localStorage when it changes
  createEffect(() => {
    localStorage.setItem(props.storageKey, width().toString());
  });

  function handleMouseDown(e: MouseEvent) {
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startWidth = width();

    function handleMouseMove(e: MouseEvent) {
      const delta =
        props.resizeFrom === "right" ? e.clientX - startX : startX - e.clientX;
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + delta));
      setWidth(newWidth);
    }

    function handleMouseUp() {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
  }

  onCleanup(() => {
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  });

  return (
    <Container
      class={props.class}
      style={{
        width: `${width()}px`,
        ...props.style,
      }}
    >
      {props.resizeFrom === "left" && (
        <ResizeHandle
          onMouseDown={handleMouseDown}
          class={isResizing() ? "resizing" : ""}
        />
      )}
      <div style={{ flex: 1, overflow: "hidden", "min-width": 0 }}>
        {props.children}
      </div>
      {props.resizeFrom === "right" && (
        <ResizeHandle
          onMouseDown={handleMouseDown}
          class={isResizing() ? "resizing" : ""}
        />
      )}
    </Container>
  );
}

const Container = styled("div", {
  base: {
    display: "flex",
    flexDirection: "row",
    flexShrink: 0,
    position: "relative",
  },
});

const ResizeHandle = styled("div", {
  base: {
    width: "4px",
    cursor: "ew-resize",
    flexShrink: 0,
    position: "relative",
    zIndex: 10,
    background: "color-mix(in srgb, var(--md-sys-color-outline) 20%, transparent)",
    transition: "background 0.15s ease, opacity 0.15s ease",

    "&:hover": {
      background: "var(--md-sys-color-primary)",
      opacity: 0.6,
    },

    "&.resizing": {
      background: "var(--md-sys-color-primary)",
      opacity: 0.8,
    },

    // Expand the hit area
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      bottom: 0,
      left: "-6px",
      right: "-6px",
    },
  },
});
