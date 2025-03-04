import { unstable_composeClasses as composeClasses } from '@mui/base';
import { OverridableComponent } from '@mui/types';
import { unstable_capitalize as capitalize } from '@mui/utils';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import * as React from 'react';
import { getPath } from '@mui/system';
import { useThemeProps } from '../styles';
import styled from '../styles/styled';
import { resolveSxValue } from '../styles/styleUtils';
import { getSheetUtilityClass } from './sheetClasses';
import { SheetProps, SheetOwnerState, SheetTypeMap } from './SheetProps';
import { ColorInversionProvider, useColorInversion } from '../styles/ColorInversion';

const useUtilityClasses = (ownerState: SheetOwnerState) => {
  const { variant, color } = ownerState;

  const slots = {
    root: [
      'root',
      variant && `variant${capitalize(variant)}`,
      color && `color${capitalize(color)}`,
    ],
  };

  return composeClasses(slots, getSheetUtilityClass, {});
};

export const SheetRoot = styled('div', {
  name: 'JoySheet',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
})<{ ownerState: SheetOwnerState }>(({ theme, ownerState }) => {
  const variantStyle = theme.variants[ownerState.variant!]?.[ownerState.color!];
  const childRadius = resolveSxValue({ theme, ownerState }, 'borderRadius');
  const bgcolor = resolveSxValue({ theme, ownerState }, 'bgcolor');
  const backgroundColor = resolveSxValue({ theme, ownerState }, 'backgroundColor');
  const background = resolveSxValue({ theme, ownerState }, 'background');
  const resolvedBg =
    (getPath(theme, `palette.${bgcolor}`) as string) ||
    bgcolor ||
    (getPath(theme, `palette.${backgroundColor}`) as string) ||
    backgroundColor ||
    background ||
    variantStyle?.backgroundColor ||
    variantStyle?.background ||
    theme.vars.palette.background.surface;
  return [
    {
      '--List-item-stickyBackground': resolvedBg, // for sticky List
      '--Sheet-background': resolvedBg, // for sticky table cell
      // minus the sheet's border width to have consistent radius between sheet and children
      ...(childRadius !== undefined && {
        '--List-radius': `calc(${childRadius} - var(--variant-borderWidth, 0px))`,
        '--internal-action-radius': `calc(${childRadius} - var(--variant-borderWidth, 0px))`,
      }),
      // TODO: discuss the theme transition.
      // This value is copied from mui-material Sheet.
      transition: 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
      backgroundColor: theme.vars.palette.background.surface,
      position: 'relative',
    },
    variantStyle,
    ownerState.color !== 'context' &&
      ownerState.invertedColors &&
      theme.colorInversion[ownerState.variant!]?.[ownerState.color!],
  ];
});

const Sheet = React.forwardRef(function Sheet(inProps, ref) {
  const props = useThemeProps<typeof inProps & SheetProps>({
    props: inProps,
    name: 'JoySheet',
  });

  const {
    className,
    color: colorProp = 'neutral',
    component = 'div',
    variant = 'plain',
    invertedColors = false,
    ...other
  } = props;
  const { getColor } = useColorInversion(variant);
  const color = getColor(inProps.color, colorProp);

  const ownerState = {
    ...props,
    color,
    component,
    invertedColors,
    variant,
  };

  const classes = useUtilityClasses(ownerState);

  const result = (
    <SheetRoot
      as={component}
      ownerState={ownerState}
      className={clsx(classes.root, className)}
      ref={ref}
      {...other}
    />
  );

  if (invertedColors) {
    return <ColorInversionProvider variant={variant}>{result}</ColorInversionProvider>;
  }
  return result;
}) as OverridableComponent<SheetTypeMap>;

Sheet.propTypes /* remove-proptypes */ = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // |     To update them edit TypeScript types and run "yarn proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * The content of the component.
   */
  children: PropTypes.node,
  /**
   * @ignore
   */
  className: PropTypes.string,
  /**
   * The color of the component. It supports those theme colors that make sense for this component.
   * @default 'neutral'
   */
  color: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['danger', 'info', 'neutral', 'primary', 'success', 'warning']),
    PropTypes.string,
  ]),
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: PropTypes.elementType,
  /**
   * If `true`, the children with an implicit color prop invert their colors to match the component's variant and color.
   * @default false
   */
  invertedColors: PropTypes.bool,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool])),
    PropTypes.func,
    PropTypes.object,
  ]),
  /**
   * The variant to use.
   * @default 'plain'
   */
  variant: PropTypes /* @typescript-to-proptypes-ignore */.oneOfType([
    PropTypes.oneOf(['outlined', 'plain', 'soft', 'solid']),
    PropTypes.string,
  ]),
} as any;

export default Sheet;
