import React from 'react';
import { Button, CircularProgress } from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

export const FormActions = ({ onCancel, isSaving, size = 'medium' }) => {
  return (
    <div className="flex justify-end ...">
      <Button
        type="button"
        variant="outlined"
        onClick={onCancel}
        disabled={isSaving}
        startIcon={<CancelIcon />}
        size={size} // Pass size
        className="!border-gray-300 ..."
      >
        Cancel
      </Button>
      <Button
        type="submit"
        variant="contained"
        disabled={isSaving}
        startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
        size={size} // Pass size
        className="!bg-[#FBAF1E] ..."
      >
        {isSaving ? 'Saving...' : 'Save'}
      </Button>
    </div>
  );
};