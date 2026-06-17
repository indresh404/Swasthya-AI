// app/components/profile/MedicalInformationCard.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#0474FC',
  primaryLight: '#E8F1FE',
  card: '#FFFFFF',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    light: '#9CA3AF',
  },
  divider: '#E5E7EB',
};

export interface MedicalInfo {
  age: string;
  gender: string;
  weight: string;
  height: string;
  bloodType: string;
  allergies: string;
  bloodPressure?: string;
  heartRate?: string;
  oxygenLevel?: string;
  surgeries?: string;
  chronicConditions?: string;
  vaccinations?: string;
}

interface MedicalInformationCardProps {
  initialInfo: MedicalInfo;
  onSave: (info: MedicalInfo) => void;
}

export const MedicalInformationCard: React.FC<MedicalInformationCardProps> = ({
  initialInfo,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<MedicalInfo>(initialInfo);

  useEffect(() => {
    setFormData(initialInfo);
  }, [initialInfo]);

  const calculateBMI = (weight: string, height: string) => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!w || !h || h <= 0) return { bmi: '--', status: 'Unknown', color: COLORS.text.secondary };

    const heightInMeters = h / 100;
    const bmiVal = w / (heightInMeters * heightInMeters);
    const bmi = bmiVal.toFixed(1);

    let status = 'Normal';
    let color = '#10B981';

    if (bmiVal < 18.5) {
      status = 'Underweight';
      color = '#3B82F6';
    } else if (bmiVal >= 25 && bmiVal < 30) {
      status = 'Overweight';
      color = '#F59E0B';
    } else if (bmiVal >= 30) {
      status = 'Obese';
      color = '#EF4444';
    }

    return { bmi, status, color };
  };

  const bmiDetails = calculateBMI(formData.weight, formData.height);

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="medical-outline" size={22} color={COLORS.primary} />
          <Text style={styles.title}>Medical Information</Text>
        </View>
        {!isEditing && (
          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Ionicons name="create-outline" size={16} color={COLORS.primary} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {isEditing ? (
        <View style={styles.form}>
          <View style={styles.inputGroupRow}>
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>Age (yrs)</Text>
              <TextInput
                style={styles.input}
                value={formData.age}
                onChangeText={(val) => setFormData({ ...formData, age: val })}
                keyboardType="numeric"
                placeholder="Age"
                placeholderTextColor={COLORS.text.light}
              />
            </View>
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>Gender</Text>
              <TextInput
                style={styles.input}
                value={formData.gender}
                onChangeText={(val) => setFormData({ ...formData, gender: val })}
                placeholder="Gender"
                placeholderTextColor={COLORS.text.light}
              />
            </View>
          </View>

          <View style={styles.inputGroupRow}>
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={formData.weight}
                onChangeText={(val) => setFormData({ ...formData, weight: val })}
                keyboardType="numeric"
                placeholder="Weight"
                placeholderTextColor={COLORS.text.light}
              />
            </View>
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                value={formData.height}
                onChangeText={(val) => setFormData({ ...formData, height: val })}
                keyboardType="numeric"
                placeholder="Height"
                placeholderTextColor={COLORS.text.light}
              />
            </View>
          </View>

          <View style={styles.inputGroupRow}>
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>Blood Pressure</Text>
              <TextInput
                style={styles.input}
                value={formData.bloodPressure}
                onChangeText={(val) => setFormData({ ...formData, bloodPressure: val })}
                placeholder="e.g. 120/80"
                placeholderTextColor={COLORS.text.light}
              />
            </View>
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>Heart Rate (bpm)</Text>
              <TextInput
                style={styles.input}
                value={formData.heartRate}
                onChangeText={(val) => setFormData({ ...formData, heartRate: val })}
                keyboardType="numeric"
                placeholder="e.g. 72"
                placeholderTextColor={COLORS.text.light}
              />
            </View>
          </View>

          <View style={styles.inputGroupRow}>
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>Oxygen (SpO2 %)</Text>
              <TextInput
                style={styles.input}
                value={formData.oxygenLevel}
                onChangeText={(val) => setFormData({ ...formData, oxygenLevel: val })}
                keyboardType="numeric"
                placeholder="e.g. 98"
                placeholderTextColor={COLORS.text.light}
              />
            </View>
            <View style={styles.inputGroupHalf}>
              <Text style={styles.label}>Blood Type</Text>
              <TextInput
                style={styles.input}
                value={formData.bloodType}
                onChangeText={(val) => setFormData({ ...formData, bloodType: val })}
                placeholder="e.g. O+"
                placeholderTextColor={COLORS.text.light}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Chronic Conditions</Text>
            <TextInput
              style={styles.input}
              value={formData.chronicConditions}
              onChangeText={(val) => setFormData({ ...formData, chronicConditions: val })}
              placeholder="e.g. Hypertension, Type-2 Diabetes"
              placeholderTextColor={COLORS.text.light}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Surgeries</Text>
            <TextInput
              style={styles.input}
              value={formData.surgeries}
              onChangeText={(val) => setFormData({ ...formData, surgeries: val })}
              placeholder="e.g. Appendectomy (2021)"
              placeholderTextColor={COLORS.text.light}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vaccinations</Text>
            <TextInput
              style={styles.input}
              value={formData.vaccinations}
              onChangeText={(val) => setFormData({ ...formData, vaccinations: val })}
              placeholder="e.g. Covid-19, BCG, Hepatitis B"
              placeholderTextColor={COLORS.text.light}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Allergies</Text>
            <TextInput
              style={styles.input}
              value={formData.allergies}
              onChangeText={(val) => setFormData({ ...formData, allergies: val })}
              placeholder="e.g. Penicillin, Peanuts"
              placeholderTextColor={COLORS.text.light}
              multiline
            />
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setFormData(initialInfo);
                setIsEditing(false);
              }}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.detailsList}>
          <View style={styles.row}>
            <View style={styles.cell}>
              <Text style={styles.cellLabel}>Age</Text>
              <Text style={styles.cellValue}>{formData.age || '--'} yrs</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.cell}>
              <Text style={styles.cellLabel}>Gender</Text>
              <Text style={styles.cellValue}>{formData.gender || '--'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.cell}>
              <Text style={styles.cellLabel}>Weight</Text>
              <Text style={styles.cellValue}>{formData.weight || '--'} kg</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.cell}>
              <Text style={styles.cellLabel}>Height</Text>
              <Text style={styles.cellValue}>{formData.height || '--'} cm</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.cell}>
              <Text style={styles.cellLabel}>Blood Type</Text>
              <Text style={styles.cellValue}>{formData.bloodType || 'Not set'}</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.cell}>
              <Text style={styles.cellLabel}>BMI Status</Text>
              <View style={styles.bmiContainer}>
                <Text style={styles.cellValue}>{bmiDetails.bmi}</Text>
                {bmiDetails.bmi !== '--' && (
                  <View style={[styles.bmiStatusBadge, { backgroundColor: bmiDetails.color }]}>
                    <Text style={styles.bmiStatusText}>{bmiDetails.status}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.cell}>
              <Text style={styles.cellLabel}>Blood Pressure</Text>
              <Text style={styles.cellValue}>{formData.bloodPressure || 'Not checked'}</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.cell}>
              <Text style={styles.cellLabel}>Heart Rate</Text>
              <Text style={styles.cellValue}>{formData.heartRate ? `${formData.heartRate} bpm` : 'Not checked'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.fullRow}>
            <Text style={styles.cellLabel}>Oxygen Saturation (SpO2)</Text>
            <Text style={styles.cellValueText}>{formData.oxygenLevel ? `${formData.oxygenLevel}%` : 'Not checked'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.fullRow}>
            <Text style={styles.cellLabel}>Chronic Conditions</Text>
            <Text style={styles.cellValueText}>{formData.chronicConditions || 'None reported'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.fullRow}>
            <Text style={styles.cellLabel}>Surgeries</Text>
            <Text style={styles.cellValueText}>{formData.surgeries || 'None'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.fullRow}>
            <Text style={styles.cellLabel}>Vaccinations</Text>
            <Text style={styles.cellValueText}>{formData.vaccinations || 'None listed'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.fullRow}>
            <Text style={styles.cellLabel}>Allergies</Text>
            <Text style={[styles.cellValueText, formData.allergies ? styles.allergiesText : styles.noAllergiesText]}>
              {formData.allergies || 'No known allergies listed.'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  detailsList: {
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  cell: {
    flex: 1,
  },
  cellLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  cellValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  verticalDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.divider,
    marginHorizontal: 16,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
  },
  bmiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bmiStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bmiStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fullRow: {
    paddingVertical: 12,
  },
  cellValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 4,
    lineHeight: 20,
  },
  allergiesText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  noAllergiesText: {
    color: COLORS.text.secondary,
    fontWeight: '400',
  },
  form: {
    marginTop: 8,
  },
  inputGroupRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputGroupHalf: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default MedicalInformationCard;