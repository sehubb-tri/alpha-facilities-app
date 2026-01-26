import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { supabase } from '../supabase/config';
import { ISSUE_CATEGORIES } from '../data/issueCategories';
import { updateReportStatus } from '../supabase/services';

export const ReportView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadReport = async () => {
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        // Map snake_case to camelCase
        setReport({
          id: data.id,
          timestamp: data.timestamp,
          campus: data.campus,
          photo: data.photo,
          category: data.category,
          location: data.location,
          note: data.note,
          urgent: data.urgent,
          team: data.team,
          status: data.status,
          campusData: data.campus_data,
          createdAt: data.created_at
        });
      } catch (error) {
        console.error('Error loading report:', error);
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (!report || updating) return;

    setUpdating(true);
    try {
      await updateReportStatus(report.id, newStatus);
      setReport({ ...report, status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const category = report ? (ISSUE_CATEGORIES.find(c => c.id === report.category) || {
    icon: '📸',
    name: 'See It, Report It'
  }) : null;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <Header title="Report Details" onBack={() => navigate(-1)} />
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>Loading...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <Header title="Report Details" onBack={() => navigate(-1)} />
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>Report not found</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <Header title="Report Details" onBack={() => navigate(-1)} />

      <div style={{ padding: '20px' }}>
        {/* Status Banner */}
        <div style={{
          backgroundColor: report.urgent ? '#fee2e2' : report.status === 'open' ? '#C2ECFD' : '#dcfce7',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '56px', marginBottom: '12px' }}>
            {report.urgent ? '🚨' : category?.icon}
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: report.urgent ? '#b91c1c' : '#092849'
          }}>
            {category?.name}
          </div>
          {report.urgent && (
            <div style={{
              fontSize: '15px',
              color: '#b91c1c',
              marginTop: '8px',
              fontWeight: '600'
            }}>
              URGENT / SAFETY ISSUE
            </div>
          )}
          <div style={{
            display: 'inline-block',
            marginTop: '12px',
            padding: '6px 16px',
            borderRadius: '20px',
            backgroundColor: report.status === 'open' ? '#47C4E6' : '#10b981',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            {report.status}
          </div>
        </div>

        {/* Photo */}
        {report.photo && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#092849', marginBottom: '12px' }}>
              Photo
            </h3>
            <img
              src={report.photo}
              alt="Reported issue"
              style={{
                width: '100%',
                maxHeight: '400px',
                objectFit: 'contain',
                borderRadius: '8px',
                backgroundColor: '#f3f4f6'
              }}
            />
          </div>
        )}

        {/* Report Info Card */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#092849', marginBottom: '16px' }}>
            Report Details
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Campus</span>
              <span style={{ fontWeight: '600', color: '#092849' }}>{report.campus}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Location</span>
              <span style={{ fontWeight: '600', color: '#092849' }}>{report.location}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Category</span>
              <span style={{ fontWeight: '600', color: '#092849' }}>
                {category?.icon} {category?.name}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Assigned To</span>
              <span style={{ fontWeight: '600', color: '#092849' }}>{report.team || 'Facilities'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Reported</span>
              <span style={{ fontWeight: '600', color: '#092849' }}>{report.timestamp}</span>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {report.note && (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#092849', marginBottom: '12px' }}>
              Notes
            </h3>
            <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.5', margin: 0 }}>
              {report.note}
            </p>
          </div>
        )}

        {/* Status Actions */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#092849', marginBottom: '16px' }}>
            Update Status
          </h3>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => handleStatusChange('open')}
              disabled={report.status === 'open' || updating}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '10px',
                border: report.status === 'open' ? '2px solid #47C4E6' : '2px solid #e5e7eb',
                backgroundColor: report.status === 'open' ? '#C2ECFD' : '#fff',
                color: '#092849',
                fontSize: '15px',
                fontWeight: '600',
                cursor: report.status === 'open' || updating ? 'not-allowed' : 'pointer',
                opacity: updating ? 0.6 : 1
              }}
            >
              Open
            </button>
            <button
              onClick={() => handleStatusChange('resolved')}
              disabled={report.status === 'resolved' || updating}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '10px',
                border: report.status === 'resolved' ? '2px solid #10b981' : '2px solid #e5e7eb',
                backgroundColor: report.status === 'resolved' ? '#dcfce7' : '#fff',
                color: '#092849',
                fontSize: '15px',
                fontWeight: '600',
                cursor: report.status === 'resolved' || updating ? 'not-allowed' : 'pointer',
                opacity: updating ? 0.6 : 1
              }}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            width: '100%',
            backgroundColor: '#092849',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '17px',
            fontWeight: '700',
            border: 'none',
            cursor: 'pointer',
            marginTop: '8px'
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
};
