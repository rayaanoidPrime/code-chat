import { Card, CardContent } from "@mui/joy";
import { Typography } from "@mui/material";
import styles from "../app/page.module.css";
import { GetTenants } from "@/lib/llmResponse";

const base_url =
  process.env.NODE_ENV === "production"
    ? process.env.VERCEL_URL
    : process.env.NEXT_PUBLIC_BASE_URL;

export default async function ListRepos() {
  const response = await fetch(`${base_url}/api/tenants`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const res: GetTenants = await response.json();

  return res.tenants && res.tenants.length > 0 ? (
    <div className={styles.container}>
      <Typography
        variant="subtitle1"
        color="textPrimary"
        sx={{
          mb: 2,
          fontWeight: "bolder",
          width: "fit-content",
          px: "0.5rem",
          py: "0.25rem",
        }}
      >
        Quick Chat
      </Typography>
      <div className={styles.grid}>
        {res.tenants.map((repo) => (
          <Card
            key={repo.id}
            variant="outlined"
            sx={{
              "--card-padding": "1rem",
              "&:hover": {
                boxShadow: "md",
                borderColor: "neutral.outlinedHoverBorder",
              },
            }}
          >
            <CardContent>
              <Typography>{repo.name}</Typography>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  ) : (
    <div className={styles.grid}>
      <Card
        variant="outlined"
        sx={{
          "--card-padding": "1rem",
          "&:hover": {
            boxShadow: "md",
            borderColor: "neutral.outlinedHoverBorder",
          },
        }}
      >
        <Typography>Embed some repositories...</Typography>
      </Card>
    </div>
  );
}
