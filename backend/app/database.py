from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker


DATABASE_URL = "sqlite:///./promptforge.db"


engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


Base = declarative_base()


from backend.app.models.test_case import TestCase
from backend.app.models.test_run import TestRun
from backend.app.models.prompt_version import PromptVersion


# Create tables that don't exist yet
Base.metadata.create_all(bind=engine)


# Add new column to existing test_runs table if needed
with engine.connect() as connection:
    columns = connection.execute(
        text("PRAGMA table_info(test_runs)")
    ).fetchall()

    column_names = [column[1] for column in columns]

    if "prompt_version_id" not in column_names:
        connection.execute(
            text(
                "ALTER TABLE test_runs "
                "ADD COLUMN prompt_version_id INTEGER"
            )
        )

        connection.commit()