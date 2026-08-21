"use client";

import { Modal } from "antd";

type EditSaveConfirmModalProps = {
  open: boolean;
  loading: boolean;
  simulationName: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function EditSaveConfirmModal({
  open,
  loading,
  simulationName,
  onConfirm,
  onCancel,
}: EditSaveConfirmModalProps) {
  return (
    <Modal
      title="Zapisać zmiany?"
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Zapisz"
      cancelText="Anuluj"
      okButtonProps={{ loading }}
      destroyOnHidden
      width={480}
    >
      <div className="py-2">
        <p className="text-sm text-(--text)">
          Twoja symulacja <strong>&quot;{simulationName}&quot;</strong> zostanie
          zaktualizowana o nowe wyniki i parametry.
        </p>
        <p className="text-xs text-(--muted) mt-3">
          Poprzednia wersja zostanie nadpisana i nie będzie można jej
          przywrócić.
        </p>
      </div>
    </Modal>
  );
}
