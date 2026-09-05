"use client";

import { useEffect, useState } from "react";
import { Input, InputNumber, Modal, Select, Button } from "antd";
import {
  ASSET_CATEGORIES,
  ASSET_CATEGORY_LABELS,
  SUPPORTED_CURRENCIES,
  type CreateAssetPayload,
  type PortfolioAssetDTO,
} from "@/src/lib/portfolio/portfolio-types";
import { SearchOutlined } from "@ant-design/icons";
import { useNotify } from "../notifications/NotificationProvider";

type AssetFormModalProps = {
  open: boolean;
  loading: boolean;
  editingAsset: PortfolioAssetDTO | null;
  onConfirm: (payload: CreateAssetPayload) => void;
  onCancel: () => void;
  fxRates: Record<string, number>;
};

type FormState = {
  name: string;
  ticker: string;
  category: string;
  quantity: number | null;
  averagePrice: number | null;
  currentPrice: number | null;
  currency: string;
  customFxRate: number | null;
};

const defaultForm: FormState = {
  name: "",
  ticker: "",
  category: "STOCKS",
  quantity: null,
  averagePrice: null,
  currentPrice: null,
  currency: "PLN",
  customFxRate: null,
};

export default function AssetFormModal({
  open,
  loading,
  editingAsset,
  onConfirm,
  onCancel,
  fxRates,
}: AssetFormModalProps) {
  const notify = useNotify();

  const [form, setForm] = useState<FormState>(defaultForm);
  const [fetchingTicker, setFetchingTicker] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      if (open) {
        if (editingAsset) {
          setForm({
            name: editingAsset.name,
            ticker: editingAsset.ticker ?? "",
            category: editingAsset.category,
            quantity: editingAsset.quantity,
            averagePrice: editingAsset.averagePrice,
            currentPrice: editingAsset.currentPrice,
            currency: editingAsset.currency,
            customFxRate: editingAsset.customFxRate,
          });
        } else {
          setForm(defaultForm);
        }
      }
    });
  }, [open, editingAsset]);

  const canSubmit =
    form.name.trim().length > 0 &&
    form.quantity != null &&
    form.quantity > 0 &&
    form.averagePrice != null &&
    form.averagePrice >= 0 &&
    form.currentPrice != null &&
    form.currentPrice >= 0 &&
    form.currency.length > 0;

  const showFxRate = form.currency !== "PLN";

  const handleOk = () => {
    if (!canSubmit) return;

    onConfirm({
      name: form.name.trim(),
      ticker: form.ticker.trim() || null,
      category: form.category,
      quantity: form.quantity!,
      averagePrice: form.averagePrice!,
      currentPrice: form.currentPrice!,
      currency: form.currency,
      customFxRate: showFxRate ? form.customFxRate : null,
    });
  };

  const handleFetchTicker = async () => {
    if (!form.ticker) {
      notify.error({ title: "Błąd", description: "Wpisz najpierw Ticker." });
      return;
    }

    setFetchingTicker(true);
    try {
      const res = await fetch(
        `/api/ticker?symbol=${encodeURIComponent(form.ticker)}`,
      );
      const data = (await res.json()) as {
        price?: number;
        currency?: string;
        name?: string;
        error?: string;
      };

      if (!res.ok || !data.price) {
        throw new Error(data.error ?? "Nie udało się pobrać danych.");
      }

      const isSupportedCurrency =
        typeof data.currency === "string" &&
        (SUPPORTED_CURRENCIES as readonly string[]).includes(data.currency);

      setForm((prev) => ({
        ...prev,
        currentPrice: data.price ?? prev.currentPrice,
        currency: isSupportedCurrency ? data.currency! : "USD",
        name: prev.name || data.name || "",
      }));

      notify.success({
        title: "Pobrano cenę",
        description: `Aktualna cena: ${data.price} ${data.currency ?? ""}`,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Nie udało się pobrać danych.";
      notify.error({
        title: "Błąd",
        description: message,
      });
    } finally {
      setFetchingTicker(false);
    }
  };

  return (
    <Modal
      title={editingAsset ? "Edytuj aktywo" : "Dodaj nowe aktywo"}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText={editingAsset ? "Zapisz zmiany" : "Dodaj"}
      cancelText="Anuluj"
      okButtonProps={{ disabled: !canSubmit, loading }}
      destroyOnHidden
      width={560}
    >
      <div className="flex flex-col gap-4 py-2">
        <div className="flex flex-col gap-4 py-2">
          {/* 1. Ticker (na górze, żeby móc pobrać nazwę z giełdy) */}
          <div>
            <label className="block text-sm font-medium text-(--text) mb-1.5">
              Ticker (opcjonalnie)
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="np. AAPL, VOO"
                maxLength={20}
                value={form.ticker}
                onChange={(e) =>
                  setForm({ ...form, ticker: e.target.value.toUpperCase() })
                }
                size="large"
                onPressEnter={handleFetchTicker}
              />
              <Button
                onClick={handleFetchTicker}
                loading={fetchingTicker}
                icon={<SearchOutlined />}
                size="large"
                title="Pobierz cenę z giełdy"
              />
            </div>
            <p className="text-xs text-(--muted) mt-1.5">
              Wpisz ticker i kliknij lupkę, aby automatycznie pobrać nazwę,
              aktualną cenę oraz walutę.
            </p>
          </div>

          {/* 2. Nazwa */}
          <div>
            <label className="block text-sm font-medium text-(--text) mb-1.5">
              Nazwa <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="np. Apple Inc., ETF SP500, Obligacje EDO"
              maxLength={120}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              size="large"
            />
          </div>

          {/* 3. Kategoria + Ilość */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-(--text) mb-1.5">
                Kategoria <span className="text-red-500">*</span>
              </label>
              <Select
                value={form.category}
                onChange={(value) => setForm({ ...form, category: value })}
                size="large"
                style={{ width: "100%" }}
                options={ASSET_CATEGORIES.map((c) => ({
                  value: c,
                  label: ASSET_CATEGORY_LABELS[c],
                }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-(--text) mb-1.5">
                Ilość sztuk <span className="text-red-500">*</span>
              </label>
              <InputNumber
                placeholder="np. 10"
                min={0}
                step={0.0001}
                value={form.quantity}
                onChange={(value) => setForm({ ...form, quantity: value })}
                size="large"
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-(--text) mb-1.5">
              Cena zakupu jednostki <span className="text-red-500">*</span>
            </label>
            <InputNumber
              placeholder="np. 150"
              min={0}
              step={0.01}
              value={form.averagePrice}
              onChange={(value) => setForm({ ...form, averagePrice: value })}
              size="large"
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-(--text) mb-1.5">
              Cena obecna <span className="text-red-500">*</span>
            </label>
            <InputNumber
              placeholder="np. 180"
              min={0}
              step={0.01}
              value={form.currentPrice}
              onChange={(value) => setForm({ ...form, currentPrice: value })}
              size="large"
              style={{ width: "100%" }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-(--text) mb-1.5">
              Waluta <span className="text-red-500">*</span>
            </label>
            <Select
              value={form.currency}
              onChange={(value) => setForm({ ...form, currency: value })}
              size="large"
              style={{ width: "100%" }}
              options={SUPPORTED_CURRENCIES.map((c) => ({
                value: c,
                label: c,
              }))}
            />
          </div>

          {showFxRate && (
            <div>
              <label className="block text-sm font-medium text-(--text) mb-1.5">
                Kurs → PLN (opcjonalnie)
              </label>
              <InputNumber
                placeholder={
                  fxRates[form.currency]
                    ? String(fxRates[form.currency].toFixed(4))
                    : "np. 4.0"
                }
                min={0}
                step={0.01}
                value={form.customFxRate}
                onChange={(value) => setForm({ ...form, customFxRate: value })}
                size="large"
                style={{ width: "100%" }}
              />
            </div>
          )}
        </div>

        {showFxRate && (
          <p className="text-xs text-(--muted)">
            {form.customFxRate
              ? "Używasz ręcznie wpisanego kursu wymiany do przeliczenia wartości na PLN."
              : `Zostaw pole puste, aby używać automatycznie aktualizowanego kursu NBP (obecnie 1 ${form.currency} = ${
                  fxRates[form.currency]?.toFixed(4) ?? "..."
                } PLN).`}
          </p>
        )}
      </div>
    </Modal>
  );
}
