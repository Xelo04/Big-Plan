"use client";

import { useState } from "react";
import ProfilePicture from "./ProfilePicture";
import { Card, Typography, Divider, Button } from "antd";
import {
  UserOutlined,
  MailOutlined,
  CalendarOutlined,
  TagOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { User } from "@/src/lib/auth/auth";
import ChangePasswordForm from "./ChangePasswordForm";
import SignOutEverywhereButton from "./SignOutEverywhereButton";
import DeleteAccountButton from "./DeleteAccountButton";

const { Title, Text } = Typography;

export default function Profile({ user }: { user: User }) {
  const planKey = (user.subscriptionPlan || "free").toString().toLowerCase();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  return (
    <main
      className="flex w-full items-center justify-center gap-6 p-3 sm:gap-12 sm:p-6"
      style={{ color: "var(--text)" }}
    >
      <section className="w-full max-w-225">
        <Card
          style={{
            borderRadius: 12,
            background: "var(--card-background, var(--bg))",
            boxShadow: "var(--card-shadow, 0 10px 30px rgba(2,6,23,0.06))",
            border: "var(--card-border, 1px solid rgba(0,0,0,0.06))",
            WebkitBackdropFilter: "var(--card-backdrop-filter, none)",
            backdropFilter: "var(--card-backdrop-filter, none)",
          }}
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:gap-6">
            <ProfilePicture user={user} />

            <div className="min-w-0 flex-1">
              <div
                style={{
                  marginBottom: 8,
                }}
              >
                <div>
                  <Title level={3} style={{ margin: 0, color: "var(--text)" }}>
                    {user.name}
                  </Title>
                </div>
              </div>

              <Divider style={{ margin: "12px 0 18px" }} />

              <div
                className="grid grid-cols-1 gap-5 sm:grid-cols-2"
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <UserOutlined style={{ color: "var(--icon-muted)" }} />
                    <Text style={{ color: "var(--text)", opacity: 0.7 }}>
                      Nazwa
                    </Text>
                  </div>
                  <Text
                    style={{
                      fontWeight: 700,
                      color: "var(--text)",
                      fontSize: 16,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {user.name}
                  </Text>
                </div>

                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <MailOutlined style={{ color: "var(--icon-muted)" }} />
                    <Text style={{ color: "var(--text)", opacity: 0.7 }}>
                      Email
                    </Text>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Text
                      style={{
                        fontWeight: 700,
                        color: "var(--text)",
                        fontSize: 16,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {user.email}
                    </Text>
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <CalendarOutlined style={{ color: "var(--icon-muted)" }} />
                    <Text style={{ color: "var(--text)", opacity: 0.7 }}>
                      Data założenia konta
                    </Text>
                  </div>
                  <Text
                    style={{
                      fontWeight: 700,
                      color: "var(--text)",
                      fontSize: 16,
                    }}
                  >
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Text>
                </div>

                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <TagOutlined style={{ color: "var(--icon-muted)" }} />
                    <Text style={{ color: "var(--text)", opacity: 0.7 }}>
                      Subskrypcja
                    </Text>
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      padding: "6px 12px",
                      borderRadius: 8,
                      background: `var(--sub-${planKey}, var(--success))`,
                      color: "var(--text)",
                      fontWeight: 700,
                      boxShadow: `0 7px 10px color-mix(in srgb, var(--sub-${planKey}, var(--success)) 28%, transparent)`,
                      transition: "box-shadow 200ms ease, transform 120ms ease",
                      willChange: "box-shadow, transform",
                    }}
                  >
                    {user.subscriptionPlan}
                  </div>
                </div>
              </div>

              <Divider style={{ margin: "24px 0 18px" }} />

              {/* Dół karty z akcjami */}
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
                <Button
                  type="default"
                  size="large"
                  icon={<KeyOutlined />}
                  onClick={() => setPasswordModalOpen(true)}
                >
                  <span className="whitespace-normal">Zmień hasło</span>
                </Button>

                <SignOutEverywhereButton />

                <DeleteAccountButton />
              </div>
            </div>
          </div>
        </Card>
      </section>

      <ChangePasswordForm
        open={passwordModalOpen}
        onCancel={() => setPasswordModalOpen(false)}
      />
    </main>
  );
}
