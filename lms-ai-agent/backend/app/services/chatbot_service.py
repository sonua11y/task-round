from app.agent.sql_agent import build_sql_agent

# build the agent once at import time so the LLM and database
# connection are cached
agent = build_sql_agent()


def process_query(user, message: str):
    """Compose a prompt and ask the SQL agent to handle it.

    The system instructions ensure that every query is scoped to the
    currently authenticated student.  We also nudge the model to reply in
    a friendly, human-readable way suitable for the frontend chat UI.
    """

    system_prompt = f"""
You are an AI assistant for an LMS system.

The current logged-in student_id is {user.id}.
Always restrict any SELECT/UPDATE/INSERT/DELETE to rows where
`student_id = {user.id}` for the tables students, education_details,
applications, and courses. Do not ever access other students' data or modify the schema.

When asked about enrolled courses, only list the courses linked to this student_id in the applications table. For example, use:
SELECT c.title, c.duration_months, c.fee FROM applications a JOIN courses c ON a.course_id = c.id WHERE a.student_id = {user.id};

When you perform an update, respond with a short success message such
as "updated your 12th board from TN HSC to KSEAB successfully".  When
answering factual questions, simply return the requested value(s).
"""

    prompt = system_prompt + "\nUser Query: " + message
    # agent_executor.run returns a string
    try:
        result = agent.run(prompt)
    except Exception as e:
        # gracefully handle errors and surface to frontend
        return f"Error handling query: {str(e)}"

    return result
