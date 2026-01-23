import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { ISSUE_CATEGORIES } from '../data/issueCategories';
import { saveReport } from '../supabase/services';

export const ReportDetails = ({ report }) => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const { campus, photo, category, location, note, urgent, aiAnalysis, setCategory, setLocation, setNote, setUrgent } = report;

  const canSubmit = photo && category && location;
  const selectedCategory = ISSUE_CATEGORIES.find(c => c.id === category);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      // Combine AI description with user notes
      const fullNote = aiAnalysis
        ? `[AI: ${aiAnalysis.description}]${note ? ' | ' + note : ''}`
        : note;

      await saveReport({
        timestamp: new Date().toLocaleString(),
        campus: campus?.name || '',
        photo,
        category,
        location,
        note: fullNote,
        urgent,
        team: selectedCategory?.team || 'Facilities',
        status: 'open',
        campusData: campus,
        aiAnalysis: aiAnalysis || null
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', paddingBottom: '100px' }}>
      <Header
        title="Issue Details"
        subtitle={campus?.name || ''}
        variant="red"
        onBack={() => navigate('/report/photo')}
      />

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Photo Preview with AI Info */}
        {photo && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={photo}
                alt="Issue"
                style={{
                  width: '64px',
                  height: '64px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginRight: '14px'
                }}
              />
              <div>
                <div style={{ fontSize: '15px', color: '#666' }}>Photo captured ✓</div>
                {aiAnalysis && (
                  <div style={{ fontSize: '13px', color: '#0369a1', marginTop: '4px' }}>
                    🤖 AI: "{aiAnalysis.description}"
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Issue Type Selection */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '17px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '10px'
          }}>
            What type of issue? *
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            {ISSUE_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                style={{
                  padding: '14px 10px',
                  borderRadius: '12px',
                  border: category === cat.id ? '2px solid #2B57D0' : '2px solid #e5e7eb',
                  backgroundColor: category === cat.id ? 'rgba(194, 236, 253, 0.3)' : '#fff',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '6px' }}>{cat.icon}</div>
                <div style={{ fontSize: '14px', color: '#374151' }}>{cat.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Location Input */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '17px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '10px'
          }}>
            Location *
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., 2nd floor restroom, Room 204"
            style={{
              width: '100%',
              border: '1px solid #ccc',
              borderRadius: '10px',
              padding: '14px 16px',
              fontSize: '17px',
              boxSizing: 'border-box',
              backgroundColor: '#fff'
            }}
          />
        </div>

        {/* Notes Input */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '17px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '10px'
          }}>
            Notes (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any additional details..."
            rows={2}
            style={{
              width: '100%',
              border: '1px solid #ccc',
              borderRadius: '10px',
              padding: '14px 16px',
              fontSize: '17px',
              boxSizing: 'border-box',
              backgroundColor: '#fff',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Urgent Toggle */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <label
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => setUrgent(!urgent)}
          >
            <div style={{
              width: '52px',
              height: '28px',
              borderRadius: '14px',
              marginRight: '14px',
              backgroundColor: urgent ? '#2B57D0' : '#d1d5db',
              position: 'relative',
              transition: 'background-color 0.2s'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#fff',
                borderRadius: '50%',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                position: 'absolute',
                top: '2px',
                left: urgent ? '26px' : '2px',
                transition: 'left 0.2s'
              }} />
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '17px', color: '#333' }}>🚨 Urgent / Safety</div>
              <div style={{ fontSize: '15px', color: '#666', marginTop: '2px' }}>
                Requires immediate attention
              </div>
            </div>
          </label>
        </div>

        {/* Routes To Info */}
        {category && (
          <div style={{
            backgroundColor: 'rgba(194, 236, 253, 0.3)',
            borderRadius: '12px',
            padding: '14px 16px',
            border: '1px solid #47C4E6'
          }}>
            <div style={{ fontSize: '15px', color: '#141685' }}>
              <strong>Routes to:</strong> {selectedCategory?.team || 'Facilities'}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Button */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTop: '1px solid #e5e7eb',
        padding: '16px 20px'
      }}>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '700',
            border: 'none',
            cursor: canSubmit && !submitting ? 'pointer' : 'not-allowed',
            backgroundColor: canSubmit && !submitting ? '#092849' : '#d1d5db',
            color: canSubmit && !submitting ? '#fff' : '#9ca3af'
          }}
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
