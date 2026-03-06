import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Stack, IconButton, Typography, CircularProgress
} from '@mui/material';
import { Save as SaveIcon, Close as CloseIcon } from '@mui/icons-material';

/**
 * A generic, styled Dialog component for your design system.
 * It's perfect for forms, confirmations, or displaying information.
 */
export const StyledDialog = ({
    open,
    onClose,
    onSubmit, // A function to handle form submission
    title,
    children, // The content of the dialog (e.g., form fields)
    actions,  // Optional: For custom buttons
    isSaving = false,
    saveText = 'Save',
    size = 'xs' // Default size
}) => {
    
    // If custom actions are provided, render them. Otherwise, render default Save/Cancel buttons.
    const renderActions = () => {
        if (actions) {
            return actions;
        }
        return (
            <>
                <Button onClick={onClose} disabled={isSaving}>Cancel</Button>
                <Button
                    type="submit" // Allows form submission via the button
                    variant="contained"
                    disabled={isSaving}
                    startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                >
                    {isSaving ? 'Saving...' : saveText}
                </Button>
            </>
        );
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={size}
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' } }}
        >
            <DialogTitle sx={{ borderBottom: 1, borderColor: 'grey.200', py: 2.5, px: 3 }}>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 600, color: 'grey.800' }}>
                    {title}
                </Typography>
                <IconButton onClick={onClose} sx={{ position: 'absolute', right: 12, top: 12 }}><CloseIcon /></IconButton>
            </DialogTitle>
            
            {/* The form tag can wrap the content and actions */}
            <form onSubmit={onSubmit}>
                <DialogContent dividers sx={{ p: 3 }}>
                    {children}
                </DialogContent>
                <DialogActions sx={{ p: '16px 24px', borderTop: 1, borderColor: 'grey.200' }}>
                    {renderActions()}
                </DialogActions>
            </form>
        </Dialog>
    );
};