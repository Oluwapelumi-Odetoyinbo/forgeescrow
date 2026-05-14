/// <reference types="vite/client" />

declare namespace JSX {
  interface IntrinsicElements {
    'iconify-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      icon?: string;
      width?: string | number;
      height?: string | number;
      style?: React.CSSProperties & { color?: string };
      className?: string;
    }, HTMLElement>;
  }
}
