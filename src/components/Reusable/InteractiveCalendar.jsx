import React from 'react';
import {
    Box, Paper, Typography, Button, IconButton, Stack, List, ListItem, ListItemIcon,
    ListItemText, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import {
    ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon,
    Event as EventIcon, WorkOff as WorkOffIcon
} from '@mui/icons-material';
import {
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth,
    isSameDay, getISOWeek, eachMonthOfInterval, startOfYear, endOfYear, getMonth, getDate
} from 'date-fns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// Define default colors. In a real app, these could come from the theme.
const themeColors = {
    primary: '#FBAF1E', primaryDarker: '#D18A0F', primaryLightBg: '#FEF3D5',
    todayBg: '#FCEBC7', todayBorder: '#F7D184',
    eventGreen: '#6e8c48', eventGreenTint: 'rgba(212, 226, 200, 0.6)',
    holidayRed: 'rgba(239, 68, 68, 1)', holidayRedTint: 'rgba(254, 226, 226, 0.6)',
};


export const InteractiveCalendar = ({
    currentDate,
    viewMode,
    events = [],
    holidays = [],
    onDateChange, 
    onViewModeChange, 
    onDayClick,     
}) => {

    const isHoliday = (dayToCheck) => {
        return holidays.find(h => {
            const holidayDate = new Date(h.date + "T00:00:00");
            if (h.recursive === 'yearly') {
                return getMonth(holidayDate) === getMonth(dayToCheck) && getDate(holidayDate) === getDate(dayToCheck);
            }
            return isSameDay(holidayDate, dayToCheck);
        });
    };

    const getItemsForDay = (day) => {
        const dayEvents = events.filter(event => isSameDay(new Date(event.date + "T00:00:00"), day));
        const dayHolidays = holidays.filter(h => isHoliday(day)).map(h => ({ ...h, id: `h-${h.id}`, name: h.name, type: h.type }));
        return [...dayEvents, ...dayHolidays].sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));
    };
    
    

    const renderMonthView = () => {
        const monthStart = startOfMonth(currentDate);
        const daysInGrid = eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(endOfMonth(monthStart)) });
        return (
          <Box sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', bgcolor: 'grey.50' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <Typography key={day} sx={{ textAlign: 'center', py: 1.5, fontWeight: 600, color: 'grey.600', fontSize: '0.75rem' }}>{day}</Typography>)}
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {daysInGrid.map((day, index) => {
                const isCurrent = isSameMonth(day, currentDate);
                const holiday = isCurrent && isHoliday(day);
                return (
                  <Box key={index}
                    onClick={() => onDayClick(day)}
                    sx={{ minHeight: 120, p: 1, border: '1px solid', borderColor: 'grey.200', cursor: 'pointer',
                      bgcolor: holiday ? (holiday.type === 'public' ? themeColors.holidayRedTint : themeColors.eventGreenTint) : 'transparent',
                      '&:hover': { bgcolor: themeColors.primaryLightBg }
                    }}>
                    <Typography sx={{ textAlign: 'right', color: isCurrent ? 'text.primary' : 'text.disabled', fontWeight: isSameDay(day, new Date()) ? 'bold' : 'normal' }}>
                      {format(day, 'd')}
                    </Typography>
                    {holiday && (
                      <Typography sx={{ fontSize: '0.75rem', px: 1, py: 0.5, borderRadius: 1, bgcolor: holiday.type === 'public' ? themeColors.holidayRed : themeColors.eventGreen, color: 'white' }}>
                        {holiday.name}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        );
    };

    const renderDayView = () => {
        const items = getItemsForDay(currentDate);
        return (
            <Paper sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{format(currentDate, 'EEEE, MMMM d, yyyy')}</Typography>
                {items.length > 0 ? (
                    <List>
                        {items.map(item => (
                            <ListItem key={item.id}>
                                <ListItemIcon>{item.type === 'public' ? <WorkOffIcon /> : <EventIcon />}</ListItemIcon>
                                <ListItemText primary={item.name} secondary={item.time || (item.type ? `Type: ${item.type}` : 'All day')} />
                            </ListItem>
                        ))}
                    </List>
                ) : <Typography sx={{ mt: 2 }}>No items scheduled for this day.</Typography>}
            </Paper>
        );
    };
    

    
    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box>
            {/* Header */}
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Stack direction="row" alignItems="center" gap={1}>
                    <IconButton onClick={() => onDateChange('prev')}><ChevronLeftIcon /></IconButton>
                    <Typography variant="h6" component="h2" sx={{ textAlign: 'center', fontWeight: 700 }}>
                        {viewMode === 'month' && format(currentDate, 'MMMM yyyy')}
                        {viewMode === 'year' && format(currentDate, 'yyyy')}
                        {viewMode === 'week' && `Week ${getISOWeek(currentDate)}`}
                        {viewMode === 'day' && format(currentDate, 'MMMM d, yyyy')}
                    </Typography>
                    <IconButton onClick={() => onDateChange('next')}><ChevronRightIcon /></IconButton>
                    <Button variant="outlined" onClick={() => onDateChange('today')}>Today</Button>
                </Stack>
                <ToggleButtonGroup value={viewMode} exclusive onChange={(e, val) => onViewModeChange(val)}>
                    <ToggleButton value="year">Year</ToggleButton>
                    <ToggleButton value="month">Month</ToggleButton>
                    {/* <ToggleButton value="week">Week</ToggleButton> */}
                    <ToggleButton value="day">Day</ToggleButton>
                </ToggleButtonGroup>
            </Stack>

            {/* Content */}
            {viewMode === 'month' && renderMonthView()}
            {viewMode === 'day' && renderDayView()}
            {/* Add other views as needed */}
            {viewMode === 'year' && <Typography>Year View is not yet implemented in this reusable component.</Typography>}
            {viewMode === 'week' && <Typography>Week View is not yet implemented in this reusable component.</Typography>}
        </Box>
      </LocalizationProvider>
    );
};