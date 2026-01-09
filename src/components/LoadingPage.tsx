"use client";

import { LoadingOutlined } from "@ant-design/icons";
import { Spin, Typography } from "antd";
import { useMemo } from "react";
import { getTheme } from "./ThemeProvider";

const { Text } = Typography;

export default function LoadingPage() {
  const theme = useMemo(() => getTheme(), []);
  const indicator = (
    <LoadingOutlined
      style={{
        fontSize: 70,
        color: theme === "dark" ? "white" : "var(--text)",
      }}
      spin
    />
  );

  const overlayStyle: React.CSSProperties =
    theme === "dark"
      ? {
          backgroundColor: "rgba(3, 6, 25, 1)",
          backgroundImage: `linear-gradient(
            114deg,
            rgba(1, 3, 8, 1) 0%,
            rgba(3, 6, 25, 1) 40%,
            rgba(7, 16, 47, 1) 70%,
            rgba(7, 18, 48, 1) 80%,
            rgb(13, 23, 54) 95%
          )`,
        }
      : {
          background: "var(--bg)",
          WebkitBackdropFilter: "blur(6px)",
          backdropFilter: "blur(6px)",
        };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        ...overlayStyle,
      }}
      role="status"
      aria-live="polite"
    >
      <div style={{ textAlign: "center" }}>
        <Spin indicator={indicator} />
        <div style={{ marginTop: 25 }}>
          <Text
            style={{
              color: theme === "dark" ? "white" : "var(--text)",
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            Proszę czekać, trwa ładowanie...
          </Text>
        </div>
      </div>
    </div>
  );
}
