from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
import os
import time

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:1234@db:5432/educas")

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(100))
    email         = Column(String(150), unique=True, index=True)
    password_hash = Column(String(255))
    created_at    = Column(DateTime, default=datetime.utcnow)

class Document(Base):
    __tablename__ = "documents"
    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=True)
    filename    = Column(String(255))
    file_type   = Column(String(10))
    uploaded_at = Column(DateTime, default=datetime.utcnow)

class AnalysisSession(Base):
    __tablename__ = "analysis_sessions"
    id          = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    input_type  = Column(String(20))
    created_at  = Column(DateTime, default=datetime.utcnow)

class ClassificationResult(Base):
    __tablename__ = "classification_results"
    id           = Column(Integer, primary_key=True, index=True)
    session_id   = Column(Integer, ForeignKey("analysis_sessions.id"))
    domain       = Column(String(50))
    subject      = Column(String(100))
    difficulty   = Column(String(50))
    suitable_for = Column(String(100))
    confidence   = Column(Float)
    summary      = Column(Text)
    recommendations = Column(Text)

class ReadabilityMetric(Base):
    __tablename__ = "readability_metrics"
    id                  = Column(Integer, primary_key=True, index=True)
    session_id          = Column(Integer, ForeignKey("analysis_sessions.id"))
    flesch_score        = Column(Float)
    reading_level       = Column(String(50))
    avg_sentence_length = Column(Float)
    complex_sentences   = Column(Integer)

def create_engine_with_retry():
    retries = 10
    for i in range(retries):
        try:
            engine = create_engine(DATABASE_URL)
            engine.connect()
            print("✅ Connected to database!")
            return engine
        except Exception as e:
            print(f"⏳ Waiting for database... ({i+1}/{retries})")
            time.sleep(3)
    raise Exception("❌ Could not connect to database after retries")

engine = create_engine_with_retry()
SessionLocal = sessionmaker(bind=engine)

def create_tables():
    Base.metadata.create_all(bind=engine)
    print("✅ All tables created successfully!")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

if __name__ == "__main__":
    create_tables()