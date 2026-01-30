import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import {
  CheckSquare,
  Building2,
  Lock,
  Armchair,
  UtensilsCrossed,
  Hospital,
  Cog,
  Globe,
  Clock,
  ChevronRight
} from 'lucide-react';

const AUDIT_CATEGORIES = [
  {
    title: 'Daily Audits',
    description: 'Quick checks to verify vendor and system performance',
    audits: [
      {
        path: '/audit/setup',
        Icon: CheckSquare,
        label: 'Cleanliness Audit',
        description: 'Verify overnight cleaning vendor work',
        color: '#10b981',
        time: '15-20 min'
      }
    ]
  },
  {
    title: 'Weekly Audits',
    description: 'Detailed inspections of building systems and grounds',
    audits: [
      {
        path: '/bg/setup',
        Icon: Building2,
        label: 'Building & Grounds',
        description: 'Landscaping, hardscapes, exterior',
        color: '#6366f1',
        time: '30-45 min'
      },
      {
        path: '/mechanical',
        Icon: Cog,
        label: 'Mechanical Systems',
        description: 'HVAC, plumbing, electrical',
        color: '#71717a',
        time: '30-45 min'
      }
    ]
  },
  {
    title: 'Periodic Audits',
    description: 'Comprehensive compliance and quality reviews',
    audits: [
      {
        path: '/security',
        Icon: Lock,
        label: 'Security Compliance',
        description: 'Access control, cameras, protocols',
        color: '#eab308',
        time: 'Varies by type'
      },
      {
        path: '/health-safety',
        Icon: Hospital,
        label: 'Health & Safety',
        description: 'Safety equipment, emergency readiness',
        color: '#ef4444',
        time: '45-60 min'
      },
      {
        path: '/furniture',
        Icon: Armchair,
        label: 'Furniture & Decor',
        description: 'Interior design standards',
        color: '#8b5cf6',
        time: '30-45 min'
      },
      {
        path: '/food-safety',
        Icon: UtensilsCrossed,
        label: 'Food Service',
        description: 'Kitchen, storage, dining areas',
        color: '#64748b',
        time: '20-30 min'
      }
    ]
  },
  {
    title: 'External Tools',
    description: 'Dashboards and monitoring systems',
    audits: [
      {
        path: 'https://internet-audit-dashboard.vercel.app/',
        Icon: Globe,
        label: 'Internet Dashboard',
        description: 'Connectivity monitoring',
        color: '#0ea5e9',
        external: true
      }
    ]
  }
];

export const OpsAudits = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        title="Ops Audits"
        subtitle="Detailed facility assessments"
        onBack={() => navigate('/')}
      />

      <div style={{ padding: '20px' }}>
        {/* Info Card */}
        <div style={{
          backgroundColor: 'rgba(194, 236, 253, 0.4)',
          border: '1px solid #47C4E6',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '14px', color: '#0369a1' }}>
            These are detailed audit checklists for periodic assessment. For daily oversight, use the <strong>Green Streak Walk</strong> instead.
          </div>
        </div>

        {/* Audit Categories */}
        {AUDIT_CATEGORIES.map((category, catIdx) => (
          <div key={catIdx} style={{ marginBottom: '24px' }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#092849',
              marginBottom: '4px'
            }}>
              {category.title}
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#666',
              marginBottom: '12px'
            }}>
              {category.description}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {category.audits.map((audit) => {
                const IconComponent = audit.Icon;

                const content = (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    transition: 'transform 0.1s, box-shadow 0.1s'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: audit.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '14px',
                      flexShrink: 0
                    }}>
                      <IconComponent size={24} color="#fff" />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#092849',
                        marginBottom: '2px'
                      }}>
                        {audit.label}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#666'
                      }}>
                        {audit.description}
                      </div>
                      {audit.time && (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginTop: '6px',
                          fontSize: '12px',
                          color: '#999'
                        }}>
                          <Clock size={12} />
                          {audit.time}
                        </div>
                      )}
                    </div>

                    <ChevronRight size={20} color="#ccc" />
                  </div>
                );

                if (audit.external) {
                  return (
                    <a
                      key={audit.path}
                      href={audit.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none' }}
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <div
                    key={audit.path}
                    onClick={() => navigate(audit.path)}
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
