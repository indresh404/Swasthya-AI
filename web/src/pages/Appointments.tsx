// src/pages/Appointments.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mainPatient } from '../data/clinicalData';
import AppointmentQuestionPanel, { AppointmentItem } from '../components/appointments/AppointmentQuestionPanel';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export const Appointments: React.FC = () => {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<AppointmentItem[]>([
    {
      id: "apt-1",
      patientName: mainPatient.name,
      patientId: mainPatient.id,
      date: "2026-06-25",
      time: "10:30 AM",
      reason: "Follow-up on HbA1c levels and chronic fatigue analysis.",
      status: "Confirmed"
    },
    {
      id: "apt-2",
      patientName: "Anjali Deshmukh",
      patientId: "p-3",
      date: "2026-06-26",
      time: "02:00 PM",
      reason: "Routine hypertension medication adjustment & BP monitoring review.",
      status: "Pending"
    },
    {
      id: "apt-3",
      patientName: "Karan Mehta",
      patientId: "p-2",
      date: "2026-06-27",
      time: "11:15 AM",
      reason: "Post-op asthma exacerbation and inhaler compliance check.",
      status: "Confirmed"
    },
    {
      id: "apt-4",
      patientName: "Ramesh Sawant",
      patientId: "p-4",
      date: "2026-06-28",
      time: "04:30 PM",
      reason: "Evaluation of recent chest discomfort and statin tolerance.",
      status: "Pending"
    }
  ]);

  const [questionsMap, setQuestionsMap] = useState<Record<string, string[]>>({
    "apt-1": [
      "Have you noticed any shortness of breath when experiencing mid-day fatigue?",
      "Are you taking your Metformin doses consistently with meals?"
    ],
    "apt-2": [
      "Have you experienced any morning headaches or dizziness after taking your BP medication?",
      "Have you been recording your daily morning and evening blood pressure logs?"
    ],
    "apt-3": [
      "How many times in the past week did you need to use your rescue inhaler?",
      "Are you experiencing nocturnal awakenings or chest tightness at night?"
    ],
    "apt-4": [
      "Did the chest discomfort occur during physical exertion or at rest?",
      "Have you noticed any muscle soreness or weakness since starting the revised statin?"
    ]
  });

  const [expandedAptId, setExpandedAptId] = useState<string | null>("apt-1");

  const selectedApt = appointments.find((a) => a.id === expandedAptId);

  const handleAddQuestion = (aptId: string, question: string) => {
    setQuestionsMap((prev) => ({
      ...prev,
      [aptId]: [...(prev[aptId] || []), question]
    }));
  };

  const handleRemoveQuestion = (aptId: string, idx: number) => {
    setQuestionsMap((prev) => ({
      ...prev,
      [aptId]: (prev[aptId] || []).filter((_, i) => i !== idx)
    }));
  };

  const handleConfirmAppointment = (aptId: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === aptId ? { ...apt, status: 'Confirmed' } : apt))
    );
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
          Appointments Calendar & Pre-Intake Engine
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
          Manage your schedule, confirm pending patient bookings, and queue clinical intake questions for AI mobile check-ins.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }} className="appointments-grid-responsive">
        {/* Left Column: Appointments List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {appointments.map((apt) => {
            const isExpanded = expandedAptId === apt.id;
            return (
              <Card
                key={apt.id}
                style={{
                  padding: '20px',
                  backgroundColor: 'var(--surface)',
                  border: isExpanded ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease'
                }}
                onClick={() => setExpandedAptId(isExpanded ? null : apt.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      👤 {apt.patientName}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      📅 {apt.date} | ⏰ {apt.time}
                    </span>
                  </div>
                  <Badge variant={apt.status === 'Confirmed' ? 'success' : 'warning'}>
                    {apt.status}
                  </Badge>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Clinical Context / Reason:</strong>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                        {apt.reason}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/patient/${apt.patientId}`);
                        }}
                      >
                        Open Health Ledger
                      </Button>
                      {apt.status === 'Pending' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConfirmAppointment(apt.id);
                          }}
                          style={{ backgroundColor: '#10B981', color: '#ffffff', border: 'none', fontWeight: 700 }}
                        >
                          Confirm
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedAptId(null);
                        }}
                      >
                        Collapse Detail
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Right Column: Pre-Appointment Q&A Queue */}
        <div>
          {selectedApt ? (
            <AppointmentQuestionPanel
              appointment={selectedApt}
              questions={questionsMap[selectedApt.id] || []}
              onAddQuestion={handleAddQuestion}
              onRemoveQuestion={handleRemoveQuestion}
              onConfirmAppointment={handleConfirmAppointment}
            />
          ) : (
            <Card style={{ padding: '32px 24px', backgroundColor: 'var(--surface)', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '36px' }}>📅</span>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '16px 0 8px 0', color: 'var(--text-primary)' }}>
                Select an Appointment
              </h3>
              <p style={{ fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
                Click any patient appointment on the left to view clinical reasons, confirm pending bookings, and configure AI pre-visit intake questions.
              </p>
            </Card>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .appointments-grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Appointments;