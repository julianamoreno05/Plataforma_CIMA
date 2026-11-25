"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { useAuthStore } from "@/store/auth-store";

type FormValues = {
  nombre: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.nombre.trim()) errors.nombre = "Escribe tu nombre.";
  if (!values.email.trim()) errors.email = "Escribe tu correo.";
  else if (!/\S+@\S+\.\S+/.test(values.email)) errors.email = "Correo inválido.";
  if (!values.password) errors.password = "Escribe una contraseña.";
  else if (values.password.length < 6) errors.password = "Mínimo 6 caracteres.";
  if (values.confirmPassword !== values.password) errors.confirmPassword = "Las contraseñas no coinciden.";
  return errors;
}

export function RegisterForm() {
  const register = useAuthStore((state) => state.register);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [values, setValues] = useState<FormValues>({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  function update(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const result = register({
      nombre: values.nombre,
      email: values.email,
      password: values.password,
    });

    if (!result.ok) {
      setErrors({ email: "Ya existe una solicitud con este correo." });
      return;
    }

    setSubmittedEmail(values.email.trim().toLowerCase());
  }

  if (submittedEmail) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] justify-center px-8 py-10">
        <div className="w-full max-w-[640px] self-start rounded-2xl border border-line bg-white p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-soft text-teal">
            <MailIcon />
          </div>
          <h1 className="mt-4 text-2xl font-bold">Revisa tu correo para confirmar</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Simulamos el envío del correo a{" "}
            <span className="font-semibold text-foreground">{submittedEmail}</span>. Tu cuenta
            quedó en estado Pendiente. Cuando un administrador la apruebe y asigne un rol,
            podrás iniciar sesión.
          </p>
          <Link
            href="/login"
            className="mt-5 flex min-h-[48px] w-fit items-center rounded-[10px] bg-teal px-6 text-[17px] font-bold text-white no-underline hover:bg-teal-dark"
          >
            Ir a iniciar sesión
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] justify-center px-8 py-10">
      <form
        noValidate
        onSubmit={handleSubmit}
        className="flex w-full max-w-[640px] flex-col gap-[18px] self-start rounded-2xl border border-line bg-white p-8"
      >
        <div>
          <h1 className="text-[28px] font-bold">Crear cuenta</h1>
          <p className="mt-1 text-[15px] text-muted">
            Cuéntanos quién eres para mostrarte lo que te sirve.
          </p>
        </div>

        {/* Row: Nombre + Email */}
        <div className="flex flex-wrap gap-4">
          <div className="flex min-w-0 flex-1 basis-[240px] flex-col gap-1.5">
            <label htmlFor="nombre" className="text-sm font-semibold">
              Nombre completo
            </label>
            <input
              id="nombre"
              type="text"
              autoComplete="name"
              value={values.nombre}
              onChange={(e) => update("nombre", e.target.value)}
              className={inputClass(errors.nombre)}
            />
            {errors.nombre ? <FieldError>{errors.nombre}</FieldError> : null}
          </div>
          <div className="flex min-w-0 flex-1 basis-[240px] flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-semibold">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
              className={inputClass(errors.email)}
            />
            {errors.email ? <FieldError>{errors.email}</FieldError> : null}
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-semibold">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={(e) => update("password", e.target.value)}
            className={inputClass(errors.password)}
          />
          <p className="text-[13px] text-muted">Mínimo 6 caracteres.</p>
          {errors.password ? <FieldError>{errors.password}</FieldError> : null}
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-semibold">
            Confirmar contraseña
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            className={inputClass(errors.confirmPassword)}
          />
          {errors.confirmPassword ? <FieldError>{errors.confirmPassword}</FieldError> : null}
        </div>

        <button
          type="submit"
          className="flex min-h-[48px] items-center justify-center rounded-[10px] bg-teal text-[17px] font-bold text-white hover:bg-teal-dark"
        >
          Crear cuenta
        </button>

        <div className="border-t border-line pt-4 text-center text-[15px] text-muted">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-bold text-teal">
            Ingresar
          </Link>
        </div>
      </form>
    </main>
  );
}

function inputClass(error?: string) {
  return `min-h-[48px] w-full rounded-[10px] border ${
    error ? "border-red-600" : "border-[#7B8794]"
  } bg-white px-3.5 text-base text-foreground outline-none focus:border-teal focus:ring-2 focus:ring-teal/20`;
}

function FieldError({ children }: { children: string }) {
  return <p className="text-sm text-red-700">{children}</p>;
}

function MailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6.5h16v11H4v-11Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="m4.5 7 7.5 6 7.5-6" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
