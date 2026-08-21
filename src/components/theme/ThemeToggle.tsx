"use client";

import { Button } from "antd";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Button
      onClick={toggle}
      type="default"
      shape="circle"
      size="large"
      className="btn-rounded-custom w-12 h-12 p-0 text-xl flex items-center justify-center"
      icon={
        theme === "dark" ? (
          <SunOutlined style={{ fontSize: 20 }} />
        ) : (
          <MoonOutlined style={{ fontSize: 20 }} />
        )
      }
    />
  );
}
