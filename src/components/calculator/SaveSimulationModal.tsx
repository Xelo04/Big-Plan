"use client";

import { useState } from "react";
import { Modal, Input } from "antd";

type SaveSimulationModalProps = {
  open: boolean;
  loading: boolean;
  onConfirm: (name: string) => void;
  onCancel: () => void;
};

const MAX_NAME_LENGTH = 80;

export default function SaveSimulationModal({
  open,
  loading,
  onConfirm,
  onCancel,
}: SaveSimulationModalProps) {
  const [name, setName] = useState("");

  const trimmed = name.trim();
  const canSubmit = trimmed.length > 0 && trimmed.length <= MAX_NAME_LENGTH;

  const handleOk = () => {
    if (canSubmit) {
      onConfirm(trimmed);
    }
  };

  const handleAfterClose = () => {
    setName("");
  };

  return (
    <Modal
      title="Zapisz symulację"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      afterClose={handleAfterClose}
      okText="Zapisz"
      cancelText="Anuluj"
      okButtonProps={{ disabled: !canSubmit, loading }}
      destroyOnHidden
      width={480}
    >
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-(--text)">
          Nazwa symulacji
        </label>
        <Input
          placeholder="np. Plan emerytalny 2026"
          maxLength={MAX_NAME_LENGTH}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onPressEnter={handleOk}
          showCount
          autoFocus
          size="large"
        />
        <p className="text-xs text-(--icon-muted) mt-1">
          Nadaj nazwę, która pomoże Ci później rozpoznać tę symulację.
        </p>
      </div>
    </Modal>
  );
}
