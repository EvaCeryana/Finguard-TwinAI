type PageHeaderProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
};

export function PageHeader(props: PageHeaderProps) {
  const { title, subtitle, badge, actions } = props;

  const hasBadge = Boolean(badge);
  const hasSubtitle = Boolean(subtitle);
  const hasActions = Boolean(actions);

  return (
    <header className="page-header">
      <div className="page-header-left">
        {hasBadge ? (
          <span className="page-badge">
            {badge}
          </span>
        ) : null}

        <h1 className="page-title">
          {title}
        </h1>

        {hasSubtitle ? (
          <p className="page-subtitle">
            {subtitle}
          </p>
        ) : null}
      </div>

      {hasActions ? (
        <div className="page-header-actions">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
