import { useNavigate } from 'react-router-dom';
import { ISSUE_CATEGORIES } from '../data/issueCategories';

export const ReportComplete = ({ report }) => {
  const navigate = useNavigate();
  const { campus, category, location, resetReport } = report;

  const cat = ISSUE_CATEGORIES.find(c => c.id === category);

  const handleDone = () => {
    resetReport();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-green-500 flex flex-col items-center justify-center p-8 text-white text-center">
      <div className="text-8xl mb-6">✅</div>
      <h1 className="text-3xl font-bold mb-2">Submitted!</h1>
      <p className="text-lg opacity-90 mb-4">{cat?.team || 'Facilities'} notified</p>

      <div className="bg-white/20 rounded-lg p-4 mb-8 w-full max-w-sm text-left">
        <div className="flex items-center mb-2">
          <span className="text-2xl mr-2">{cat?.icon || '📋'}</span>
          <span className="font-bold">{cat?.name || 'Issue'}</span>
        </div>
        <div className="text-sm opacity-90">{campus?.name || ''}</div>
        <div className="text-sm opacity-90">{location}</div>
      </div>

      <button
        onClick={handleDone}
        className="bg-white text-green-600 px-8 py-3 rounded-lg font-bold"
      >
        Done
      </button>
    </div>
  );
};
