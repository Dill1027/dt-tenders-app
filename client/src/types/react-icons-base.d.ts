declare module 'react-icons' {
  import { ComponentType } from 'react';

  export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
    size?: string | number;
    color?: string;
    title?: string;
    className?: string;
  }

  export type IconType = ComponentType<IconBaseProps>;
}
