import * as React from 'react';
import Reload from 'src/assets/icons/reload.svg';
import _Button, { ButtonProps } from '@mui/material/Button';
import { TooltipIcon } from 'src/components/TooltipIcon/TooltipIcon';
import { useTheme, styled } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import { isPropValid } from '../../utilities/isPropValid';
import { rotate360 } from '../../styles/keyframes';

export type ButtonType = 'primary' | 'secondary' | 'outlined';

export interface Props extends ButtonProps {
  buttonType?: ButtonType;
  className?: string;
  sx?: SxProps;
  compactX?: boolean;
  compactY?: boolean;
  loading?: boolean;
  tooltipText?: string;
  tooltipGAEvent?: () => void;
}

const StyledButton = styled(_Button, {
  shouldForwardProp: (prop) =>
    isPropValid(['compactX', 'compactY', 'loading', 'buttonType'], prop),
})<Props>(({ theme, ...props }) => ({
  ...(props.buttonType === 'secondary' &&
    props.compactX && {
      minWidth: 50,
      paddingRight: 0,
      paddingLeft: 0,
    }),
  ...(props.buttonType === 'secondary' &&
    props.compactY && {
      minHeight: 20,
      paddingTop: 0,
      paddingBottom: 0,
    }),
  ...(props.loading && {
    '& svg': {
      animation: `${rotate360} 2s linear infinite`,
      margin: '0 auto',
      height: `${theme.spacing(2)}`,
      width: `${theme.spacing(2)}`,
    },
    '&:disabled': {
      backgroundColor:
        props.buttonType === 'primary' && theme.palette.text.primary,
    },
  }),
}));

const Span = styled('span')({
  display: 'flex',
  alignItems: 'center',
  '@supports (-moz-appearance: none)': {
    /* Fix text alignment for Firefox */
    marginTop: 2,
  },
});

const Button = React.forwardRef<HTMLButtonElement, Props>(
  (
    {
      // default to secondary as some components never define a buttonType (usually buttons with icons)
      // and we end up with the wrong styles (purple color, see #6455)
      // It would be nice to remove this default and require the prop but this fixes the issue for now.
      buttonType = 'secondary',
      children,
      className,
      compactX,
      compactY,
      disabled,
      loading,
      sx,
      tooltipText,
      tooltipGAEvent,
      ...rest
    }: Props,
    ref
  ) => {
    const theme = useTheme();
    const color = buttonType === 'primary' ? 'primary' : 'secondary';
    const sxTooltipIcon = { marginLeft: `-${theme.spacing()}` };

    const variant =
      buttonType === 'primary' || buttonType === 'secondary'
        ? 'contained'
        : buttonType === 'outlined'
        ? 'outlined'
        : 'text';

    return (
      <React.Fragment>
        <StyledButton
          {...rest}
          buttonType={buttonType}
          className={className}
          color={color}
          compactX={compactX}
          compactY={compactY}
          disabled={disabled || loading}
          loading={loading}
          sx={sx}
          variant={variant}
          ref={ref}
        >
          <Span data-testid="loadingIcon">
            {loading ? <Reload /> : children}
          </Span>
        </StyledButton>
        {tooltipText && (
          <TooltipIcon
            sxTooltipIcon={sxTooltipIcon}
            text={tooltipText}
            tooltipGAEvent={tooltipGAEvent}
            status="help"
          />
        )}
      </React.Fragment>
    );
  }
);

Button.displayName = 'Button';

export default Button;
