from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq, AsyncGroq
import asyncio
from services.neo4j_service import neo4j
import json
import os
from datetime import datetime

router = APIRouter(prefix="/health", tags=["health-graph"])

# Request schemas for POST endpoints
class CreateUserRequest(BaseModel):
    patient_id: str
    name: str
    age: int

class ChatRequest(BaseModel):
    patient_id: str
    message: str

class CreateFamilyRequest(BaseModel):
    family_id: str
    family_name: str
    creator_patient_id: str

class AddMemberRequest(BaseModel):
    patient_id: str
    relation: str

# LLM Extraction Prompts for Multi-Agent Architecture
SYMPTOM_AGENT_PROMPT = """
You are a Symptom Extraction Agent. Extract currently active or past symptoms from the user's message.
Return ONLY valid JSON.
{
  "symptoms": [
    {"name": "fever", "severity": 8, "duration": "2 days", "body_area": "whole body", "triggers": ["stress"], "relieved_by": ["paracetamol"]}
  ]
}
If none, return {"symptoms": []}.
"""

HABIT_AGENT_PROMPT = """
You are a Lifestyle & Habit Extraction Agent. Extract habits, routines, diet, sleep, exercise, and stress details.
Return ONLY valid JSON.
{
  "health_facts": [
    {"text": "Wakes up at 2 AM every night", "category": "sleep", "frequency": "daily"},
    {"text": "Skips breakfast", "category": "diet", "frequency": "daily"}
  ]
}
Categories: sleep, diet, habit, routine, stress, exercise, mental, hygiene.
Frequency: daily, weekly, recurring, occasional, never.
If none, return {"health_facts": []}.
"""

MEDICAL_AGENT_PROMPT = """
You are a Medical History Agent. Extract confirmed diseases, diagnoses, surgeries, or known medical conditions.
Return ONLY valid JSON.
{
  "diseases": ["diabetes", "migraine"]
}
If none, return {"diseases": []}.
"""

# 1. CREATE USER
@router.post("/user/create")
async def create_user(req: CreateUserRequest):
    """Create user node in Neo4j"""
    query = """
    MERGE (u:User {id: $patient_id})
    SET u.name = $name,
        u.age = $age,
        u.created_at = datetime()
    RETURN u
    """
    result = neo4j.execute(query, {"patient_id": req.patient_id, "name": req.name, "age": req.age})
    return {"status": "user_created", "data": result}


# 2. CHAT MESSAGE → EXTRACT → SAVE TO NEO4J
@router.post("/chat")
async def health_chat(req: ChatRequest):
    """
    User sends health message → Multi-Agent LLMs extract concurrently → Save to Neo4j
    """
    today = datetime.now().strftime("%Y-%m-%d")
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY environment variable is not set.")
    
    async_client = AsyncGroq(api_key=groq_api_key)
    
    async def get_assistant_reply():
        reply = await async_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a compassionate health assistant. Reply in the user's language."},
                {"role": "user", "content": req.message}
            ]
        )
        return reply.choices[0].message.content

    async def run_agent(prompt: str):
        extract = await async_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": req.message}
            ]
        )
        try:
            return json.loads(extract.choices[0].message.content)
        except Exception as e:
            print(f"[health/chat agent] Failed parsing JSON: {e}")
            return {}

    # Run all 4 agents concurrently
    ai_reply, symptoms_data, habits_data, medical_data = await asyncio.gather(
        get_assistant_reply(),
        run_agent(SYMPTOM_AGENT_PROMPT),
        run_agent(HABIT_AGENT_PROMPT),
        run_agent(MEDICAL_AGENT_PROMPT)
    )
    
    # Merge extracted data
    extracted = {
        "symptoms": symptoms_data.get("symptoms", []),
        "health_facts": habits_data.get("health_facts", []),
        "diseases": medical_data.get("diseases", []),
        "date": today
    }
    
    # ===== SAVE TO NEO4J =====
    
    # Save symptoms
    for symptom in extracted.get("symptoms", []):
        neo4j.execute("""
            MATCH (u:User {id: $patient_id})
            MERGE (s:Symptom {name: $symptom_name})
            MERGE (u)-[r:HAS_SYMPTOM]->(s)
            SET r.severity = $severity,
                r.since = $date,
                r.last_reported = $date,
                r.body_area = $body_area,
                r.duration = $duration,
                r.triggers = $triggers,
                r.relieved_by = $relieved_by,
                r.status = 'active'
        """, {
            "patient_id": req.patient_id,
            "symptom_name": symptom.get("name"),
            "severity": symptom.get("severity", 5),
            "date": today,
            "body_area": symptom.get("body_area"),
            "duration": symptom.get("duration"),
            "triggers": symptom.get("triggers", []),
            "relieved_by": symptom.get("relieved_by", [])
        })
    
    # Save health facts (habits, lifestyle, routines)
    for fact in extracted.get("health_facts", []):
        neo4j.execute("""
            MATCH (u:User {id: $patient_id})
            CREATE (f:HealthFact {
                text: $text,
                category: $category,
                frequency: $frequency,
                date: $date,
                id: randomUUID()
            })
            CREATE (u)-[r:HAS_FACT {date: $date}]->(f)
        """, {
            "patient_id": req.patient_id,
            "text": fact.get("text"),
            "category": fact.get("category"),
            "frequency": fact.get("frequency"),
            "date": today
        })
        
    # Save diseases
    for disease_name in extracted.get("diseases", []):
        neo4j.execute("""
            MATCH (u:User {id: $patient_id})
            MERGE (d:Disease {name: $disease_name})
            MERGE (u)-[r:HAS_DISEASE]->(d)
            SET r.diagnosed_at = $date
        """, {
            "patient_id": req.patient_id,
            "disease_name": disease_name,
            "date": today
        })
    
    return {
        "ai_reply": ai_reply,
        "extracted": extracted,
        "saved_to_neo4j": True
    }


# 3. GET USER HEALTH TIMELINE (For Doctor View)
@router.get("/user/{patient_id}/timeline")
async def get_timeline(patient_id: str, days: int = 30):
    """
    Complete timeline of what user reported in last N days
    Doctor sees this when opening patient profile
    """
    query = """
    MATCH (u:User {id: $patient_id})-[r]->(n)
    WHERE r.since >= datetime() - duration({days: $days})
       OR r.date >= datetime() - duration({days: $days})
       OR r.last_reported >= datetime() - duration({days: $days})
    RETURN {
        event_type: type(r),
        node_type: labels(n)[0],
        node_name: COALESCE(n.name, n.text),
        severity: r.severity,
        category: n.category,
        frequency: n.frequency,
        date: COALESCE(r.since, r.date, r.last_reported),
        triggers: r.triggers,
        relieved_by: r.relieved_by,
        status: r.status
    } as event
    ORDER BY COALESCE(r.since, r.date, r.last_reported) DESC
    """
    result = neo4j.execute(query, {"patient_id": patient_id, "days": days})
    return {"timeline": [item["event"] for item in result if "event" in item]}


# 4. GET ALL SYMPTOMS
@router.get("/user/{patient_id}/symptoms")
async def get_symptoms(patient_id: str):
    """All symptoms user reported"""
    query = """
    MATCH (u:User {id: $patient_id})-[r:HAS_SYMPTOM]->(s:Symptom)
    RETURN {
        symptom: s.name,
        severity: r.severity,
        first_reported: r.since,
        last_reported: r.last_reported,
        status: r.status,
        duration: r.duration,
        triggers: r.triggers,
        relieved_by: r.relieved_by
    } as symptom_data
    ORDER BY r.last_reported DESC
    """
    result = neo4j.execute(query, {"patient_id": patient_id})
    return {"symptoms": [item["symptom_data"] for item in result if "symptom_data" in item]}


# 5. GET ALL HEALTH FACTS (Habits, Lifestyle, Routines)
@router.get("/user/{patient_id}/habits")
async def get_health_facts(patient_id: str):
    """
    Everything user said about their lifestyle, routines, habits, diet, sleep, stress
    This is the detailed "minute details" you wanted
    """
    query = """
    MATCH (u:User {id: $patient_id})-[r:HAS_FACT]->(f:HealthFact)
    RETURN {
        fact: f.text,
        category: f.category,
        frequency: f.frequency,
        date: r.date
    } as fact_data
    ORDER BY r.date DESC
    LIMIT 100
    """
    result = neo4j.execute(query, {"patient_id": patient_id})
    return {"health_facts": [item["fact_data"] for item in result if "fact_data" in item]}


# 6. GET COMPLETE USER HEALTH GRAPH
@router.get("/user/{patient_id}/graph")
async def get_full_health_graph(patient_id: str):
    """
    Complete health picture - everything connected
    """
    query = """
    MATCH (u:User {id: $patient_id})
    OPTIONAL MATCH (u)-[s_rel:HAS_SYMPTOM]->(sym:Symptom)
    OPTIONAL MATCH (u)-[f_rel:HAS_FACT]->(fact:HealthFact)
    OPTIONAL MATCH (u)-[d_rel:HAS_DISEASE]->(dis:Disease)
    RETURN {
        user: u.name,
        age: u.age,
        symptoms: collect({
            name: sym.name,
            severity: s_rel.severity,
            status: s_rel.status,
            since: s_rel.since
        }),
        health_facts: collect({
            text: fact.text,
            category: fact.category,
            frequency: fact.frequency
        }),
        diseases: collect(dis.name)
    } as graph
    """
    result = neo4j.execute(query, {"patient_id": patient_id})
    return result[0]["graph"] if result and "graph" in result[0] else {"error": "User not found"}


# 7. CREATE FAMILY GROUP
@router.post("/family/create")
async def create_family(req: CreateFamilyRequest):
    """Create family group"""
    query = """
    MERGE (g:FamilyGroup {id: $family_id})
    SET g.name = $family_name,
        g.created_by = $creator_patient_id,
        g.created_at = datetime()
    RETURN g
    """
    result = neo4j.execute(query, {
        "family_id": req.family_id,
        "family_name": req.family_name,
        "creator_patient_id": req.creator_patient_id
    })
    return {"status": "family_created", "data": result}


# 8. ADD FAMILY MEMBER
@router.post("/family/{family_id}/add-member")
async def add_family_member(family_id: str, req: AddMemberRequest):
    """Add member to family (relation: father, mother, sibling, spouse, child)"""
    query = """
    MATCH (g:FamilyGroup {id: $family_id})
    MATCH (u:User {id: $patient_id})
    MERGE (g)-[r:CONTAINS {relation: $relation}]->(u)
    RETURN r
    """
    result = neo4j.execute(query, {
        "family_id": family_id,
        "patient_id": req.patient_id,
        "relation": req.relation
    })
    return {"status": "member_added", "data": result}


# 9. DETECT FAMILY SYMPTOM SIMILARITY (MAIN FAMILY FEATURE)
@router.get("/family/{family_id}/symptom-overlap")
async def detect_family_similarity(family_id: str, days: int = 7):
    """
    Find symptoms that multiple family members have reported in last N days
    THIS IS THE CONTAGION/GENETIC PATTERN DETECTOR
    """
    query = """
    MATCH (g:FamilyGroup {id: $family_id})-[:CONTAINS]->(u:User)
    MATCH (u)-[r:HAS_SYMPTOM]->(s:Symptom)
    WHERE r.last_reported >= datetime() - duration({days: $days})
    WITH s.name as symptom,
         collect({
             member_id: u.id,
             member_name: u.name,
             severity: r.severity,
             first_reported: r.since,
             last_reported: r.last_reported
         }) as affected_members,
         count(u) as member_count
    WHERE member_count >= 2
    RETURN {
        symptom: symptom,
        members: affected_members,
        member_count: member_count,
        alert_level: CASE WHEN member_count >= 3 THEN 'high' WHEN member_count = 2 THEN 'medium' ELSE 'low' END,
        message: "🚨 " + toString(member_count) + " family members reporting " + symptom
    } as alert
    ORDER BY member_count DESC, symptom
    """
    result = neo4j.execute(query, {"family_id": family_id, "days": days})
    return {"alerts": [item["alert"] for item in result if "alert" in item]}


# 10. DETECT LIFESTYLE SIMILARITY (Habits spreading in family)
@router.get("/family/{family_id}/lifestyle-patterns")
async def detect_lifestyle_patterns(family_id: str):
    """
    Find similar health facts/habits across family members
    Example: multiple members with "skips breakfast" or "wakes up late"
    """
    query = """
    MATCH (g:FamilyGroup {id: $family_id})-[:CONTAINS]->(u:User)
    MATCH (u)-[r:HAS_FACT]->(f:HealthFact)
    WITH f.text as habit,
         collect({member_id: u.id, member_name: u.name, category: f.category}) as members,
         f.category as category,
         count(u) as member_count
    WHERE member_count >= 2
    RETURN {
        habit: habit,
        category: category,
        members: members,
        member_count: member_count,
        observation: toString(member_count) + " members: " + habit
    } as pattern
    ORDER BY member_count DESC
    """
    result = neo4j.execute(query, {"family_id": family_id})
    return {"patterns": [item["pattern"] for item in result if "pattern" in item]}


# 11. GET FAMILY HEALTH OVERVIEW
@router.get("/family/{family_id}/overview")
async def get_family_overview(family_id: str):
    """
    Family health summary - each member's status
    """
    query = """
    MATCH (g:FamilyGroup {id: $family_id})-[rel:CONTAINS]->(u:User)
    OPTIONAL MATCH (u)-[s_rel:HAS_SYMPTOM]->(sym:Symptom)
    WHERE s_rel.status = 'active'
    OPTIONAL MATCH (u)-[f_rel:HAS_FACT]->(fact:HealthFact)
    WHERE fact.frequency IN ['daily', 'recurring']
    RETURN {
        member_id: u.id,
        member_name: u.name,
        relation: rel.relation,
        active_symptoms: collect(DISTINCT sym.name),
        symptom_count: count(DISTINCT sym),
        daily_habits: collect(DISTINCT fact.text),
        risk_level: CASE WHEN count(DISTINCT sym) >= 3 THEN 'high' WHEN count(DISTINCT sym) >= 1 THEN 'medium' ELSE 'low' END
    } as member
    """
    result = neo4j.execute(query, {"family_id": family_id})
    return {"family_overview": [item["member"] for item in result if "member" in item]}


# 12. USER HEALTH GRAPH (All nodes connected to user)
@router.get("/user/{patient_id}/graph-visualization")
async def get_user_graph_viz(patient_id: str):
    """
    Returns user's complete health graph in node-edge format
    Perfect for graph visualization (D3, Cytoscape, React Flow)
    """
    query = """
    MATCH (u:User {id: $patient_id})
    OPTIONAL MATCH (u)-[sym_rel:HAS_SYMPTOM]->(sym:Symptom)
    OPTIONAL MATCH (u)-[fact_rel:HAS_FACT]->(fact:HealthFact)
    OPTIONAL MATCH (u)-[dis_rel:HAS_DISEASE]->(dis:Disease)
    OPTIONAL MATCH (sym)-[trig_rel:TRIGGERED_BY]->(trig_fact:HealthFact)
    
    WITH u, sym, sym_rel, fact, fact_rel, dis, dis_rel, trig_fact, trig_rel
    
    RETURN {
        nodes: [
            {
                id: u.id,
                label: u.name,
                type: 'user',
                severity: null,
                category: null,
                frequency: null,
                color: '#FF6B6B'
            }
        ] + 
        collect(DISTINCT CASE WHEN sym IS NOT NULL THEN {
            id: 'sym_' + sym.name,
            label: sym.name + ' (Severity: ' + toString(sym_rel.severity) + ')',
            type: 'symptom',
            severity: sym_rel.severity,
            category: null,
            frequency: null,
            status: sym_rel.status,
            since: sym_rel.since,
            color: '#FF6B6B'
        } END) +
        collect(DISTINCT CASE WHEN fact IS NOT NULL THEN {
            id: 'fact_' + fact.id,
            label: fact.text,
            type: 'fact',
            category: fact.category,
            frequency: fact.frequency,
            severity: null,
            color: CASE 
                WHEN fact.category = 'sleep' THEN '#4ECDC4'
                WHEN fact.category = 'diet' THEN '#FFE66D'
                WHEN fact.category = 'stress' THEN '#FF6B6B'
                WHEN fact.category = 'exercise' THEN '#95E1D3'
                ELSE '#A8E6CF'
            END
        } END) +
        collect(DISTINCT CASE WHEN dis IS NOT NULL THEN {
            id: 'dis_' + dis.name,
            label: dis.name,
            type: 'disease',
            severity: null,
            category: null,
            frequency: null,
            color: '#C7CEEA'
        } END),
        
        edges: 
        collect(DISTINCT CASE WHEN sym IS NOT NULL THEN {
            source: u.id,
            target: 'sym_' + sym.name,
            label: 'HAS_SYMPTOM',
            type: 'symptom',
            severity: sym_rel.severity,
            weight: sym_rel.severity
        } END) +
        collect(DISTINCT CASE WHEN fact IS NOT NULL THEN {
            source: u.id,
            target: 'fact_' + fact.id,
            label: 'HAS_FACT (' + fact.frequency + ')',
            type: 'fact',
            weight: 1
        } END) +
        collect(DISTINCT CASE WHEN dis IS NOT NULL THEN {
            source: u.id,
            target: 'dis_' + dis.name,
            label: 'HAS_DISEASE',
            type: 'disease',
            weight: 1
        } END) +
        collect(DISTINCT CASE WHEN trig_fact IS NOT NULL AND sym IS NOT NULL THEN {
            source: 'sym_' + sym.name,
            target: 'fact_' + trig_fact.id,
            label: 'TRIGGERED_BY',
            type: 'trigger',
            weight: 2,
            style: 'dashed'
        } END)
    } as graph
    """
    result = neo4j.execute(query, {"patient_id": patient_id})
    if result and result[0].get("graph"):
        data = result[0]["graph"]
        nodes = [n for n in data["nodes"] if n is not None]
        edges = [e for e in data["edges"] if e is not None]
        return {
            "nodes": nodes,
            "edges": edges,
            "stats": {
                "total_nodes": len(nodes),
                "total_edges": len(edges),
                "symptoms": len([n for n in nodes if n["type"] == "symptom"]),
                "facts": len([n for n in nodes if n["type"] == "fact"]),
                "diseases": len([n for n in nodes if n["type"] == "disease"])
            }
        }
    return {"nodes": [], "edges": [], "stats": {"total_nodes": 0, "total_edges": 0, "symptoms": 0, "facts": 0, "diseases": 0}}


# 13. FAMILY GRAPH VISUALIZATION (All members + shared symptoms)
@router.get("/family/{family_id}/graph-visualization")
async def get_family_graph_viz(family_id: str):
    """
    Returns family health graph showing:
    - All family members (nodes)
    - Their symptoms (nodes)
    - Shared symptoms (highlighted connections)
    """
    members_query = """
    MATCH (g:FamilyGroup {id: $family_id})-[rel:CONTAINS]->(u:User)
    OPTIONAL MATCH (u)-[sym_rel:HAS_SYMPTOM]->(sym:Symptom)
    WHERE sym_rel.status = 'active'
    RETURN {
        member_id: u.id,
        member_name: u.name,
        relation: rel.relation,
        active_symptoms: collect(DISTINCT sym.name)
    } as member
    """
    members = neo4j.execute(members_query, {"family_id": family_id})
    members_list = [m["member"] for m in members if "member" in m]
    
    shared_symptoms_query = """
    MATCH (g:FamilyGroup {id: $family_id})-[:CONTAINS]->(u:User)-[r:HAS_SYMPTOM]->(s:Symptom)
    WHERE r.status = 'active'
    WITH s.name as symptom_name, count(DISTINCT u) as cnt
    WHERE cnt >= 2
    RETURN symptom_name
    """
    shared_symptoms_res = neo4j.execute(shared_symptoms_query, {"family_id": family_id})
    shared_symptoms = [s["symptom_name"] for s in shared_symptoms_res]
    
    fg_query = """
    MATCH (g:FamilyGroup {id: $family_id})
    RETURN g.name as name
    """
    fg_res = neo4j.execute(fg_query, {"family_id": family_id})
    fg_name = fg_res[0]["name"] if fg_res else "Family Group"
    
    nodes = []
    edges = []
    
    nodes.append({
        "id": family_id,
        "label": fg_name,
        "type": "family_group",
        "color": "#9B59B6"
    })
    
    for m in members_list:
        nodes.append({
            "id": m["member_id"],
            "label": m["member_name"],
            "type": "family_member",
            "color": "#3498DB",
            "relation": m["relation"]
        })
        edges.append({
            "source": family_id,
            "target": m["member_id"],
            "label": "MEMBER",
            "type": "membership",
            "weight": 1
        })
        
    for sym in shared_symptoms:
        nodes.append({
            "id": f"sym_{sym}",
            "label": sym,
            "type": "shared_symptom",
            "color": "#E74C3C"
        })
        
        for m in members_list:
            if sym in m["active_symptoms"]:
                edges.append({
                    "source": m["member_id"],
                    "target": f"sym_{sym}",
                    "label": "HAS",
                    "type": "symptom",
                    "weight": 2,
                    "highlight": True
                })
                
    for i in range(len(members_list)):
        for j in range(i + 1, len(members_list)):
            m1 = members_list[i]
            m2 = members_list[j]
            overlap = [s for s in m1["active_symptoms"] if s in m2["active_symptoms"] and s in shared_symptoms]
            if overlap:
                edges.append({
                    "source": m1["member_id"],
                    "target": m2["member_id"],
                    "label": f"SHARES: {', '.join(overlap)}",
                    "type": "shared",
                    "weight": 3,
                    "highlight": True,
                    "shared_count": len(overlap)
                })
                
    return {
        "nodes": nodes,
        "edges": edges,
        "members": members_list,
        "stats": {
            "total_members": len(members_list),
            "shared_symptoms": len(shared_symptoms),
            "total_edges": len(edges)
        }
    }
