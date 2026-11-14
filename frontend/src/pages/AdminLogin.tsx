import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Navigate, useNavigate } from "react-router-dom";
import { Loader2, Lock, MoonStar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost, getApiErrorMessage } from "@/lib/api";
import { beginSession, useSession } from "@/lib/session";
import type { SessionUser } from "@/lib/types";

export default function AdminLogin() {
  const { data: me, isLoading } = useSession();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const login = useMutation({
    mutationFn: () =>
      apiPost<SessionUser>("/auth/login", { username: username.trim(), password }),
    onSuccess: async () => {
      await beginSession();
      navigate("/admin", { replace: true });
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#F9F8F3]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
      </div>
    );
  }
  if (me) return <Navigate to="/admin" replace />;

  return (
    <div className="flex min-h-svh bg-[#F9F8F3]">
      {/* Branded left panel */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-[#0D2E24] p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #F3CE72 1px, transparent 0)",
            backgroundSize: "26px 26px",
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A5242] text-[#F3CE72]">
            <MoonStar size={22} />
          </span>
          <span className="font-heading text-xl font-bold">Masjid Kita</span>
        </div>
        <div className="relative">
          <p dir="rtl" className="font-heading text-3xl leading-relaxed text-[#F3CE72]">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <h1 className="mt-6 font-heading text-4xl font-bold">Ahlan wa Sahlan, Takmir</h1>
          <p className="mt-4 max-w-md leading-relaxed text-[#A2BEB2]">
            Kelola ragam kegiatan, pantau pendaftar, dan perbarui progress donasi — semuanya dari
            satu panel yang amanah.
          </p>
        </div>
        <p className="relative text-xs text-[#A2BEB2]">Panel khusus takmir — data amanah terpercayai.</p>
      </div>

      {/* Credential form */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#135438] text-[#F3CE72]">
              <MoonStar size={20} />
            </span>
            <span className="font-heading text-xl font-bold text-[#0D2E24]">Masjid Kita</span>
          </div>

          <h2 className="font-heading text-2xl font-bold text-[#0D2E24]">Masuk Panel Takmir</h2>
          <p className="mt-1 text-sm text-stone-600">
            Gunakan akun takmir yang diberikan administrator masjid.
          </p>

          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              if (!username.trim() || !password) {
                setError("Username dan kata sandi wajib diisi.");
                return;
              }
              login.mutate();
            }}
            data-testid="admin-login-form"
          >
            <div className="space-y-1.5">
              <Label htmlFor="admin-username">Username</Label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <Input
                  id="admin-username"
                  data-testid="admin-username-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username takmir"
                  autoComplete="username"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-password">Kata Sandi</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <Input
                  id="admin-password"
                  data-testid="admin-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pl-9"
                />
              </div>
            </div>

            {error ? (
              <p
                data-testid="admin-login-error"
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
              >
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={login.isPending}
              data-testid="admin-login-btn"
              className="w-full"
              size="lg"
            >
              {login.isPending ? "Memeriksa…" : "Masuk"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-stone-500">
            Bukan takmir? Kembali ke{" "}
            <a href="/" className="font-semibold text-[#135438] hover:underline">
              halaman utama
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
