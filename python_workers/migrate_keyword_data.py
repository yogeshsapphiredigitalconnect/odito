from db import seo_keyword_opportunities
from datetime import datetime, timezone

# Update existing records to have default intent and serp_features
result = seo_keyword_opportunities.update_many(
    {'intent': {'$exists': False}},
    {
        '$set': {
            'intent': 'informational',
            'serp_features': []
        }
    }
)

print(f'Updated {result.modified_count} records with default intent and serp_features')

# Create the required indexes
indexes_to_create = [
    [('project_id', 1)],
    [('project_id', 1), ('keyword', 1)],
    [('project_id', 1), ('search_volume', -1)],
    [('project_id', 1), ('difficulty', -1)],
    [('project_id', 1), ('cpc', -1)],
    [('project_id', 1), ('intent', 1)],
    [('job_id', 1)]
]

for index_spec in indexes_to_create:
    try:
        seo_keyword_opportunities.create_index(index_spec)
        print(f"✅ Created index on {index_spec}")
    except Exception as e:
        if "already exists" in str(e):
            print(f"✅ Index on {index_spec} already exists")
        else:
            print(f"❌ Failed to create index on {index_spec}: {e}")

print("Database migration complete!")
