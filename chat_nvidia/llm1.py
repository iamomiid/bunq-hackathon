import os
from dotenv import load_dotenv
from langchain_nvidia_ai_endpoints import ChatNVIDIA
import json

def set_limit(user_input, llm):
    prompt = f"Process this user input and return the budget (e.g. 2000) and categories of expenses as JSON. Ignore anything else. Input: {user_input}"
    response = llm.invoke(input=prompt, temperature=0.7, max_tokens=150)
    processed_response = response.content.strip()

    try:
        result = json.loads(processed_response)
        if 'budget' in result and 'categories' in result:
            return result
        else:
            return "False input"
    except json.JSONDecodeError:
        return "False input"

def main():
    load_dotenv()
    api_key = os.getenv("NVIDIA_API_KEY")
    if not api_key:
        raise EnvironmentError("Missing NVIDIA_API_KEY in .env")

    llm = ChatNVIDIA(model="mistralai/mixtral-8x22b-instruct-v0.1")

    user_input = input("Your response: ")

    result = set_limit(user_input, llm)

    print("\nFinal Result:")
    # sample answer : hey i wanna have a limit of montly 2000 euros on sth like food , travel or maybe drinks not normal groceries and public transportation
    print(result)

if __name__ == "__main__":
    main()
