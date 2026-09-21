import os
import neo4j
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
uri = os.getenv("NEO4J_URI")
user = os.getenv("NEO4J_USERNAME")
pwd = os.getenv("NEO4J_PASSWORD")

driver = neo4j.GraphDatabase.driver(uri, auth=(user, pwd))
with driver.session() as s:
    r = s.run("MATCH (n) RETURN count(n) as node_count").single()
    print("Node count:", r["node_count"])
    r2 = s.run("MATCH ()-[r]->() RETURN count(r) as rel_count").single()
    print("Rel count:", r2["rel_count"])
    
    indresh = s.run("MATCH (u:User {id: 'indresh'}) RETURN u.name as name, u.id as id").data()
    print("Indresh user nodes:", indresh)
    
    rels = s.run("""
        MATCH (u:User {id: 'indresh'})-[r]->(m)
        RETURN type(r) as rel_type, labels(m)[0] as target, count(*) as count
    """).data()
    print("Direct relationships from Indresh:")
    for row in rels:
        print(f"  ({row['rel_type']}) -> [{row['target']}]: {row['count']}")

    isolated = s.run("""
        MATCH (n) WHERE NOT (n)--()
        RETURN labels(n)[0] as label, count(*) as count
    """).data()
    print("Isolated nodes (disconnected):", isolated)

driver.close()
