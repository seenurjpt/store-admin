"use client";

import { useEffect } from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";

export default function AppError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Alert
      severity="error"
      action={
        <Button color="inherit" size="small" onClick={() => retry()}>
          Try again
        </Button>
      }
    >
      <AlertTitle>Something went wrong</AlertTitle>
      We couldn&apos;t load this page. This is usually temporary. Please try again.
    </Alert>
  );
}
