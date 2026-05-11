import sqlite3
import os

db_path = "advanceself.db"
if not os.path.exists(db_path):
    print("Database not found in current dir.")
else:
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("ALTER TABLE users ADD COLUMN full_name VARCHAR(255);")
        conn.commit()
        conn.close()
        print("SUCCESS: Added full_name column to users table.")
    except sqlite3.OperationalError as e:
        print(f"INFO: {e}")
