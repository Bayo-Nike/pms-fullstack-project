import React from 'react';
import {
    Stepper, Step, StepLabel, StepConnector,
    Typography, Box
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { CheckCircle } from '@mui/icons-material';


const StyledConnector = styled(StepConnector)(({ theme }) => ({
  '&.MuiStepConnector-horizontal': {
    top: 12,
    left: 'calc(-50% + 12px)',
    right: 'calc(50% + 12px)',
  },
  '&.MuiStepConnector-vertical': {
    marginLeft: 12,
  },
  '& .MuiStepConnector-line': {
    borderColor: theme.palette.grey[300],
    borderTopWidth: 2,
    borderRadius: 1,
    borderLeftWidth: 2,
  },
  '&.Mui-active .MuiStepConnector-line, &.Mui-completed .MuiStepConnector-line': {
    borderColor: '#4caf50', 
  },
}));


const StepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.grey[300], 
  zIndex: 1,
  color: '#fff',
  width: 24,
  height: 24,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  ...(ownerState.active && {
    backgroundColor: '#4caf50', 
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
  }),
  ...(ownerState.completed && {
    backgroundColor: '#4caf50', 
  }),
}));

function StepIcon(props) {
  const { active, completed, className, icon } = props;

  return (
    <StepIconRoot ownerState={{ completed, active }} className={className}>
      {completed ? (
        <CheckCircle sx={{ fontSize: '1rem', color: 'white' }} />
      ) : (
        <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>{String(icon)}</Typography>
      )}
    </StepIconRoot>
  );
}


export const StyledStepper = ({
  steps,
  activeStep,
  orientation = 'horizontal',
  ...props
}) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Stepper
        alternativeLabel={orientation === 'horizontal'} 
        activeStep={activeStep}
        orientation={orientation}
        connector={<StyledConnector />}
        {...props}
      >
        {steps.map((step, index) => (
          <Step key={step.title}>
            <StepLabel StepIconComponent={StepIcon}>
              <Typography variant="body2">{step.title}</Typography>
              {step.description && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {step.description}
                </Typography>
              )}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};