from sqlalchemy import Column, Integer, Text, Boolean, ForeignKey, DateTime
from datetime import datetime

from backend.app.database import Base


class TestRun(Base):
    __tablename__ = "test_runs"

    id = Column(Integer, primary_key=True, index=True)

    test_case_id = Column(
        Integer,
        ForeignKey("test_cases.id"),
        nullable=False
    )

    prompt_version_id = Column(
        Integer,
        ForeignKey("prompt_versions.id"),
        nullable=True
    )

    actual_output = Column(
        Text,
        nullable=False
    )

    score = Column(
        Integer,
        nullable=False
    )

    passed = Column(
        Boolean,
        nullable=False
    )

    reason = Column(
        Text,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )