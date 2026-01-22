import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { ISSUE_CATEGORIES } from '../data/issueCategories';
import { saveReport } from '../supabase/services';

export const ReportDetails = ({ report }) => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const { campus, photo, category, location, note, urgent, setCategory, setLocation, setNote, setUrgent } = report;

  const canSubmit = photo && category && location;
  const selectedCategory = ISSUE_CATEGORIES.find(c => c.id === category);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      await saveReport({
        timestamp: new Date().toLocaleString(),
        campus: campus?.name || '',
        photo,
        category,
        location,
        note,
        urgent,
        team: selectedCategory?.team || 'Facilities',
        status: 'open',
        campusData: campus
      });
      navigate('/report/complete');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <Header
        title="Issue Details"
        subtitle={campus?.name || ''}
        variant="red"
        onBack={() => navigate('/report/photo')}
      />

      <div className="p-4 space-y-4">
        {photo && (
          <div className="flex items-center bg-white rounded-lg p-3 shadow">
            <img
              src={photo}
              alt="Issue"
              className="w-16 h-16 object-cover rounded mr-3"
            />
            <div className="text-sm text-gray-600">Photo captured ✓</div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What type of issue? *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ISSUE_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`p-3 rounded-lg border-2 text-center ${
                  category === cat.id
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="text-2xl mb-1">{cat.icon}</div>
                <div className="text-xs">{cat.name}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., 2nd floor restroom, Room 204"
            className="w-full border border-gray-300 rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any additional details..."
            className="w-full border border-gray-300 rounded-lg p-3"
            rows={2}
          />
        </div>

        <div className="bg-white rounded-lg p-4 shadow">
          <label
            className="flex items-center cursor-pointer"
            onClick={() => setUrgent(!urgent)}
          >
            <div
              className={`w-12 h-6 rounded-full mr-3 ${
                urgent ? 'bg-red-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  urgent ? 'translate-x-6' : 'translate-x-1'
                }`}
                style={{ marginTop: '2px' }}
              />
            </div>
            <div>
              <div className="font-medium">🚨 Urgent / Safety</div>
              <div className="text-sm text-gray-500">
                Requires immediate attention
              </div>
            </div>
          </label>
        </div>

        {category && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="text-sm text-blue-700">
              <strong>Routes to:</strong> {selectedCategory?.team || 'Facilities'}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className={`w-full py-4 rounded-xl text-lg font-bold ${
            canSubmit && !submitting
              ? 'bg-red-500 text-white'
              : 'bg-gray-300 text-gray-500'
          }`}
        >
          {submitting
            ? 'Submitting...'
            : urgent
            ? '🚨 Submit Urgent'
            : '✓ Submit Report'}
        </button>
      </div>
    </div>
  );
};
