"use client";

import { Modal } from "antd";
import { ExclamationCircleFilled } from "@ant-design/icons";

type EditDiscardConfirmModalProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function EditDiscardConfirmModal({
  open,
  onConfirm,
  onCancel,
}: EditDiscardConfirmModalProps) {
  return (
    <Modal
      title={
        <span className="inline-flex items-center gap-2">
          <ExclamationCircleFilled style={{ color: "#f59e0b" }} />
          Odrzucić zmiany?
        </span>
      }
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Odrzuć zmiany"
      cancelText="Wróć do edycji"
      okButtonProps={{ danger: true }}
      destroyOnHidden
      width={480}
    >
      <div className="py-2">
        <p className="text-sm text-(--text)">
          Masz niezapisane zmiany, które zostaną utracone.
        </p>
        <p className="text-xs text-(--muted) mt-3">
          Jeśli chcesz zachować zmiany, wróć do edycji i kliknij{" "}
          <strong>Zapisz zmiany</strong>.
        </p>
      </div>
    </Modal>
  );
}
