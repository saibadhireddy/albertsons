import os
import datetime
from databricks.sdk import WorkspaceClient
from databricks.sdk.errors import DatabricksError

def get_client():
    return WorkspaceClient(
        host=os.getenv("DATABRICKS_HOST"),
        token=os.getenv("DATABRICKS_TOKEN")
    )

def parse_genie_response(resp, space_id):
    """Formats the SDK response for the React Frontend."""
    resp_dict = resp.as_dict()
    convo_id = resp_dict.get("conversation_id")
    msg_id = resp_dict.get("message_id")
    
    # Extract suggested questions
    questions = []
    answer = resp_dict.get("content", "")
    table_data = None
    attachment_id = None

    for attr in resp_dict.get("attachments", []):
        if "suggested_questions" in attr:
            questions = attr["suggested_questions"].get("questions", [])
        if "text" in attr:
            answer = attr["text"].get("content", answer)
        if "query" in attr:
            attachment_id = attr.get("attachment_id")

    # Fetch Table Results if a query was generated
    if attachment_id:
        try:
            client = get_client()
            query_res = client.genie.get_message_attachment_query_result(
                space_id=space_id,
                conversation_id=convo_id,
                message_id=msg_id,
                attachment_id=attachment_id
            ).as_dict()
            
            manifest = query_res.get("statement_response", {}).get("manifest", {})
            columns = manifest.get("schema", {}).get("columns", [])
            data_array = query_res.get("statement_response", {}).get("result", {}).get("data_array", [])

            if columns:
                cols = [c["name"] for c in columns]
                table_data = {
                    "columns": [{"field": c, "headerName": c} for c in cols],
                    "data": [dict(zip(cols, row)) for row in data_array]
                }
        except Exception as e:
            print(f"Table Fetch Error: {e}")

    return {
        "status": "success",
        "conversation_id": convo_id,
        "message_id": msg_id,
        "answer": answer,
        "suggested_questions": questions,
        "table_data": table_data,
        "attachment_id": attachment_id
    }

def get_genie_space_info(space_name):
    space_id = os.getenv(space_name, "01f1438541b416e9a60d68c2e94f8627")
    try:
        client = get_client()
        space = client.genie.get_space(space_id=space_id).as_dict()
        return {"status": "success", "data": {
            "title": space.get("name"),
            "description": space.get("description"),
            "space_id": space_id
        }}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def start_genie_conversation(space_name, message):
    space_id = os.getenv(space_name)
    try:
        client = get_client()
        res = client.genie.start_conversation_and_wait(
            space_id=space_id, content=message, timeout=datetime.timedelta(seconds=60)
        )
        return parse_genie_response(res, space_id)
    except Exception as e:
        return {"status": "error", "message": str(e)}

def create_genie_message(space_name, convo_id, message):
    space_id = os.getenv(space_name)
    try:
        client = get_client()
        res = client.genie.create_message_and_wait(
            space_id=space_id, conversation_id=convo_id, content=message, timeout=datetime.timedelta(seconds=60)
        )
        return parse_genie_response(res, space_id)
    except Exception as e:
        return {"status": "error", "message": str(e)}