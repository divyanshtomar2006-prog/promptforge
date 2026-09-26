from sqlalchemy import Column, Integer, Text, DateTime
from datetime import datetime

from backend.app.database import Base


class PromptVersion(Base):
    __tablename__ = "prompt_versions"

    id = Column(Integer, primary_key=True, index=True)

    prompt_name = Column(
        Text,
        nullable=False
    )

    prompt = Column(
        Text,
        nullable=False
    )

    version = Column(
        Integer,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )