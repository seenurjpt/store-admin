"use client";

import { useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import { tint } from "@/lib/tint";

// Catches errors outside the app shell, e.g. when the database is unreachable while loading the session.
export default function RootError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Box component="main" sx={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", p: 3 }}>
      <div>
        <Box
          aria-hidden="true"
          sx={{ width: 56, height: 56, mx: "auto", mb: 2, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: tint("error"), color: "error.main" }}
        >
          <ErrorOutlineOutlinedIcon />
        </Box>
        <Typography variant="h5" component="h1">
          Something went wrong
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          The service is temporarily unavailable. Please try again in a moment.
        </Typography>
        <Button variant="contained" onClick={() => retry()} sx={{ mt: 3 }}>
          Try again
        </Button>
      </div>
    </Box>
  );
}
