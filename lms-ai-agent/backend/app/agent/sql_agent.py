from langchain_community.utilities import SQLDatabase
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
import os
import logging

logger = logging.getLogger("sql_agent")

# Reuse the same DATABASE_URL resolution logic as session.py
_DB_URL = os.getenv("DATABASE_URL", "sqlite:///./kalviumlabs_forge.sqlite")
if _DB_URL.startswith("postgres://"):
    _DB_URL = _DB_URL.replace("postgres://", "postgresql://", 1)


def build_sql_agent():
    """Return a very small LangChain‑style SQL agent.

    This custom wrapper uses the ``SQLDatabase`` utility (part of
    langchain_community) to connect to the sqlite file and a ChatOpenAI
    model (provided by the ``langchain_openai`` package) to translate
    natural language into SQL and formulate user‑friendly replies.  The
    higher‑level helpers that ship with newer versions of LangChain are
    absent in the installed 0.3.27 release, so we build our own simple
    loop here.
    """

    class SimpleSQLAgent:
        def __init__(self):
            self.db = SQLDatabase.from_uri(
                _DB_URL,
                include_tables=["students", "education_details", "courses", "applications"],
            )
            key = os.getenv("OPENAI_API_KEY")
            if not key:
                # fail fast so startup errors make it obvious
                raise RuntimeError("OPENAI_API_KEY environment variable is not set; set it before running the server.")
            self.llm = ChatOpenAI(
                temperature=0,
                model="gpt-4o-mini",
                api_key=key,
            )
            self.schema_info = self.db.get_context()["table_info"]

        def run(self, user_prompt: str) -> str:
            # First ask the LLM to produce a SQL statement
            sql_prompt = f"""
You are an assistant that converts plain English to SQLite SQL.  The
schema of the database is:

{self.schema_info}

When the user asks to update a field, always generate a valid UPDATE statement. For example:
To change the 10th percentage for student_id=5 to 99, generate:
UPDATE education_details SET tenth_percentage = 99 WHERE student_id = 5;

Only output a single SQL statement, and when operating on tables that
contain student-specific data remember to include a WHERE clause
restricting to the appropriate student_id (the calling code will
inject the numeric id as context).  Do not modify the schema.

User request: {user_prompt}
"""
            sql_response = self.llm.invoke([HumanMessage(content=sql_prompt)])
            import re
            sql = sql_response.content.strip()
            # Remove markdown code block formatting if present
            sql = re.sub(r"^```sql\s*|^```|```$", "", sql, flags=re.IGNORECASE | re.MULTILINE).strip()
            logger.debug(f"Generated SQL for prompt '{user_prompt}': {sql}")

            # execute the SQL; errors are captured and returned as text
            try:
                execution_result = self.db.run(sql)
                # Commit changes for UPDATE/INSERT/DELETE
                if sql.strip().upper().startswith(("UPDATE", "INSERT", "DELETE")):
                    # Use SQLAlchemy's engine to commit if possible
                    try:
                        self.db._engine.raw_connection().commit()
                    except Exception as commit_exc:
                        logger.error(f"DB commit error: {commit_exc}")
                logger.debug(f"SQL execution result: {execution_result}")
            except Exception as exc:
                logger.error(f"SQL execution error for '{sql}': {exc}")
                execution_result = f"SQL execution error: {exc}"

            # now have the model summarise the outcome in human language
            reply_prompt = f"""
A user asked: {user_prompt}

You executed the following SQL statement:
{sql}

The database returned: {execution_result}

Respond with a polite, concise message to the user conveying the
result or confirmation of their request.
"""
            reply_response = self.llm.invoke([HumanMessage(content=reply_prompt)])
            reply = reply_response.content.strip()
            logger.debug(f"Final reply to user: {reply}")
            return reply or execution_result

    return SimpleSQLAgent()
