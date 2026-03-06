import React from 'react';
import { Radio } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';


export const StyledRadio = styled((props) => <Radio {...props} />)(({ theme, color = 'primary' }) => {
    const mainColor = theme.palette[color]?.main || theme.palette.primary.main;

    return {
        '&:not(.Mui-checked)': {
            color: theme.palette.grey[500],
        },
        '&:hover': {
            backgroundColor: alpha(mainColor, 0.08),
        },
        '&.Mui-checked': {
        },
        '&.Mui-disabled': {
            color: theme.palette.action.disabled,
        }
    };
});