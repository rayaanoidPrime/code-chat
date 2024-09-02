import styles from "./page.module.css";
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Stack,
} from "@mui/material";
import ErrorBox from "../components/ErrorBox";
import ListTenants from "@/components/ListTenants";

export default function Home() {
  return (
    <Box className={styles.container}>
      <Container maxWidth="md" sx={{ padding: 5 }}>
        <Stack
          spacing={4}
          alignItems="center"
          justifyContent="center"
          textAlign="center"
        >
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              color="primary"
              sx={{
                borderBottom: "2px solid gray",
                display: "inline-block",
                px: 2,
                py: 1,
              }}
            >
              Meet Code Chat
            </Typography>
          </Box>

          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              color: "black",
              fontWeight: "bold",
              maxWidth: "80%",
            }}
          >
            Easily onboard to any Codebase
          </Typography>

          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ maxWidth: "60%" }}
          >
            Collaborate with AI and build amazing things together.
          </Typography>

          <Box mt={4} width="100%">
            <TextField
              variant="outlined"
              placeholder="Enter any Github URL..."
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button variant="contained" color="primary">
                      Submit
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box width={"100%"}>
            <ErrorBox />
            <ListTenants />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
