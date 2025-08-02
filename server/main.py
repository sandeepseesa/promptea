from fastapi import FastAPI, File, UploadFile, Query
from document import extract_text_from_file 
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from pinecone_client import upload_chunks_to_pinecone, search_document_chunks, query_groq_llm, query_gemini_llm, get_web_results
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI()

instrumentator = Instrumentator()

instrumentator.instrument(app).expose(app)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://promptea-frontend.onrender.com", "http://localhost:3001", "http://localhost:5173", "http://localhost:5174"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return "Hello, World!"

class Item:
    def __init__(self, name: str, price: float):
        self.name = name
        self.price = price 

def split_into_chunks(text: str, chunk_size: int = 500, chunk_overlap: int = 75):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        # separators=["\n\n", "\n", ".", "!", "?", " ", ""],
        separators=["\n\n", "\n", ".", " ", ""],
        strip_whitespace=True,
        keep_separator=False
    )
    return text_splitter.split_text(text)

#upload and generate embeddings
@app.post("/upload")
async def create_item(file: UploadFile = File(...)):
    try:
        print(f"Received file: {file.filename}, Content-Type: {file.content_type}")
        content = extract_text_from_file(file.file, file.filename)
        
        if not file.filename.lower().endswith(('.pdf', '.docx')):
            return {"error": "Only PDF and DOCX files are supported."}
        if isinstance(content, str):
            chunks = split_into_chunks(content)
            model = SentenceTransformer("BAAI/bge-small-en-v1.5")

            def embed_chunks(chunks):
                return model.encode(chunks, convert_to_numpy=True)
            embeddings = embed_chunks(chunks)
            
            upload_chunks_to_pinecone(chunks, embeddings, file.filename)
            return {"message": "File uploaded and embeddings generated."}
            # return {"filename": file.filename, "content_type": file.content_type, "total_chunks": len(chunks), "embeddings": embeddings.tolist()}
    except Exception as e:
        return {"error": f"Unexpected error: {e}"}

from pydantic import BaseModel

class SearchRequest(BaseModel):
    query: str
    model: str
    documentName: Optional[str] = None
    top_k: int = 5


@app.post("/search")
async def search_document(request: SearchRequest):
    try:
        print(f"Search request: {request.query}, Model: {request.model}, Document: {request.documentName}, Top K: {request.top_k}")
        if request.documentName: 
            embedding_model = SentenceTransformer("BAAI/bge-small-en-v1.5")
            retrieved_chunks = search_document_chunks(request.query, embedding_model, request.documentName, request.top_k)

            if not retrieved_chunks:
                return {"answer": "No relevant chunks found for the given document."}
                # answer= await get_web_results(request.query)
                # return {
                #         "query": request.query,
                #         "model_used": request.model,
                #         "answer": answer
                #     }

            if request.model == "llama3":
                answer = query_groq_llm(request.query, retrieved_chunks, model="llama3-70b-8192")
            elif request.model == "gemini":
                answer = query_gemini_llm(request.query, retrieved_chunks)
            elif request.model == "serpapi":
                answer = await get_web_results(request.query)
            else:
                return {"error": f"❌ Model '{request.model}' not supported for document-based query. Choose from: 'llama3', 'gemini', 'serpapi'."}

            return {
                "query": request.query,
                "document_used": request.documentName,
                "model_used": request.model,
                "chunks": retrieved_chunks,
                "answer": answer
            }

        else:  
            if request.model == "llama3":
                answer = query_groq_llm(request.query, [], model="llama3-70b-8192")  # empty context
            elif request.model == "gemini":
                answer = query_gemini_llm(request.query, [])
            elif request.model == "serpapi":
                answer = await get_web_results(request.query)
            else:
                return {"error": f"❌ Model '{request.model}' not supported. Choose from: 'llama3', 'gemini', 'serpapi'."}

            return {
                "query": request.query,
                "model_used": request.model,
                "answer": answer
            }

    except Exception as e:
        # return {"error": f"Unexpected error: {str(e)}"}
        import traceback
        traceback.print_exc()

        # Return full error to frontend
        return JSONResponse(
            status_code=500,
            content={"error": f"{str(e)}"}
        )
