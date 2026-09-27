# PromptForge 🚀

**An AI Prompt Engineering & Evaluation Platform built with React, FastAPI, and Google Gemini.**

PromptForge helps users create, improve, test, version, and compare prompts through a web-based interface. It brings prompt optimization, test-case management, evaluation history, and regression testing into one place.

## ✨ Features

* **Prompt Runner** — Run prompts against user-provided inputs.
* **Prompt Debugger** — Identify potential prompt weaknesses and get improvement suggestions.
* **Prompt Optimizer** — Generate an improved version of a prompt.
* **Prompt Versioning** — Save and manage different prompt versions.
* **Version Comparison** — Compare evaluation metrics between versions.
* **Test Case Management** — Create, save, and run prompt test cases.
* **Regression Testing** — Identify score decreases, improvements, and unchanged results between versions.
* **Run History** — Review previous executions and evaluations.
* **Dashboard** — View testing and evaluation statistics.
* **Demo Mode** — Explore supported workflows using clearly labelled sample outputs.

> **Demo Mode notice:** Demo Mode uses sample outputs rather than live AI-generated evaluations. Demo test runs are not saved as real evaluation results. Stored historical results may still appear in the dashboard.

## 🛠️ Tech Stack

**Frontend**

* React
* Vite
* Tailwind CSS

**Backend**

* Python
* FastAPI
* SQLAlchemy
* SQLite

**AI Integration**

* Google Gemini API
* Google Gen AI Python SDK

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
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── .env.example
├── .gitignore
└── README.md
```

## ⚙️ Getting Started

### Prerequisites

* Python (use the version supported by your installed dependencies)
* Node.js and npm
* Git

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

Install backend dependencies:

```powershell
python -m pip install -r backend/requirements.txt
```

Create your local environment file from the example:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and add your own Gemini API key if you want to use live AI features:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PROMPTFORGE_DEMO_MODE=true
```

Keep `.env` private. Never commit your actual API key.

* Set `PROMPTFORGE_DEMO_MODE=true` to use supported demo workflows.
* Set `PROMPTFORGE_DEMO_MODE=false` to enable live AI paths, which require a valid API key and available API quota.

Start the backend from the project root:

```powershell
python -m uvicorn backend.app.main:app --reload
```

* Backend: `http://127.0.0.1:8000`
* API documentation: `http://127.0.0.1:8000/docs`
* Health check: `http://127.0.0.1:8000/health`

### 3. Set up the frontend

Open a second terminal and navigate to the frontend directory:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite.

## 🧪 Tests

Run the backend API tests from the project root:

```powershell
python -m pytest backend/tests -v
```

The backend API test suite covers the root endpoint, health check, OpenAPI documentation, prompt runner Demo Mode, test-case runner Demo Mode, prompt optimizer Demo Mode, and prompt-version comparison when a version is missing.

Run the tests from the project root:

```powershell
python -m pytest backend/tests -v
```


## 🔐 Security

* Never commit `.env` or expose API keys.
* `.env.example` contains placeholders only.
* Keep local databases, virtual environments, and generated cache files out of version control.
* Use your own API credentials for live AI functionality.

## 🚧 Project Status

PromptForge is an evolving portfolio project. The core interface, prompt-version comparison, regression-testing display, and basic API tests have been exercised locally. Live AI availability depends on Gemini API credentials and quota. Demo results should not be interpreted as live AI evaluations.

## 👨‍💻 Author

**Divyansh Tomar**

* GitHub: [@divyanshtomar2006-prog](https://github.com/divyanshtomar2006-prog)
* promptforge-tecchie.vercel.app: (https://promptforge-pied-seven.vercel.app/)
* Project: [PromptForge](https://github.com/divyanshtomar2006-prog/promptforge)
