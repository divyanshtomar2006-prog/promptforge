from sqlalchemy import Column, Integer, Text

from backend.app.database import Base


class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(Integer, primary_key=True, index=True)

    prompt = Column(Text, nullable=False)

    input = Column(Text, nullable=False)

    expected_output = Column(Text, nullable=False)