import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import "react-calendar/dist/Calendar.css";
import Calendar from "react-calendar";
import {
  Box,
  Stack,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Snackbar,
  useTheme,
} from "@mui/material";
import { usePeriodContext } from "../../context/PeriodContext";
import { generateCustomDates } from "../../utils/periodMath";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const MOOD_OPTIONS = [
  { emoji: "😊", label: "Mutlu" },
  { emoji: "😢", label: "Üzgün" },
  { emoji: "😡", label: "Sinirli" },
  { emoji: "😴", label: "Yorgun" },
];

export const PeriodCalendar: React.FC = () => {
  const theme = useTheme();
  const {
    latestPeriod,
    averageCycleLength,
    moods,
    addPeriodStart,
    endPeriod,
    addMood,
  } = usePeriodContext();

  const [value, onChange] = useState<Value>(new Date());
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const customDates = useMemo(() => {
    if (!latestPeriod) return [];
    return generateCustomDates(
      new Date(latestPeriod.startDate),
      latestPeriod.duration,
      averageCycleLength
    );
  }, [latestPeriod, averageCycleLength]);

  const selectedDateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const selectedMood = moods.find((m) => m.date === selectedDateKey)?.mood;

  const renderTileContent = ({ date }: { date: Date }) => {
    const dateKey = format(date, "yyyy-MM-dd");
    const customDate = customDates.find(
      (d) => format(d.date, "yyyy-MM-dd") === dateKey
    );
    const moodEntry = moods.find((m) => m.date === dateKey);

    if (customDate) {
      return (
        <Tooltip title={customDate.label}>
          <span aria-label={customDate.label}>{customDate.emoji}</span>
        </Tooltip>
      );
    }
    if (moodEntry) {
      return (
        <Tooltip title={`Mod: ${moodEntry.mood}`}>
          <span aria-label={`Mod: ${moodEntry.mood}`}>
            {MOOD_OPTIONS.find((m) => m.label === moodEntry.mood)?.emoji}
          </span>
        </Tooltip>
      );
    }
    return null;
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setOpen(true);
  };

  const handleDialogClose = () => {
    setOpen(false);
    setSelectedDate(null);
  };

  const handlePeriodStart = () => {
    if (!selectedDateKey) return;
    addPeriodStart(selectedDateKey, latestPeriod?.duration ?? 5);
    setToastMessage("Regl başlangıcı kaydedildi");
    handleDialogClose();
  };

  const handlePeriodEnd = () => {
    if (!selectedDateKey) return;
    endPeriod(selectedDateKey);
    setToastMessage("Regl bitişi kaydedildi");
    handleDialogClose();
  };

  const handleMoodSelect = (mood: string) => {
    if (!selectedDateKey) return;
    addMood(selectedDateKey, mood);
    setToastMessage("Mod kaydedildi");
    handleDialogClose();
  };

  return (
    <Stack>
      <Calendar
        onChange={(newValue) => {
          onChange(newValue);
          if (newValue && !Array.isArray(newValue)) {
            handleDateClick(newValue);
          }
        }}
        value={value}
        tileContent={renderTileContent}
        tileClassName="custom-tile"
      />

      <Dialog open={open} onClose={handleDialogClose}>
        <DialogTitle>Tarih Detayları</DialogTitle>
        <DialogContent>
          {selectedDate && (
            <p>Seçilen Tarih: {format(selectedDate, "dd MMMM yyyy")}</p>
          )}
          <Button
            variant="outlined"
            color="primary"
            sx={{ marginRight: 2, marginTop: 2 }}
            onClick={handlePeriodStart}
          >
            Regl Oldum
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            sx={{ marginTop: 2 }}
            onClick={handlePeriodEnd}
            disabled={!latestPeriod}
          >
            Regl Bitişi
          </Button>
          <Box sx={{ marginTop: 4 }}>
            <p>Modunuzu seçin:</p>
            <Stack direction="row" spacing={2} sx={{ marginTop: 2 }}>
              {MOOD_OPTIONS.map(({ emoji, label }) => (
                <Button
                  key={label}
                  variant={selectedMood === label ? "contained" : "outlined"}
                  aria-label={label}
                  onClick={() => handleMoodSelect(label)}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: 2,
                  }}
                >
                  {emoji}
                  <span style={{ fontSize: "12px", marginTop: "4px" }}>
                    {label}
                  </span>
                </Button>
              ))}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Kapat</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!toastMessage}
        autoHideDuration={2500}
        onClose={() => setToastMessage(null)}
        message={toastMessage}
      />

      <style>{`
        .react-calendar {
          background: ${theme.palette.background.default} !important;
          color: ${theme.palette.text.primary} !important;
        }
        .react-calendar__tile--active {
          background: ${theme.palette.primary.light} !important;
          color: white !important;
        }
        .custom-tile {
          background: ${theme.palette.background.paper};
        }
        .react-calendar__tile {
          color: ${theme.palette.text.primary} !important;
        }
        .react-calendar__tile--now {
          background: ${theme.palette.secondary.light} !important;
        }
        .react-calendar__month-view__days__day--weekend {
          color: ${theme.palette.primary.main} !important;
        }
      `}</style>
    </Stack>
  );
};
