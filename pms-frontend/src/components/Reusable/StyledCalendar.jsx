import React from 'react';
import { Paper } from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { isSameDay, getMonth, getDate } from 'date-fns';

// Default color palette, can be customized or moved to theme
const PRIMARY_ORANGE = '#FBAF1E';
const PRIMARY_ORANGE_DARKER = '#D18A0F';
const PRIMARY_ORANGE_LIGHT_BG = '#FEF3D5';
const PRIMARY_ORANGE_TODAY_BG = '#FCEBC7';
const PRIMARY_ORANGE_TODAY_BORDER = '#F7D184';

/**
 * A reusable, styled Calendar component.
 * It highlights specific days and allows for date selection.
 */
export const StyledCalendar = ({
    value,              // The currently selected date (a Date object)
    onChange,           // Function called when a new date is selected
    markedDays = [],    // Array of days to highlight
}) => {
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Paper sx={{ borderRadius: 2, border: '1px solid', borderColor: 'grey.200', overflow: 'hidden' }}>
                <DateCalendar
                    value={value}
                    onChange={onChange}
                    sx={{
                        '& .MuiPickersDay-root': {
                            fontSize: '0.875rem', borderRadius: '8px',
                            '&:hover': { bgcolor: PRIMARY_ORANGE_LIGHT_BG },
                            '&.Mui-selected': { bgcolor: PRIMARY_ORANGE, color: '#ffffff', '&:hover': { bgcolor: PRIMARY_ORANGE_DARKER } },
                        },
                        '& .MuiPickersDay-today': {
                            bgcolor: PRIMARY_ORANGE_TODAY_BG,
                            border: `1px solid ${PRIMARY_ORANGE_TODAY_BORDER}`,
                            color: PRIMARY_ORANGE_DARKER,
                            fontWeight: 'bold'
                        },
                        width: '100%',
                        margin: 0
                    }}
                    // The slotProps is where the magic happens for highlighting days
                    slotProps={{
                        day: (ownerState) => {
                            const { day, selected, today, outsideCurrentMonth } = ownerState;
                            if (outsideCurrentMonth) return {};

                            // Find if the current day in the calendar matches any of the marked days
                            const markedDayInfo = markedDays.find(marked => isSameDay(day, marked.date));

                            let sxProp = {};
                            if (markedDayInfo) {
                                // Apply the custom background color from the marked day object
                                const highlightColor = markedDayInfo.color || 'rgba(110, 140, 72, 0.2)'; // Default color
                                if (selected || today) {
                                    sxProp.boxShadow = `0 0 0 2px ${highlightColor} inset`;
                                } else {
                                    sxProp.backgroundColor = highlightColor;
                                }
                            }
                            return { sx: sxProp };
                        },
                    }}
                />
            </Paper>
        </LocalizationProvider>
    );
};