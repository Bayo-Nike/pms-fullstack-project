import React from 'react';
import { Box, Paper, Typography, Button, IconButton } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const sectionTitleStyles = `...`;

export const DynamicSection = ({ title, items, onAdd, onRemove, renderItem, isSaving, size = 'medium' }) => {
  const buttonSize = size === 'small' ? 'small' : 'medium';
  
  return (
    <>
      <Box className="flex justify-between items-center">
        <Typography variant="h6" className={sectionTitleStyles}>{title}</Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          size={buttonSize} // Use mapped size
          onClick={onAdd}
          disabled={isSaving}
          className="!mt-6 ..."
        >
          Add
        </Button>
      </Box>
      <div className="space-y-4 mt-4">
        {items.map((item, index) => (
          <Paper key={item.id} variant="outlined" className="p-4 flex items-start gap-4">
            <Box className="flex-grow">{renderItem(item, index)}</Box>
            {}
            <IconButton onClick={() => onRemove(item.id)} disabled={isSaving} color="error" size={size}>
              <DeleteIcon />
            </IconButton>
          </Paper>
        ))}
      </div>
    </>
  );
};