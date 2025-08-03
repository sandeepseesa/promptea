from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
import os
import google.generativeai as genai
from openai import OpenAI
import httpx

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX")
PINECONE_REGION = os.getenv("PINECONE_REGION")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
SERP_API_KEY = os.getenv("SERP_API_KEY")

pc = Pinecone(api_key=PINECONE_API_KEY)

index = pc.Index(PINECONE_INDEX_NAME)

import uuid

genai.configure(api_key=GOOGLE_API_KEY)
gemini_model = genai.GenerativeModel('models/gemini-1.5-flash')

groq_client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)

# Check if a document already exists in Pinecone
def document_exists(document_id: str) -> bool:
    response = index.query(
        vector=[0.0] * 384, 
        top_k=1,
        filter={"document_id": document_id},
        include_values=False
    )
    return len(response["matches"]) > 0


def upload_chunks_to_pinecone(chunks, embeddings, document_id):
    if document_exists(document_id):
        raise ValueError(f"Document with ID '{document_id}' already exists in Pinecone.")
     
    vectors = []
    for chunk, embedding in zip(chunks, embeddings):
        vectors.append((
            str(uuid.uuid4()),
            embedding,
            {
                "text": chunk,
                "document_id": document_id
            }
        ))
    index.upsert(vectors=vectors)


def search_document_chunks(query, embedding_model, document_id, top_k=5):
    query_vector = embedding_model.encode(query).tolist()
    
    response = index.query(
        vector=query_vector,
        top_k=top_k,
        include_metadata=True,
        filter={"document_id": document_id}
    )

    return [match["metadata"]["text"] for match in response["matches"]]

    #2
    # filtered_chunks = []
    # for match in response["matches"]:
    #     score = match.get("score", 0)
    #     if score >= threshold:
    #         filtered_chunks.append(match["metadata"]["text"])
    
    # return filtered_chunks

    
 
def query_gemini_llm(query, retrieved_chunks):
    # for model in genai.list_models():
    #     if "generateContent" in model.supported_generation_methods:
    #         print(model.name)
    context = "\n".join(retrieved_chunks) if retrieved_chunks else ""
    prompt = f"""Answer the following question{" based only on the provided document content" if context else ""}:\n\n{context}\n\nQuestion: {query}\nAnswer:"""
    
    response = gemini_model.generate_content(prompt)
    return response.text


def query_groq_llm(query: str, retrieved_chunks, model: str = "llama3-70b-4096") -> str:
    context = "\n".join(retrieved_chunks) if retrieved_chunks else ""
    prompt = f"""Answer the following question{" based only on the provided document content" if context else ""}:\n\n{context}\n\nQuestion: {query}\nAnswer:"""
    response = groq_client.chat.completions.create(
        model=model,
        # max_tokens=512,
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )
    return response.choices[0].message.content.strip()


async def get_web_results(query: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://serpapi.com/search",
            params={
                "engine": "google",
                "q": query,
                "api_key": SERP_API_KEY
            }
        )
        data = response.json()
        return data.get("organic_results", [])[:5]