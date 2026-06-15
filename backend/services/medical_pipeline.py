import datetime
import json
from services.supabase_service import supabase
from services.llm_service import LLMService

class MedicalPipeline:
    @staticmethod
    def map_severity_to_int(severity_str) -> int:
        """
        Maps string severity values ('mild', 'moderate', 'severe') or digits to integers.
        """
        if not severity_str:
            return 5  # default moderate
        
        sev_str = str(severity_str).strip().lower()
        if sev_str == 'mild':
            return 3
        elif sev_str == 'moderate':
            return 6
        elif sev_str == 'severe':
            return 9
        
        # Try to parse as integer
        try:
            val = int(''.join(c for c in sev_str if c.isdigit()))
            return max(1, min(10, val))
        except ValueError:
            return 5

    @classmethod
    async def process_message_pipeline(cls, patient_id: str, session_id: str, message: str) -> dict:
        """
        Master pipeline that handles:
        1. Combined LLM call (conversational reply + clinical extraction)
        2. Database persistence of user and assistant messages
        3. Symptom duration tracking and updates
        4. Historical symptom mentions logging
        5. Periodic clinical summaries generation (every 5 turns)
        """
        print(f"[MedicalPipeline] Processing message for patient {patient_id}, session {session_id}...")

        # 0. Check for inactivity timeout (10 minutes)
        try:
            last_msg_res = supabase.table("chat_messages")\
                .select("*")\
                .eq("patient_id", patient_id)\
                .order("created_at", desc=True)\
                .limit(1)\
                .execute()
            if last_msg_res.data:
                last_msg = last_msg_res.data[0]
                created_at_str = last_msg.get("created_at")
                if created_at_str:
                    clean_date_str = created_at_str.split("+")[0].split("Z")[0]
                    last_msg_time = datetime.datetime.fromisoformat(clean_date_str)
                    now_time = datetime.datetime.utcnow()
                    diff = now_time - last_msg_time
                    if diff.total_seconds() > 600:
                        # Check if a summary was already generated after this message
                        summary_res = supabase.table("conversation_summaries")\
                            .select("created_at")\
                            .eq("patient_id", patient_id)\
                            .order("created_at", desc=True)\
                            .limit(1)\
                            .execute()
                        should_generate = True
                        if summary_res.data:
                            latest_summary_time_str = summary_res.data[0].get("created_at")
                            if latest_summary_time_str:
                                clean_sum_str = latest_summary_time_str.split("+")[0].split("Z")[0]
                                latest_summary_time = datetime.datetime.fromisoformat(clean_sum_str)
                                if latest_summary_time > last_msg_time:
                                    should_generate = False
                        
                        if should_generate:
                            print(f"[MedicalPipeline] Inactivity timeout ({diff.total_seconds()}s). Generating summary for previous session: {last_msg.get('session_id')}")
                            await cls.generate_and_store_summary(patient_id, last_msg.get("session_id"))
        except Exception as e:
            print(f"[MedicalPipeline] Error checking inactivity timeout: {e}")

        # 1. Combined LLM Call
        llm_res = await LLMService.extract_medical_info(message)
        bot_reply = llm_res.get("conversational_response", "I have noted that. How else can I help you?")
        is_medical = llm_res.get("is_medical", False)

        # 2. Persist User Message to chat_messages
        user_msg_id = None
        try:
            user_msg_payload = {
                "patient_id": patient_id,
                "session_id": session_id,
                "sender": "user",
                "content": message
            }
            res_user = supabase.table("chat_messages").insert(user_msg_payload).execute()
            if res_user.data:
                user_msg_id = res_user.data[0].get("id")
                print(f"[MedicalPipeline] Saved user message: {user_msg_id}")
        except Exception as e:
            print(f"[MedicalPipeline] Error saving user message: {e}")

        # Persist Assistant Message to chat_messages
        assistant_msg_id = None
        try:
            assistant_msg_payload = {
                "patient_id": patient_id,
                "session_id": session_id,
                "sender": "assistant",
                "content": bot_reply
            }
            res_ast = supabase.table("chat_messages").insert(assistant_msg_payload).execute()
            if res_ast.data:
                assistant_msg_id = res_ast.data[0].get("id")
                print(f"[MedicalPipeline] Saved assistant message: {assistant_msg_id}")
        except Exception as e:
            print(f"[MedicalPipeline] Error saving assistant message: {e}")

        # 3 & 4. Process Symptom Resolution & Tracking
        save_status = {
            "action": "none",
            "symptoms_updated": [],
            "symptoms_created": [],
            "symptoms_resolved": [],
            "message": "No medical updates saved."
        }

        if is_medical:
            print("[MedicalPipeline] Clinical information detected. Resolving symptoms...")
            extracted_symptoms = llm_res.get("symptoms") or []
            # Fallback if it's a single string instead of list
            if isinstance(extracted_symptoms, str):
                extracted_symptoms = [extracted_symptoms]
            
            medications = llm_res.get("medications") or []
            allergies = llm_res.get("allergies") or []
            severity_str = llm_res.get("severity")
            resolved = llm_res.get("resolved", False)
            duration_days = llm_res.get("duration_days")

            severity_int = cls.map_severity_to_int(severity_str)
            now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

            # Update profile if medications or allergies are detected
            if medications or allergies:
                try:
                    profile_res = supabase.table("patient_profiles").select("*").eq("id", patient_id).execute()
                    profile_data = profile_res.data[0] if profile_res.data else {}
                    updated_fields = {}
                    
                    if medications:
                        new_meds = [m.strip() for m in medications if m.strip()]
                        if new_meds:
                            existing_meds_str = profile_data.get("current_medication") or ""
                            existing_meds = [m.strip() for m in existing_meds_str.split(",") if m.strip()]
                            for m in new_meds:
                                if m.lower() not in [em.lower() for em in existing_meds]:
                                    existing_meds.append(m)
                            updated_fields["current_medication"] = ", ".join(existing_meds)
                    
                    if allergies:
                        new_allergies = [a.strip() for a in allergies if a.strip()]
                        if new_allergies:
                            existing_allergies_str = profile_data.get("allergies") or ""
                            existing_allergies = [a.strip() for a in existing_allergies_str.split(",") if a.strip()]
                            for a in new_allergies:
                                if a.lower() not in [ea.lower() for ea in existing_allergies]:
                                    existing_allergies.append(a)
                            updated_fields["allergies"] = ", ".join(existing_allergies)
                    
                    if updated_fields:
                        updated_fields["updated_at"] = now_iso
                        if profile_res.data:
                            supabase.table("patient_profiles").update(updated_fields).eq("id", patient_id).execute()
                        else:
                            updated_fields["id"] = patient_id
                            supabase.table("patient_profiles").insert(updated_fields).execute()
                        print(f"[MedicalPipeline] Updated patient profile: {updated_fields}")
                except Exception as e:
                    print(f"[MedicalPipeline] Error updating patient profile: {e}")

            for sym in extracted_symptoms:
                sym_clean = sym.strip().lower()
                if not sym_clean:
                    continue

                try:
                    # Look for an existing active symptom for this patient
                    existing = supabase.table("symptoms")\
                        .select("*")\
                        .eq("patient_id", patient_id)\
                        .eq("symptom_name", sym_clean)\
                        .eq("status", "active")\
                        .execute()

                    symptom_id = None
                    if existing.data:
                        # Existing active symptom found
                        record = existing.data[0]
                        symptom_id = record["id"]

                        if resolved:
                            # Update status to resolved
                            supabase.table("symptoms").update({
                                "status": "resolved",
                                "last_reported_at": now_iso,
                                "updated_at": now_iso
                            }).eq("id", symptom_id).execute()
                            save_status["symptoms_resolved"].append(sym_clean)
                            print(f"[MedicalPipeline] Resolved active symptom: {sym_clean}")
                        else:
                            # Update active symptom duration
                            first_rep = datetime.datetime.fromisoformat(record["first_reported_at"].replace("Z", "+00:00"))
                            current_time = datetime.datetime.now(datetime.timezone.utc)
                            calc_duration = max(1, (current_time - first_rep).days + 1)
                            
                            # If duration was explicitly extracted, use the max of either
                            if duration_days:
                                try:
                                    calc_duration = max(calc_duration, int(duration_days))
                                except:
                                    pass

                            supabase.table("symptoms").update({
                                "last_reported_at": now_iso,
                                "duration_days": calc_duration,
                                "severity": severity_int,
                                "updated_at": now_iso
                            }).eq("id", symptom_id).execute()
                            save_status["symptoms_updated"].append(sym_clean)
                            print(f"[MedicalPipeline] Updated active symptom: {sym_clean} (Duration: {calc_duration} days)")
                    else:
                        # No active symptom found; create new one if not resolved
                        if not resolved:
                            new_duration = 1
                            if duration_days:
                                try:
                                    new_duration = int(duration_days)
                                except:
                                    pass
                            
                            new_sym = {
                                "patient_id": patient_id,
                                "symptom_name": sym_clean,
                                "first_reported_at": now_iso,
                                "last_reported_at": now_iso,
                                "duration_days": new_duration,
                                "status": "active",
                                "severity": severity_int
                            }
                            res_new = supabase.table("symptoms").insert(new_sym).execute()
                            if res_new.data:
                                symptom_id = res_new.data[0]["id"]
                                save_status["symptoms_created"].append(sym_clean)
                                print(f"[MedicalPipeline] Logged new active symptom: {sym_clean}")

                    # Write to symptom_mentions if symptom was found or created
                    if symptom_id and user_msg_id:
                        mention_payload = {
                            "patient_id": patient_id,
                            "symptom_id": symptom_id,
                            "message_id": user_msg_id,
                            "raw_text": message
                        }
                        supabase.table("symptom_mentions").insert(mention_payload).execute()
                        print(f"[MedicalPipeline] Logged symptom mention for: {sym_clean}")

                except Exception as ex:
                    print(f"[MedicalPipeline] Error resolving symptom {sym_clean}: {ex}")

            # Consolidate save status messages
            actions = []
            if save_status["symptoms_created"]:
                actions.append(f"tracked new symptoms: {', '.join(save_status['symptoms_created'])}")
            if save_status["symptoms_updated"]:
                actions.append(f"updated symptoms: {', '.join(save_status['symptoms_updated'])}")
            if save_status["symptoms_resolved"]:
                actions.append(f"resolved symptoms: {', '.join(save_status['symptoms_resolved'])}")
            
            if actions:
                save_status["action"] = "saved"
                save_status["message"] = f"Successfully {'; '.join(actions)}."
            else:
                save_status["message"] = "Clinically evaluated. No updates made to tracker."

        # 5. Periodic Summarization (Every 5 messages)
        # Query total count of messages in this session
        try:
            msg_count_res = supabase.table("chat_messages")\
                .select("id", count="exact")\
                .eq("patient_id", patient_id)\
                .eq("session_id", session_id)\
                .execute()
            
            count = msg_count_res.count if hasattr(msg_count_res, "count") else len(msg_count_res.data)
            print(f"[MedicalPipeline] Message count in session: {count}")
            
            if count > 0 and count % 5 == 0:
                print(f"[MedicalPipeline] Turn count is {count} (multiple of 5). Generating summary...")
                await cls.generate_and_store_summary(patient_id, session_id)
        except Exception as e:
            print(f"[MedicalPipeline] Error evaluating summary turn check: {e}")

        return {
            "bot_reply": bot_reply,
            "is_medical": is_medical,
            "save_status": save_status,
            "extracted_data": {
                "symptoms": llm_res.get("symptoms") or [],
                "medications": llm_res.get("medications") or [],
                "allergies": llm_res.get("allergies") or [],
                "severity": llm_res.get("severity"),
                "resolved": llm_res.get("resolved", False),
                "duration_days": llm_res.get("duration_days")
            }
        }

    @classmethod
    async def generate_and_store_summary(cls, patient_id: str, session_id: str) -> str:
        """
        Gathers recent messages and active symptoms, generates a clinical summary,
        and saves it to conversation_summaries table.
        """
        try:
            # Get latest 15 messages for context
            messages_res = supabase.table("chat_messages")\
                .select("*")\
                .eq("patient_id", patient_id)\
                .eq("session_id", session_id)\
                .order("created_at", desc=True)\
                .limit(15)\
                .execute()
            
            chat_logs = messages_res.data[::-1] if messages_res.data else []
            # Format chat logs for LLM
            formatted_logs = [
                {"message": m["content"], "is_user": m["sender"] == "user"}
                for m in chat_logs
            ]

            # Get active symptoms
            symptoms_res = supabase.table("symptoms")\
                .select("*")\
                .eq("patient_id", patient_id)\
                .eq("status", "active")\
                .execute()
            
            active_symptoms = symptoms_res.data or []

            # Call summary service
            summary_text = await LLMService.generate_clinical_summary(formatted_logs, active_symptoms)

            # Insert summary
            symptoms_list = [s["symptom_name"] for s in active_symptoms]
            
            # Fetch medications and allergies from profile
            medications = []
            allergies = []
            try:
                profile_res = supabase.table("patient_profiles").select("current_medication, allergies").eq("id", patient_id).execute()
                if profile_res.data:
                    p = profile_res.data[0]
                    if p.get("current_medication"):
                        medications = [m.strip() for m in p["current_medication"].split(",") if m.strip()]
                    if p.get("allergies"):
                        allergies = [a.strip() for a in p["allergies"].split(",") if a.strip()]
            except Exception as pe:
                print(f"[MedicalPipeline] Error retrieving profile for summary: {pe}")

            summary_payload = {
                "patient_id": patient_id,
                "summary": summary_text,
                "symptoms_found": symptoms_list,
                "medications_found": medications,
                "allergies_found": allergies
            }
            
            supabase.table("conversation_summaries").insert(summary_payload).execute()
            print(f"[MedicalPipeline] Saved conversation summary to database.")
            return summary_text
        except Exception as e:
            print(f"[MedicalPipeline] Error generating and storing summary: {e}")
            return "Failed to compile summary."
