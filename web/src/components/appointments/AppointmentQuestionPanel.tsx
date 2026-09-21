// src/components/appointments/AppointmentQuestionPanel.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export interface AppointmentItem {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  time: string;
  reason: string;
  status: 'Confirmed' | 'Pending';
}

interface AppointmentQuestionPanelProps {
  appointment: AppointmentItem;
  questions: string[];
  onAddQuestion: (aptId: string, question: string) => void;
  onRemoveQuestion: (aptId: string, idx: number) => void;
  onConfirmAppointment: (aptId: string) => void;
}

export const AppointmentQuestionPanel: React.FC<AppointmentQuestionPanelProps> = ({
  appointment,
  questions,
  onAddQuestion,
  onRemoveQuestion,
  onConfirmAppointment
}) => {
  const navigate = useNavigate();
  const [newQuestion, setNewQuestion] = useState('');

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    onAddQuestion(appointment.id, newQuestion.trim());
    setNewQuestion('');
  };

  return (
    <Card style={{ padding: '24px', backgroundColor: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              👤 {appointment.patientName}
            </span>
            <Badge variant={appointment.status === 'Confirmed' ? 'success' : 'warning'}>
              {appointment.status}
            </Badge>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
            📅 {appointment.date} | ⏰ {appointment.time}
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate(`/patient/${appointment.patientId}`)}
        >
          Open Health Ledger
        </Button>
      </div>

      {appointment.status === 'Pending' && (
        <div style={{
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '8px',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '12px', color: '#F59E0B', fontWeight: 600 }}>
            ⏳ Appointment pending doctor confirmation.
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onConfirmAppointment(appointment.id)}
            style={{ backgroundColor: '#10B981', color: '#ffffff', border: 'none', fontWeight: 700 }}
          >
            ✓ Confirm Appointment
          </Button>
        </div>
      )}

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
          AI Pre-Appointment Intake Questions
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: 1.4 }}>
          Questions queued here will be prompted to <strong>{appointment.patientName}</strong> by the Swasthya AI voice/chat agent during daily mobile app check-ins prior to consultation.
        </p>

        <form onSubmit={handleAddQuestion} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <Input
            placeholder="e.g. Have you experienced any headaches after taking medication?"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            style={{ flex: 1 }}
          />
          <Button type="submit" variant="primary">Add Queue</Button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {questions.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic', padding: '16px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              No custom questions queued for this patient.
            </div>
          ) : (
            questions.map((q, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  gap: '12px'
                }}
              >
                <span style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.4, fontWeight: 600 }}>
                  • {q}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveQuestion(appointment.id, idx)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#EF4444',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
};

export default AppointmentQuestionPanel;

