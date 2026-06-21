-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.patients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  age integer,
  phone_number text NOT NULL UNIQUE,
  gender text,
  location text,
  created_at timestamp with time zone DEFAULT now(),
  risk_level text DEFAULT 'Low'::text,
  CONSTRAINT patients_pkey PRIMARY KEY (id)
);
CREATE TABLE public.family_groups (
  id text NOT NULL DEFAULT (gen_random_uuid())::text,
  family_name text NOT NULL,
  family_code text NOT NULL UNIQUE CHECK (family_code ~ '^[0-9]{6}$'::text),
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  health_summary text,
  CONSTRAINT family_groups_pkey PRIMARY KEY (id),
  CONSTRAINT family_groups_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.patients(id)
);
CREATE TABLE public.family_members (
  id text NOT NULL DEFAULT (gen_random_uuid())::text,
  family_id text NOT NULL,
  patient_id uuid NOT NULL,
  role text DEFAULT 'member'::text,
  joined_at timestamp with time zone DEFAULT now(),
  health_summary text,
  CONSTRAINT family_members_pkey PRIMARY KEY (id),
  CONSTRAINT family_members_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.family_groups(id),
  CONSTRAINT family_members_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE TABLE public.medical_information (
  id text NOT NULL DEFAULT (gen_random_uuid())::text,
  patient_id uuid NOT NULL UNIQUE,
  weight text,
  height text,
  blood_type text,
  allergies text,
  blood_pressure text,
  heart_rate text,
  oxygen_level text,
  surgeries text,
  chronic_conditions text,
  vaccinations text,
  family_genetics text,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT medical_information_pkey PRIMARY KEY (id),
  CONSTRAINT medical_information_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE TABLE public.Medicines (
  sub_category text,
  product_name text,
  salt_composition text,
  product_price text,
  product_manufactured text,
  medicine_desc text,
  side_effects text,
  drug_interactions jsonb,
  Id uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT Medicines_pkey PRIMARY KEY (Id)
);
CREATE TABLE public.daily_health_summaries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL,
  summary_date date NOT NULL DEFAULT CURRENT_DATE,
  summary_text text NOT NULL,
  symptoms_reported ARRAY,
  facts_mentioned ARRAY,
  surgeries_mentioned ARRAY,
  medications_mentioned ARRAY,
  mood_indicator text,
  data_importance_score integer,
  chat_messages_count integer DEFAULT 0,
  important_data_found boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT daily_health_summaries_pkey PRIMARY KEY (id),
  CONSTRAINT daily_summaries_patient_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE TABLE public.doctor_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  full_name text NOT NULL,
  date_of_birth date,
  email text,
  phone_number text,
  gender text,
  languages text,
  specialization text,
  qualification text,
  registration_number text,
  years_of_experience text,
  about_me text,
  consultation_fee text,
  timings text,
  role text DEFAULT 'doctor'::text,
  is_verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT doctor_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT doctor_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.Janaushadhi (
  Sr No bigint NOT NULL,
  Drug Code bigint,
  Generic Name text,
  Unit Size text,
  MRP double precision,
  Group Name text,
  CONSTRAINT Janaushadhi_pkey PRIMARY KEY (Sr No)
);