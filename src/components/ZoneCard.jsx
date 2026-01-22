import { ZONES } from '../data/zones';

export const ZoneCard = ({ zoneId, index, defects, isComplete, onClick }) => {
  const zone = ZONES[zoneId];

  return (
    <button
      onClick={onClick}
      className={`w-full ${
        isComplete
          ? defects === 0
            ? 'bg-green-50'
            : 'bg-red-50'
          : 'bg-white'
      } p-4 rounded-lg border border-gray-200 flex items-center text-left`}
    >
      <span
        className={`w-8 h-8 rounded-full ${
          isComplete
            ? defects === 0
              ? 'bg-green-500'
              : 'bg-red-500'
            : 'bg-gray-200'
        } text-white flex items-center justify-center mr-3 font-bold text-sm`}
      >
        {isComplete ? (defects === 0 ? '✓' : defects) : index + 1}
      </span>
      <div className="flex-1">
        <div className="font-medium">{zone.name}</div>
        {zone.description && (
          <div className="text-xs text-gray-500">{zone.description}</div>
        )}
      </div>
      {!zone.amberEligible && (
        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
          ⚠️
        </span>
      )}
    </button>
  );
};
