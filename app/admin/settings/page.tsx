"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type StoreSettings = {
  storeName: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  whatsapp: string;
};

const EMPTY_SETTINGS: StoreSettings = {
  storeName: "",
  bankName: "",
  accountName: "",
  accountNumber: "",
  whatsapp: "",
};

export default function AdminSettingsPage() {
  const router = useRouter();

  const [settings, setSettings] =
    useState<StoreSettings>(EMPTY_SETTINGS);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/settings",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 401 || response.status === 403) {
          router.push("/login");
          return;
        }

        throw new Error(
          data.message ||
            "Failed to load store settings."
        );
      }

      setSettings({
        storeName:
          data.settings?.storeName ?? "",

        bankName:
          data.settings?.bankName ?? "",

        accountName:
          data.settings?.accountName ?? "",

        accountNumber:
          data.settings?.accountNumber ?? "",

        whatsapp:
          data.settings?.whatsapp ?? "",
      });
    } catch (err) {
      console.error(
        "Load settings error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load store settings."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateField(
    field: keyof StoreSettings,
    value: string
  ) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!settings.storeName.trim()) {
      setError(
        "Store name is required."
      );
      return;
    }

    if (!settings.bankName.trim()) {
      setError(
        "Bank name is required."
      );
      return;
    }

    if (!settings.accountName.trim()) {
      setError(
        "Account name is required."
      );
      return;
    }

    if (!settings.accountNumber.trim()) {
      setError(
        "Account number is required."
      );
      return;
    }

    if (
      !/^\d{10}$/.test(
        settings.accountNumber.trim()
      )
    ) {
      setError(
        "Account number must contain exactly 10 digits."
      );
      return;
    }

    if (!settings.whatsapp.trim()) {
      setError(
        "WhatsApp number is required."
      );
      return;
    }

    const whatsappDigits =
      settings.whatsapp.replace(
        /[^\d]/g,
        ""
      );

    if (
      whatsappDigits.length < 10 ||
      whatsappDigits.length > 15
    ) {
      setError(
        "Please enter a valid WhatsApp number."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "/api/admin/settings",
        {
          method: "PUT",

          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            storeName:
              settings.storeName.trim(),

            bankName:
              settings.bankName.trim(),

            accountName:
              settings.accountName.trim(),

            accountNumber:
              settings.accountNumber.trim(),

            whatsapp:
              settings.whatsapp.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          router.push("/login");
          return;
        }

        throw new Error(
          data.message ||
            "Failed to save store settings."
        );
      }

      setSettings({
        storeName:
          data.settings?.storeName ??
          settings.storeName,

        bankName:
          data.settings?.bankName ??
          settings.bankName,

        accountName:
          data.settings?.accountName ??
          settings.accountName,

        accountNumber:
          data.settings?.accountNumber ??
          settings.accountNumber,

        whatsapp:
          data.settings?.whatsapp ??
          settings.whatsapp,
      });

      setSuccess(
        "Store settings saved successfully."
      );
    } catch (err) {
      console.error(
        "Save settings error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save store settings."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] px-6 py-10 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="animate-pulse">
            <div className="h-8 w-56 rounded bg-white/10" />

            <div className="mt-3 h-4 w-96 max-w-full rounded bg-white/5" />

            <div className="mt-8 h-[500px] rounded-2xl border border-white/10 bg-white/[0.03]" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() =>
                router.push("/admin")
              }
              className="mb-4 text-sm text-white/50 transition hover:text-white"
            >
              ← Back to Admin Dashboard
            </button>

            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Store Settings
            </h1>

            <p className="mt-2 text-sm text-white/50">
              Manage the information displayed
              across the Benkaso Collection
              website.
            </p>
          </div>
        </div>

        {/* ALERTS */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {success}
          </div>
        )}

        {/* SETTINGS CARD */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl sm:p-8"
        >
          {/* STORE INFORMATION */}
          <section>
            <div className="mb-6">
              <h2 className="text-lg font-medium">
                Store Information
              </h2>

              <p className="mt-1 text-sm text-white/40">
                Basic information about the
                business.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">

              {/* STORE NAME */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="storeName"
                  className="mb-2 block text-sm text-white/70"
                >
                  Store Name
                </label>

                <input
                  id="storeName"
                  type="text"
                  value={settings.storeName}
                  onChange={(event) =>
                    updateField(
                      "storeName",
                      event.target.value
                    )
                  }
                  placeholder="Benkaso Collection"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                />
              </div>

            </div>
          </section>

          {/* DIVIDER */}
          <div className="my-8 h-px bg-white/10" />

          {/* BANK INFORMATION */}
          <section>
            <div className="mb-6">
              <h2 className="text-lg font-medium">
                Bank Transfer Details
              </h2>

              <p className="mt-1 text-sm text-white/40">
                These details can be displayed
                to customers when they choose
                bank transfer.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">

              {/* BANK NAME */}
              <div>
                <label
                  htmlFor="bankName"
                  className="mb-2 block text-sm text-white/70"
                >
                  Bank Name
                </label>

                <input
                  id="bankName"
                  type="text"
                  value={settings.bankName}
                  onChange={(event) =>
                    updateField(
                      "bankName",
                      event.target.value
                    )
                  }
                  placeholder="Example: Opay"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                />
              </div>

              {/* ACCOUNT NAME */}
              <div>
                <label
                  htmlFor="accountName"
                  className="mb-2 block text-sm text-white/70"
                >
                  Account Name
                </label>

                <input
                  id="accountName"
                  type="text"
                  value={settings.accountName}
                  onChange={(event) =>
                    updateField(
                      "accountName",
                      event.target.value
                    )
                  }
                  placeholder="Benkaso Collection"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                />
              </div>

              {/* ACCOUNT NUMBER */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="accountNumber"
                  className="mb-2 block text-sm text-white/70"
                >
                  Account Number
                </label>

                <input
                  id="accountNumber"
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={settings.accountNumber}
                  onChange={(event) =>
                    updateField(
                      "accountNumber",
                      event.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  placeholder="0123456789"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm tracking-wide text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
                />

                <p className="mt-2 text-xs text-white/30">
                  Enter exactly 10 digits.
                </p>
              </div>

            </div>
          </section>

          {/* DIVIDER */}
          <div className="my-8 h-px bg-white/10" />

          {/* WHATSAPP */}
          <section>
            <div className="mb-6">
              <h2 className="text-lg font-medium">
                WhatsApp
              </h2>

              <p className="mt-1 text-sm text-white/40">
                Customers will use this number
                to contact the store.
              </p>
            </div>

            <div>
              <label
                htmlFor="whatsapp"
                className="mb-2 block text-sm text-white/70"
              >
                WhatsApp Number
              </label>

              <input
                id="whatsapp"
                type="tel"
                value={settings.whatsapp}
                onChange={(event) =>
                  updateField(
                    "whatsapp",
                    event.target.value
                  )
                }
                placeholder="+2348012345678"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/30"
              />

              <p className="mt-2 text-xs text-white/30">
                You can enter the number with or
                without +234.
              </p>
            </div>
          </section>

          {/* SAVE */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() =>
                router.push("/admin")
              }
              className="rounded-xl border border-white/10 px-5 py-3 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>
        </form>

        {/* INFORMATION */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h3 className="text-sm font-medium text-white/80">
            How this works
          </h3>

          <div className="mt-3 space-y-2 text-sm text-white/40">
            <p>
              • Bank details are stored in the
              database.
            </p>

            <p>
              • WhatsApp number is stored in the
              database.
            </p>

            <p>
              • The public website can retrieve
              the latest settings automatically.
            </p>

            <p>
              • You do not need to edit the
              website source code whenever the
              owner changes their bank or
              WhatsApp details.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}