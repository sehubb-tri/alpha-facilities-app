export const Header = ({
  title,
  subtitle,
  onBack,
  variant = 'default',
  rightContent
}) => {
  const bgClasses = {
    default: 'alpha-gradient text-white',
    red: 'bg-red-500 text-white',
    orange: 'bg-orange-500 text-white',
    green: 'bg-green-500 text-white'
  };

  return (
    <div className={`${bgClasses[variant]} p-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {onBack && (
            <button onClick={onBack} className="text-2xl mr-3">
              ←
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold">{title}</h1>
            {subtitle && (
              <p className={`text-sm ${variant === 'default' ? 'text-white/70' : `text-${variant.replace('bg-', '')}-100`}`}>
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
