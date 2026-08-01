import React from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Adb as AdbIcon } from "@mui/icons-material";

interface RedMoodAppBarProps {
  isDarkMode: boolean;
  handleThemeChange: () => void;
}

export const RedMoodAppBar: React.FC<RedMoodAppBarProps> = ({
  isDarkMode,
  handleThemeChange,
}) => {
  return (
    <AppBar position="relative" sx={{ bgcolor: "primary", mt: 0 }}>
      <Toolbar>
        <AdbIcon sx={{ mr: 1 }} />
        <Typography
          variant="h6"
          component="span"
          sx={{
            mr: 2,
            fontFamily: "monospace",
            fontWeight: 700,
            letterSpacing: ".3rem",
            color: "inherit",
          }}
        >
          RedMood
        </Typography>
        <Typography variant="subtitle1" sx={{ display: { xs: "none", sm: "block" } }}>
          Regl Takibi
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <FormControlLabel
          control={
            <Switch
              checked={isDarkMode}
              onChange={handleThemeChange}
              inputProps={{ "aria-label": "Karanlık modu aç/kapat" }}
            />
          }
          label={isDarkMode ? "Karanlık" : "Aydınlık"}
          sx={{ color: "inherit", display: { xs: "none", sm: "flex" } }}
        />
        <Switch
          checked={isDarkMode}
          onChange={handleThemeChange}
          inputProps={{ "aria-label": "Karanlık modu aç/kapat" }}
          sx={{ display: { xs: "flex", sm: "none" } }}
        />
      </Toolbar>
    </AppBar>
  );
};
