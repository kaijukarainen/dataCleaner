import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

interface ErrorDialogProps {
  open: boolean;
  onClose: () => void;
  error: string;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({ open, onClose, error }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ErrorIcon color="error" />
        Error
      </DialogTitle>
      <DialogContent>
        <Typography>{error}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorDialog;