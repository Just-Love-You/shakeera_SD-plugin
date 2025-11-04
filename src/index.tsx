import {
  ButtonItem,
  PanelSection,
  PanelSectionRow,
  staticClasses,
} from "@decky/ui";
import { definePlugin } from "@decky/api";
import { useState, useEffect } from "react";
import { FaAlignCenter } from "react-icons/fa";

const DOT_ID = "shakeera-center-circle";

function _getTopDocument(): Document {
  try {
    if (window && window.top && window.top.document) return window.top.document;
  } catch (e) { }
  return document;
}

function createCenterCircle() {
  const topDoc = _getTopDocument();
  if (!topDoc) return;
  if (topDoc.getElementById(DOT_ID)) return;

  const el = topDoc.createElement("div");
  el.id = DOT_ID;

  Object.assign(el.style, {
    position: "fixed",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "120px",
    height: "120px",
    border: "8px solid rgba(0,123,255,1)",
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: (2147483647).toString(),
    boxSizing: "border-box",
    background: "transparent",
    display: "block",
    visibility: "visible",
    transition: "box-shadow 180ms linear, transform 120ms linear, opacity 180ms linear",
    opacity: "1",
    mixBlendMode: "screen"
  } as Partial<CSSStyleDeclaration>);

  try {
    if ((el as any).animate) {
      (el as any).animate(
        [
          {
            boxShadow: "0 0 6px rgba(0,123,255,0.35)",
            transform: "translate(-50%, -50%) scale(0.98)"
          },
          {
            boxShadow: "0 0 20px rgba(0,123,255,0.75)",
            transform: "translate(-50%, -50%) scale(1.03)"
          },
          {
            boxShadow: "0 0 6px rgba(0,123,255,0.35)",
            transform: "translate(-50%, -50%) scale(0.98)"
          }
        ],
        { duration: 1200, iterations: Infinity }
      );
    }
  } catch (e) { }

  const appendTarget = topDoc.body || topDoc.documentElement || topDoc;
  appendTarget.appendChild(el);

  setTimeout(() => {
    try {
      if (!topDoc.getElementById(DOT_ID)) {
        appendTarget.appendChild(el);
      }
    } catch (e) { }
  }, 300);
}

function removeCenterCircle() {
  try {
    const topDoc = _getTopDocument();
    const el = topDoc && topDoc.getElementById(DOT_ID);
    if (el && el.parentNode) el.parentNode.removeChild(el);
  } catch (e) { }
}

function Content() {
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState("Off");

  useEffect(() => {
    if (enabled) {
      createCenterCircle();
      setStatus("On");
    } else {
      removeCenterCircle();
      setStatus("Off");
    }
    return () => {
      removeCenterCircle();
    };
  }, [enabled]);

  const onTurnOn = () => setEnabled(true);
  const onTurnOff = () => setEnabled(false);
  const onToggle = () => setEnabled((v) => !v);

  return (
    <PanelSection title="Shakeera Plugin Menu">
      <PanelSectionRow>
        <div>Options</div>
      </PanelSectionRow>

      <PanelSectionRow>
        <ButtonItem layout="below" onClick={onTurnOn}>
          Turn ON
        </ButtonItem>
      </PanelSectionRow>

      <PanelSectionRow>
        <ButtonItem layout="below" onClick={onTurnOff}>
          Turn OFF
        </ButtonItem>
      </PanelSectionRow>

      <PanelSectionRow>
        <ButtonItem layout="below" onClick={onToggle}>
          Toggle
        </ButtonItem>
      </PanelSectionRow>

      <PanelSectionRow>
        <div>Current status: {status}</div>
      </PanelSectionRow>
    </PanelSection>
  );
}

export default definePlugin(() => ({
  name: "Shakeera Center",
  titleView: <div className={staticClasses.Title}>Shakeera Center</div>,
  content: <Content />,
  icon: <FaAlignCenter />,
}));