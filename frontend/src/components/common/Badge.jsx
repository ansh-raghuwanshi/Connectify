export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon,
  style = {},
  ...props
}) {
  return (
    <span
      className={`c-badge c-badge-${variant} c-badge-${size} ${className}`}
      style={style}
      {...props}
    >
      {icon && <span className="c-badge-icon">{icon}</span>}
      <span>{children}</span>
    </span>
  )
}

export default Badge
