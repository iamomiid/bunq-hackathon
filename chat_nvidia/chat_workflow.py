import os
from dotenv import load_dotenv
from langchain_nvidia_ai_endpoints import ChatNVIDIA

def main():
    load_dotenv()
    api_key = os.getenv("NVIDIA_API_KEY")
    if not api_key:
        raise EnvironmentError("Missing NVIDIA_API_KEY in .env")

    llm = ChatNVIDIA(model="mistralai/mixtral-8x22b-instruct-v0.1")
    response = llm.invoke("Write a ballad about LangChain.")

    print(response.content)

if __name__ == "__main__":
    main()
