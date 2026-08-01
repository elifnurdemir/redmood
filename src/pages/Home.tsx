import { Box, Typography, Stack } from "@mui/material";
import { PeriodForm } from "../components/calendar/components/periodForm";
import { PeriodCalendar } from "../components/calendar/calendar";

const Home = () => {
  return (
    <Stack alignItems={"center"}>
      <Typography variant="h4" textAlign="center" gutterBottom>
        Regl Takip Sistemi
      </Typography>

      <Box mb={4}>
        <PeriodCalendar />
      </Box>

      <Box mb={4}>
        <PeriodForm />
      </Box>
    </Stack>
  );
};

export default Home;
