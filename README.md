# PromptForge 🚀

**An AI-powered prompt engineering and evaluation platform.**

PromptForge helps users write, improve, test, version, and compare prompts through a web-based interface. It combines prompt optimization tools with test-case management and regression testing in one place.

## ✨ Features

- **Prompt Execution** — Run prompts against user-provided inputs.
- **Prompt Debugger** — Identify potential problems and get suggestions for improving prompts.
- **Prompt Optimizer** — Generate improved versions of prompts.
- **Prompt Versioning** — Create and manage different versions of a prompt.
- **Test Case Management** — Create, save, and run prompt test cases.
- **Regression Testing** — Compare stored test results between prompt versions.
- **Run History** — Review previous prompt executions and evaluations.
- **Dashboard** — View available testing and evaluation statistics.
- **Demo Mode** — Explore supported features using clearly labelled sample outputs when live AI evaluation is unavailable.

> **Note:** Demo Mode uses sample outputs, not live AI-generated evaluations. Demo test runs are not saved as real evaluation results.

## 🛠️ Tech Stack

**Frontend**
- React
- Vite
- Tailwind CSS

**Backend**
- Python
- FastAPI
- SQLAlchemy
- SQLite

**AI Integration**
- Google Gemini API
- Google Gen AI Python SDK

## 📁 Project Structure

```text
promptforge/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── database.py
│   │   ├── main.py
│   │   └── schemas.py
│   ├── requirements.txt
│   └── tests/
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── .env                 # Local configuration; not committed
├── .gitignore
└── README.md
```

## ⚙️ Getting Started

### Prerequisites

- Python 3.11 or a compatible version
- Node.js and npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/divyanshtomar2006-prog/promptforge.git
cd promptforge
```

### 2. Set up the backend

Create and activate a virtual environment.

**Windows PowerShell:**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
python -m pip install -r backend/requirements.txt
```

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key
PROMPTFORGE_DEMO_MODE=true
```

Replace the placeholder with your own Gemini API key if you plan to use live AI features. Keep this file private.

- Use `PROMPTFORGE_DEMO_MODE=true` for supported sample workflows.
- Use `PROMPTFORGE_DEMO_MODE=false` to enable the live AI paths that require a valid API key and available API quota.

Start the backend from the project root:

```powershell
python -m uvicorn backend.app.main:app --reload
```

Backend API: `http://127.0.0.1:8000`

Interactive API documentation: `http://127.0.0.1:8000/docs`

### 3. Set up the frontend

Open a second terminal:

```powershell
cd "path\to\promptforge\frontend"
npm install
npm run dev
```

Use the local URL printed by Vite in your terminal.

## 🔐 Security

- Never commit `.env` or expose API keys.
- Keep local databases and virtual environments out of version control.
- Use your own API credentials for live AI functionality.

## 🚧 Project Status

PromptForge is an evolving portfolio project. Features and setup instructions may change as development continues.

## 👨‍💻 Author

**Divyansh Tomar**

- GitHub: [@divyanshtomar2006-prog](https://github.com/divyanshtomar2006-prog)
- Project: [PromptForge](https://github.com/divyanshtomar2006-prog/promptforge)
