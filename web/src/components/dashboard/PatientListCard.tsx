// src/components/dashboard/PatientListCard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { mainPatient, otherPatients } from '../../data/clinicalData';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -15 },
  show: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring" as const,
      damping: 18,
      stiffness: 100
    }
  }
};

export const PatientListCard: React.FC = () => {
  const navigate = useNavigate();

  const getRiskVariant = (risk: string) => {
    if (risk === 'Low') return 'success';
    if (risk === 'Moderate') return 'warning';
    if (risk === 'Elevated') return 'error';
    return 'error';
  };

  return (
    <Card style={{ padding: '24px', backgroundColor: 'var(--surface)' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
        Active Patients
      </h3>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        {/* Indresh Suresh (Full Profile Route) */}
        <motion.div
          variants={itemVariants}
          onClick={() => navigate(`/patient/${mainPatient.id}`)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 18px',
            borderRadius: 'var(--radius)',
            border: '1.5px solid var(--accent)',
            backgroundColor: 'var(--bg-secondary)',
            cursor: 'pointer',
            transition: 'transform 0.15s'
          }}
          className="patient-list-item"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
              👤 {mainPatient.name}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Age: {mainPatient.age} | {mainPatient.phone}
            </span>
          </div>
          <Badge variant={getRiskVariant(mainPatient.riskLevel)}>{mainPatient.riskLevel} Risk</Badge>
        </motion.div>

        {/* Other Patients (Dynamic Patient Profiles) */}
        {otherPatients.map((p) => (
          <motion.div
            key={p.id}
            variants={itemVariants}
            onClick={() => navigate(`/patient/${p.id}`)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 18px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              cursor: 'pointer',
              transition: 'transform 0.15s'
            }}
            className="patient-list-item"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                👤 {p.name}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Age: {p.age} | {p.phone}
              </span>
            </div>
            <Badge variant={getRiskVariant(p.riskLevel)}>{p.riskLevel} Risk</Badge>
          </motion.div>
        ))}
      </motion.div>

      <style>{`
        .patient-list-item:hover {
          transform: translateX(4px);
        }
      `}</style>
    </Card>
  );
};

export default PatientListCard;
