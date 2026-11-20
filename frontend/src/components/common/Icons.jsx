
export function Icon({ name, size = 18, color = 'currentColor', className = '', style = {} }) {
  const iconProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: `inline-icon ${className}`,
    style: { verticalAlign: 'middle', flexShrink: 0, ...style },
  }

  switch (name) {
    case 'logo':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
          <circle cx="12" cy="12" r="3" fill={color} />
        </svg>
      )

    case 'sun':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      )

    case 'moon':
      return (
        <svg {...iconProps}>
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )

    case 'camera':
      return (
        <svg {...iconProps}>
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      )

    case 'image':
      return (
        <svg {...iconProps}>
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      )

    case 'plus':
      return (
        <svg {...iconProps}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      )

    case 'paperclip':
      return (
        <svg {...iconProps}>
          <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
      )

    case 'users':
      return (
        <svg {...iconProps}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )

    case 'user':
      return (
        <svg {...iconProps}>
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )

    case 'graduation-cap':
      return (
        <svg {...iconProps}>
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      )

    case 'briefcase':
      return (
        <svg {...iconProps}>
          <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      )

    case 'sparkles':
      return (
        <svg {...iconProps}>
          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
        </svg>
      )

    case 'handshake':
      return (
        <svg {...iconProps}>
          <path d="m11 17 2 2a1 1 0 0 0 1.4 0l6.6-6.6a2 2 0 0 0 0-2.8l-1.6-1.6a2 2 0 0 0-2.8 0L14 10.6" />
          <path d="m13 7.4-2-2a2 2 0 0 0-2.8 0L3 10.6a2 2 0 0 0 0 2.8l1.6 1.6a2 2 0 0 0 2.8 0L10 12.4" />
          <path d="m7.5 12.5 3 3" />
          <path d="m13.5 8.5 3 3" />
        </svg>
      )

    case 'calendar':
      return (
        <svg {...iconProps}>
          <rect width="18" height="18" x="3" y="4" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      )

    case 'message-square':
      return (
        <svg {...iconProps}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )

    case 'newspaper':
      return (
        <svg {...iconProps}>
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
          <path d="M18 14h-8M18 18h-8M18 10h-8M18 6h-8" />
        </svg>
      )

    case 'search':
      return (
        <svg {...iconProps}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      )

    case 'filter':
      return (
        <svg {...iconProps}>
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
      )

    case 'heart':
      return (
        <svg {...iconProps}>
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      )

    case 'heart-fill':
      return (
        <svg {...iconProps} fill={color}>
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      )

    case 'map-pin':
      return (
        <svg {...iconProps}>
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      )

    case 'building':
      return (
        <svg {...iconProps}>
          <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
          <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
        </svg>
      )

    case 'send':
      return (
        <svg {...iconProps}>
          <path d="m22 2-7 20-4-9-9-4Z" />
          <path d="M22 2 11 13" />
        </svg>
      )

    case 'trash':
      return (
        <svg {...iconProps}>
          <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
      )

    case 'edit':
      return (
        <svg {...iconProps}>
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        </svg>
      )

    case 'arrow-right':
      return (
        <svg {...iconProps}>
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      )

    case 'check':
      return (
        <svg {...iconProps}>
          <path d="M20 6 9 17l-5-5" />
        </svg>
      )

    case 'x':
      return (
        <svg {...iconProps}>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      )

    case 'log-out':
      return (
        <svg {...iconProps}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
      )

    case 'menu':
      return (
        <svg {...iconProps}>
          <path d="M4 12h16M4 6h16M4 18h16" />
        </svg>
      )

    case 'shield-check':
      return (
        <svg {...iconProps}>
          <path d="M20 13c0 5-8 9-8 9s-8-4-8-9V5l8-3 8 3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      )

    case 'compass':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      )

    case 'tag':
      return (
        <svg {...iconProps}>
          <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
          <circle cx="7" cy="7" r=".5" />
        </svg>
      )

    case 'clock':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )

    case 'award':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
        </svg>
      )

    case 'external-link':
      return (
        <svg {...iconProps}>
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
        </svg>
      )

    case 'refresh':
      return (
        <svg {...iconProps}>
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path d="M16 16h5v5" />
        </svg>
      )

    default:
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      )
  }
}
