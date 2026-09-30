"use client";

import { useActionState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { login } from "@/app/actions/auth";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined);
  const errors = state?.fieldErrors;

  return (
    <Stack component="form" action={formAction} spacing={2.5} noValidate>
      {state?.error && <Alert severity="error">{state.error}</Alert>}

      <TextField
        id="email"
        name="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        autoComplete="email"
        required
        defaultValue={state?.email}
        error={!!errors?.email}
        helperText={errors?.email?.[0]}
      />

      <TextField
        id="password"
        name="password"
        type="password"
        label="Password"
        autoComplete="current-password"
        required
        error={!!errors?.password}
        helperText={errors?.password?.[0]}
      />

      <Button type="submit" variant="contained" size="large" loading={pending} sx={{ py: 1.25 }}>
        Log in
      </Button>
    </Stack>
  );
}
