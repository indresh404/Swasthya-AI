import os
import neo4j
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
uri = os.getenv("NEO4J_URI", "neo4j+s://63ba98a5.databases.neo4j.io")
user = os.getenv("NEO4J_USERNAME", "63ba98a5")
pwd = os.getenv("NEO4J_PASSWORD", "_Nxv6nFNRYmYWwGBTNZa-iT5MvRfVLM4BK6pm6sytIA")

driver = neo4j.GraphDatabase.driver(uri, auth=(user, pwd))

print("\n" + "="*60)
print("     SWASTHYA AI KNOWLEDGE GRAPH SUMMARY (AURA DB)")
print("="*60)

node_summary = driver.execute_query("MATCH (n) RETURN labels(n)[0] as label, count(n) as count ORDER BY count DESC")
total_nodes = 0
for r in node_summary.records:
    lbl = r["label"]
    cnt = r["count"]
    total_nodes += cnt
    print(f"  * {lbl:<25}: {cnt:>2} nodes")
print(f"\nTOTAL DISTINCT NODES: {total_nodes}")

rel_summary = driver.execute_query("MATCH ()-[r]->() RETURN type(r) as rel_type, count(r) as count ORDER BY count DESC")
total_rels = 0
for r in rel_summary.records:
    rt = r["rel_type"]
    cnt = r["count"]
    total_rels += cnt
    print(f"  -> {rt:<26}: {cnt:>2} edges")
print(f"\nTOTAL ACTIVE RELATIONSHIPS: {total_rels}")

isolated_check = driver.execute_query("MATCH (n) WHERE NOT (n)--() RETURN count(n) as isolated_count").records[0]["isolated_count"]
print(f"\nISOLATED (DISCONNECTED) NODES: {isolated_check} (Goal: 0)")

# Check patient-centric graph connectivity for Indresh
indresh_check = driver.execute_query("MATCH path = (u:User {id: 'indresh'})-[*1..2]-(n) RETURN count(distinct n) as connected_nodes").records[0]["connected_nodes"]
print(f"NODES REACHABLE FROM INDRESH (1-2 HOPS): {indresh_check}")

driver.close()
