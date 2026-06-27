import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function IconBase({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export function FolderIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3.5 6.5h6.1l1.8 2h9.1v8.8a2.2 2.2 0 0 1-2.2 2.2H5.7a2.2 2.2 0 0 1-2.2-2.2V6.5Z" />
      <path d="M3.5 8.5V6.7a2.2 2.2 0 0 1 2.2-2.2h3.2l1.8 2" />
    </IconBase>
  )
}

export function CatalogIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4.5 5.5h6v6h-6z" />
      <path d="M13.5 5.5h6v6h-6z" />
      <path d="M4.5 14.5h6v6h-6z" />
      <path d="M13.5 14.5h6v6h-6z" />
    </IconBase>
  )
}

export function DashboardIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4.5 13.5h6v6h-6z" />
      <path d="M13.5 4.5h6v15h-6z" />
      <path d="M4.5 4.5h6v5h-6z" />
    </IconBase>
  )
}

export function OrdersIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 4.5h10a1.8 1.8 0 0 1 1.8 1.8v13.2l-2.2-1.2-2.2 1.2-2.2-1.2-2.2 1.2-2.2-1.2-2.2 1.2V6.3A1.8 1.8 0 0 1 7 4.5Z" />
      <path d="M8.5 9h7" />
      <path d="M8.5 12.5h7" />
      <path d="M8.5 16h4" />
    </IconBase>
  )
}

export function RequestIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4.5 6.5h15v11h-15z" />
      <path d="m5 7 7 5.5L19 7" />
      <path d="M8 17.5 4.5 20" />
      <path d="M16 17.5 19.5 20" />
    </IconBase>
  )
}

export function ImageIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="4" y="5" width="16" height="14" rx="2.2" />
      <path d="m4 15 4.2-4.2a1.5 1.5 0 0 1 2.1 0L15 15.5" />
      <path d="m13.5 14 1.4-1.4a1.5 1.5 0 0 1 2.1 0L20 15.6" />
      <circle cx="15.8" cy="9.2" r="1.2" />
    </IconBase>
  )
}

export function ReviewIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5.5 5.5h13v9.8a2 2 0 0 1-2 2H10l-4.5 3v-3h0a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2Z" />
      <path d="m8 10.2 1.2 1.2 2.4-2.6" />
      <path d="M13.5 10h2.5" />
      <path d="M8 14h8" />
    </IconBase>
  )
}

export function WorksIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4.5 8.5h15v10h-15z" />
      <path d="M8 8.5V6.8A2.3 2.3 0 0 1 10.3 4.5h3.4A2.3 2.3 0 0 1 16 6.8v1.7" />
      <path d="M4.5 13h15" />
      <path d="M10 13v2h4v-2" />
    </IconBase>
  )
}

export function ImportIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6.5 4.5h7l4 4v11h-11z" />
      <path d="M13.5 4.5v4h4" />
      <path d="M12 17v-6" />
      <path d="m9.5 13.5 2.5-2.5 2.5 2.5" />
    </IconBase>
  )
}

export function NoImageIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="4" y="5" width="16" height="14" rx="2.2" />
      <path d="m4 15 4.2-4.2a1.5 1.5 0 0 1 2.1 0L15 15.5" />
      <path d="M5 4 20 20" />
    </IconBase>
  )
}

export function LogoutIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M10 5.5H6.8A2.3 2.3 0 0 0 4.5 7.8v8.4a2.3 2.3 0 0 0 2.3 2.3H10" />
      <path d="M13.5 8.5 17 12l-3.5 3.5" />
      <path d="M8.5 12H17" />
    </IconBase>
  )
}

export function ArrowUpIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m12 5 6 6" />
      <path d="m12 5-6 6" />
      <path d="M12 5v14" />
    </IconBase>
  )
}

export function ArrowDownIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m12 19 6-6" />
      <path d="m12 19-6-6" />
      <path d="M12 19V5" />
    </IconBase>
  )
}

export function EditIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4.5 19.5h4.2L19 9.2a2.1 2.1 0 0 0-3-3L5.7 16.5 4.5 19.5Z" />
      <path d="m14.5 7.7 2.8 2.8" />
    </IconBase>
  )
}

export function TrashIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 7h14" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <path d="M7 7 8 20h8l1-13" />
      <path d="M10.5 11v5" />
      <path d="M13.5 11v5" />
    </IconBase>
  )
}

export function BoxIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="M4.4 7.8 12 12l7.6-4.2" />
      <path d="M12 12v9" />
    </IconBase>
  )
}
