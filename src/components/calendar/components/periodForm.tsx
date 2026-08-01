import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  DialogTitle,
  DialogActions,
  DialogContent,
  Slider,
  Typography,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import { useForm, Controller } from "react-hook-form";
import { usePeriodContext } from "../../../context/PeriodContext";

interface PeriodFormValues {
  duration: number;
  startDate: string;
}

const MIN_DURATION = 3;
const MAX_DURATION = 10;
const today = () => format(new Date());

function format(date: Date) {
  return date.toISOString().split("T")[0];
}

export const PeriodForm: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { latestPeriod, addPeriodStart } = usePeriodContext();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<PeriodFormValues>();

  useEffect(() => {
    if (!latestPeriod) {
      setOpen(true);
    }
  }, [latestPeriod]);

  const handleClose = () => setOpen(false);

  const onSubmit = (data: PeriodFormValues) => {
    addPeriodStart(data.startDate, data.duration);
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle align="center" sx={{ fontWeight: "bold", pb: 0 }}>
        Regl Süresi ve Başlangıç Tarihini Ekle
      </DialogTitle>
      <DialogContent>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          display="flex"
          flexDirection="column"
          gap={4}
          mt={2}
        >
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Regl Kaç Gün Sürüyor? ({MIN_DURATION}-{MAX_DURATION} gün)
            </Typography>
            <Controller
              name="duration"
              control={control}
              defaultValue={latestPeriod?.duration || 5}
              rules={{
                required: "Regl süresi gereklidir",
                validate: (value) =>
                  (value >= MIN_DURATION && value <= MAX_DURATION) ||
                  `Süre ${MIN_DURATION} ile ${MAX_DURATION} gün arasında olmalıdır`,
              }}
              render={({ field }) => (
                <Slider
                  {...field}
                  valueLabelDisplay="auto"
                  min={MIN_DURATION}
                  max={MAX_DURATION}
                  step={1}
                  marks
                />
              )}
            />
            {errors.duration && (
              <Typography color="error" variant="caption">
                {errors.duration.message}
              </Typography>
            )}
          </Box>

          <TextField
            label="Başlangıç Tarihi"
            type="date"
            fullWidth
            defaultValue={latestPeriod?.startDate || ""}
            {...register("startDate", {
              required: "Başlangıç tarihi gereklidir",
              validate: (value) => {
                if (!value || Number.isNaN(new Date(value).getTime())) {
                  return "Geçerli bir tarih giriniz";
                }
                if (value > today()) {
                  return "Gelecekte bir tarih seçilemez";
                }
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                if (new Date(value) < oneYearAgo) {
                  return "Tarih son 1 yıl içinde olmalıdır";
                }
                return true;
              },
            })}
            slotProps={{
              htmlInput: { max: today() },
              inputLabel: { shrink: true },
            }}
            error={!!errors.startDate}
            helperText={errors.startDate?.message}
          />

          <DialogActions>
            <Button
              type="submit"
              color="primary"
              variant="contained"
              disabled={!isDirty}
            >
              Kaydet
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
