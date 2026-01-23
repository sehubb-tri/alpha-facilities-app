import { useNavigate } from 'react-router-dom';

export const AuditComplete = ({ audit }) => {
  const navigate = useNavigate();
  const { campus, calculateStatus, resetAudit } = audit;

  const status = calculateStatus();

  const statusColors = {
    GREEN: 'bg-[#47C4E6]',
    AMBER: 'bg-[#2B57D0]',
    RED: 'bg-[#141685]'
  };

  const handleDone = () => {
    resetAudit();
    navigate('/');
  };

  return (
    <div
      className={`min-h-screen ${statusColors[status]} flex flex-col items-center justify-center p-8 text-white text-center`}
    >
      <div className="text-8xl mb-6">✅</div>
      <h1 className="text-3xl font-bold mb-2">Submitted!</h1>
      <div className="text-5xl font-bold my-4">{status}</div>
      <p className="opacity-90 mb-8">{campus?.name || ''}</p>
      <button
        onClick={handleDone}
        className="bg-white text-gray-800 px-8 py-3 rounded-lg font-bold"
      >
        Done
      </button>
    </div>
  );
};
