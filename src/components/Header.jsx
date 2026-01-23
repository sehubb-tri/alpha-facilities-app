export const Header = ({
  title,
  subtitle,
  onBack,
  variant = 'default',
  rightContent
}) => {
  const backgrounds = {
    default: 'linear-gradient(180deg, #092849 0%, #141685 100%)',
    red: '#dc2626',
    orange: '#f97316',
    green: '#22c55e'
  };

  return (
    <div style={{
      background: backgrounds[variant],
      color: '#fff',
      padding: '20px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                fontSize: '24px',
                marginRight: '14px',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '8px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#fff'
              }}
            >
              ←
            </button>
          )}
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              margin: 0
            }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{
                fontSize: '15px',
                opacity: 0.8,
                margin: '4px 0 0 0'
              }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {rightContent}
      </div>
    </div>
  );
};
