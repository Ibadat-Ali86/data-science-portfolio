from app.services.schema_engine import schema_engine
import time

print("Starting Schema Engine Test")
start = time.time()

columns = ['campaign_date', 'clicks', 'spend', 'conversions']
print(f"Analyzing columns: {columns}")

result = schema_engine.analyze_columns(columns)

end = time.time()
print(f"Analysis complete in {end - start:.4f}s")
print(result)
