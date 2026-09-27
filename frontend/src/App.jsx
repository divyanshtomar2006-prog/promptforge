import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const styles = {
  app: {
    minHeight: "100vh",
    display: "flex",
    background: "#0d1117",
    color: "#e6edf3",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  },

  sidebar: {
    width: "230px",
    minHeight: "100vh",
    boxSizing: "border-box",
    padding: "22px 16px",
    background: "#161b22",
    borderRight: "1px solid #30363d",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
  },

  logo: {
    fontSize: "22px",
    fontWeight: 800,
    marginBottom: "28px",
  },

  logoAccent: {
    color: "#58a6ff",
  },

  navButton: {
    width: "100%",
    border: 0,
    borderRadius: "8px",
    padding: "11px 12px",
    marginBottom: "7px",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "14px",
  },

  content: {
    marginLeft: "230px",
    width: "calc(100% - 230px)",
    padding: "34px",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "24px",
  },

  title: {
    margin: 0,
    fontSize: "30px",
  },

  subtitle: {
    color: "#8b949e",
    marginTop: "7px",
    lineHeight: 1.5,
  },

  card: {
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "18px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "#0d1117",
    color: "#e6edf3",
    border: "1px solid #30363d",
    borderRadius: "8px",
    padding: "11px 12px",
    outline: "none",
    marginTop: "7px",
  },

  textarea: {
    width: "100%",
    minHeight: "150px",
    boxSizing: "border-box",
    resize: "vertical",
    background: "#0d1117",
    color: "#e6edf3",
    border: "1px solid #30363d",
    borderRadius: "8px",
    padding: "12px",
    outline: "none",
    marginTop: "7px",
    fontFamily: "inherit",
  },

  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 700,
    color: "#c9d1d9",
    marginTop: "15px",
  },

  button: {
    border: 0,
    borderRadius: "8px",
    padding: "10px 15px",
    cursor: "pointer",
    background: "#238636",
    color: "white",
    fontWeight: 700,
    marginTop: "15px",
  },

  secondaryButton: {
    border: "1px solid #30363d",
    borderRadius: "8px",
    padding: "10px 15px",
    cursor: "pointer",
    background: "#21262d",
    color: "#e6edf3",
    fontWeight: 700,
    marginTop: "15px",
  },

  dangerButton: {
    border: "1px solid #da3633",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer",
    background: "transparent",
    color: "#ff7b72",
    fontWeight: 700,
  },

  error: {
    background: "#3d1f24",
    border: "1px solid #8e2c35",
    color: "#ffb3b3",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "16px",
  },

  success: {
    background: "#16301d",
    border: "1px solid #2ea043",
    color: "#aff5b8",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "16px",
  },

  warning: {
    background: "#30260f",
    border: "1px solid #9e6a03",
    color: "#e3b341",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "16px",
  },

  output: {
    whiteSpace: "pre-wrap",
    background: "#0d1117",
    border: "1px solid #30363d",
    borderRadius: "8px",
    padding: "15px",
    lineHeight: 1.6,
    marginTop: "15px",
  },

  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },

  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "16px",
  },

  stat: {
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: "10px",
    padding: "18px",
  },

  statNumber: {
    fontSize: "26px",
    fontWeight: 800,
  },

  statLabel: {
    color: "#8b949e",
    fontSize: "12px",
    marginTop: "5px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
  },

  th: {
    textAlign: "left",
    color: "#8b949e",
    borderBottom: "1px solid #30363d",
    padding: "10px 8px",
  },

  td: {
    borderBottom: "1px solid #21262d",
    padding: "11px 8px",
    verticalAlign: "top",
  },

  badge: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 800,
  },

  select: {
    width: "100%",
    boxSizing: "border-box",
    background: "#0d1117",
    color: "#e6edf3",
    border: "1px solid #30363d",
    borderRadius: "8px",
    padding: "11px 12px",
    marginTop: "7px",
  },
};

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    if (typeof data === "object" && data?.detail) {
      if (Array.isArray(data.detail)) {
        message = data.detail
          .map((item) => {
            if (typeof item === "string") return item;
            return item?.msg || JSON.stringify(item);
          })
          .join("; ");
      } else {
        message =
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail);
      }
    }

    throw new Error(message);
  }

  return data;
}

function App() {
  const [page, setPage] = useState("dashboard");

  const [prompt, setPrompt] = useState(
    "Explain this concept in simple words with a short example."
  );
  const [promptInput, setPromptInput] = useState("Binary Search");
  const [promptOutput, setPromptOutput] = useState("");
  const [promptLoading, setPromptLoading] = useState(false);
  const [promptError, setPromptError] = useState("");

  const [testCases, setTestCases] = useState([]);
  const [testRuns, setTestRuns] = useState([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const [testError, setTestError] = useState("");

  const [testPrompt, setTestPrompt] = useState(
    "Explain binary search simply with an example."
  );
  const [testInput, setTestInput] = useState("Binary Search");
  const [expectedOutput, setExpectedOutput] = useState(
    "Binary search repeatedly divides a sorted list in half to find a target."
  );
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testVersions, setTestVersions] = useState([]);
  const [selectedTestVersions, setSelectedTestVersions] = useState({});
  const [testVersionsLoading, setTestVersionsLoading] = useState(false);

  const [versions, setVersions] = useState([]);
  const [versionName, setVersionName] = useState("Binary Search");
  const [versionPrompt, setVersionPrompt] = useState(
    "Explain binary search simply with an example."
  );
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [versionError, setVersionError] = useState("");
  const [versionMessage, setVersionMessage] = useState("");

  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");
  const [comparison, setComparison] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState("");

  const [analytics, setAnalytics] = useState(null);
  const [analyticsVersionId, setAnalyticsVersionId] = useState("");
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");

  const [regressionOldVersion, setRegressionOldVersion] = useState("");
  const [regressionNewVersion, setRegressionNewVersion] = useState("");
  const [regressionResult, setRegressionResult] = useState(null);
  const [regressionLoading, setRegressionLoading] = useState(false);
  const [regressionError, setRegressionError] = useState("");

  const [regressionGateResult, setRegressionGateResult] = useState(null);
  const [regressionGateLoading, setRegressionGateLoading] = useState(false);
  const [regressionGateError, setRegressionGateError] = useState("");

  const [suiteLoading, setSuiteLoading] = useState(false);
  const [suiteMessage, setSuiteMessage] = useState("");

  // Prompt Optimizer state
  const [optimizerPrompt, setOptimizerPrompt] = useState(
    "Explain the given computer science topic."
  );
  const [optimizerInput, setOptimizerInput] = useState(
    "Binary Search"
  );
  const [optimizerExpected, setOptimizerExpected] = useState(
    "Binary search works on a sorted array and repeatedly halves the search space. Its time complexity is O(log n)."
  );
  const [optimizerActual, setOptimizerActual] = useState(
    "Binary search is a searching algorithm that checks every element one by one. Its time complexity is O(n)."
  );
  const [optimizerLoading, setOptimizerLoading] = useState(false);
  const [optimizerError, setOptimizerError] = useState("");
  const [optimizerResult, setOptimizerResult] = useState(null);

  async function runPrompt() {
    setPromptLoading(true);
    setPromptError("");
    setPromptOutput("");

    try {
      const data = await api("/api/v1/prompts/run", {
        method: "POST",
        body: JSON.stringify({
          prompt,
          input: promptInput,
        }),
      });

      setPromptOutput(data.output || "");
    } catch (error) {
      setPromptError(error.message);
    } finally {
      setPromptLoading(false);
    }
  }

  async function loadTestCases() {
    setLoadingTests(true);
    setTestError("");

    try {
      const [cases, runs] = await Promise.all([
        api("/api/v1/test-cases/"),
        api("/api/v1/test-cases/runs"),
      ]);

      setTestCases(
        Array.isArray(cases) ? cases : cases?.test_cases || []
      );

      setTestRuns(runs?.runs || []);
    } catch (error) {
      setTestError(error.message);
    } finally {
      setLoadingTests(false);
    }
  }

  async function loadTestVersions() {
    setTestVersionsLoading(true);

    try {
      const data = await api(
        `/api/v1/prompt-versions/${encodeURIComponent("Binary Search")}`
      );

      setTestVersions(data?.versions || []);
    } catch (error) {
      setTestError(`Could not load prompt versions: ${error.message}`);
      setTestVersions([]);
    } finally {
      setTestVersionsLoading(false);
    }
  }

  async function createTestCase() {
    setTestLoading(true);
    setTestError("");

    try {
      await api("/api/v1/test-cases/", {
        method: "POST",
        body: JSON.stringify({
          prompt: testPrompt,
          input: testInput,
          expected_output: expectedOutput,
        }),
      });

      await loadTestCases();
      setTestResult(null);
    } catch (error) {
      setTestError(error.message);
    } finally {
      setTestLoading(false);
    }
  }

  async function runUnsavedTest() {
    setTestLoading(true);
    setTestError("");
    setTestResult(null);

    try {
      const data = await api("/api/v1/test-cases/run", {
        method: "POST",
        body: JSON.stringify({
          prompt: testPrompt,
          input: testInput,
          expected_output: expectedOutput,
        }),
      });

      setTestResult(data);
    } catch (error) {
      setTestError(error.message);
    } finally {
      setTestLoading(false);
    }
  }

  async function runSavedTest(id) {
    setTestLoading(true);
    setTestError("");

    try {
      const selectedVersionId = selectedTestVersions[id];

      const query = selectedVersionId
        ? `?prompt_version_id=${selectedVersionId}`
        : "";

      const data = await api(`/api/v1/test-cases/${id}/run${query}`, {
        method: "POST",
      });

      setTestResult(data);
      await loadTestCases();
    } catch (error) {
      setTestError(error.message);
    } finally {
      setTestLoading(false);
    }
  }

  async function deleteTestCase(id) {
    if (!window.confirm("Delete this test case?")) return;

    setTestError("");

    try {
      await api(`/api/v1/test-cases/${id}`, {
        method: "DELETE",
      });

      await loadTestCases();
    } catch (error) {
      setTestError(error.message);
    }
  }

  async function loadVersions(name = versionName) {
    setLoadingVersions(true);
    setVersionError("");

    try {
      const encodedName = encodeURIComponent(name.trim());
      const data = await api(`/api/v1/prompt-versions/${encodedName}`);

      const list = data?.versions || [];

      setVersions(list);

      if (list.length > 0) {
        setCompareA(String(list[0].version));
        setRegressionOldVersion(String(list[0].id));

        if (list.length > 1) {
          setCompareB(String(list[1].version));
          setRegressionNewVersion(String(list[1].id));
        } else {
          setCompareB("");
          setRegressionNewVersion("");
        }
      } else {
        setCompareA("");
        setCompareB("");
        setRegressionOldVersion("");
        setRegressionNewVersion("");
      }
    } catch (error) {
      setVersionError(error.message);
      setVersions([]);
    } finally {
      setLoadingVersions(false);
    }
  }

  async function createVersion() {
    setVersionError("");
    setVersionMessage("");

    if (!versionName.trim() || !versionPrompt.trim()) {
      setVersionError("Prompt name and prompt are required.");
      return;
    }

    try {
      const query = new URLSearchParams({
        prompt_name: versionName.trim(),
        prompt: versionPrompt.trim(),
      });

      await api(`/api/v1/prompt-versions/?${query.toString()}`, {
        method: "POST",
      });

      setVersionMessage("Prompt version created successfully.");

      await loadVersions(versionName.trim());
    } catch (error) {
      setVersionError(error.message);
    }
  }

  async function compareVersions() {
    if (!versionName.trim()) {
      setComparisonError("Enter a prompt name first.");
      return;
    }

    if (!compareA || !compareB) {
      setComparisonError("Select both Version A and Version B.");
      return;
    }

    if (compareA === compareB) {
      setComparisonError("Choose two different versions.");
      return;
    }

    setComparisonLoading(true);
    setComparisonError("");
    setComparison(null);

    try {
      const name = encodeURIComponent(versionName.trim());

      const data = await api(
     `/api/v1/prompt-versions/compare/${name}?version_a=${compareA}&version_b=${compareB}`
      );
      setComparison(data);
    } catch (error) {
      setComparisonError(error.message);
    } finally {
      setComparisonLoading(false);
    }
  }

  async function loadDashboard() {
    setDashboardLoading(true);
    setDashboardError("");

    try {
      const [cases, runs] = await Promise.all([
        api("/api/v1/test-cases/"),
        api("/api/v1/test-cases/runs"),
      ]);

      setTestCases(
        Array.isArray(cases) ? cases : cases?.test_cases || []
      );

      setTestRuns(runs?.runs || []);
    } catch (error) {
      setDashboardError(error.message);
    } finally {
      setDashboardLoading(false);
    }
  }

  async function runRegressionComparison() {
    setRegressionLoading(true);
    setRegressionError("");
    setRegressionResult(null);

    if (!regressionOldVersion || !regressionNewVersion) {
      setRegressionError(
        "Please select both an old and a new prompt version."
      );
      setRegressionLoading(false);
      return;
    }

    if (regressionOldVersion === regressionNewVersion) {
      setRegressionError(
        "Please select two different prompt versions."
      );
      setRegressionLoading(false);
      return;
    }

    try {
      const data = await api(
        `/api/v1/test-cases/regression/${regressionOldVersion}/${regressionNewVersion}`
      );

      setRegressionResult(data);
    } catch (error) {
      setRegressionError(error.message);
    } finally {
      setRegressionLoading(false);
    }
  }

  async function runRegressionGate() {
    setRegressionGateLoading(true);
    setRegressionGateError("");
    setRegressionGateResult(null);

    if (!regressionOldVersion || !regressionNewVersion) {
      setRegressionGateError(
        "Please select both an old and a new prompt version."
      );
      setRegressionGateLoading(false);
      return;
    }

    if (regressionOldVersion === regressionNewVersion) {
      setRegressionGateError(
        "Please select two different prompt versions."
      );
      setRegressionGateLoading(false);
      return;
    }

    try {
      const data = await api(
        `/api/v1/test-cases/regression-gate/${regressionOldVersion}/${regressionNewVersion}`
      );

      setRegressionGateResult(data);
    } catch (error) {
      setRegressionGateError(error.message);
    } finally {
      setRegressionGateLoading(false);
    }
  }

  async function runRegressionSuite() {
    setSuiteLoading(true);
    setRegressionError("");
    setSuiteMessage("");
    setRegressionResult(null);
    setRegressionGateResult(null);
    setRegressionGateError("");

    if (!regressionNewVersion) {
      setRegressionError(
        "Please select a new prompt version to run the test suite."
      );
      setSuiteLoading(false);
      return;
    }

    try {
      const data = await api(
        `/api/v1/test-cases/run-all/${regressionNewVersion}`,
        {
          method: "POST",
        }
      );

      const summary = data?.summary;

      const totalTests =
        summary?.total_tests ?? data?.results?.length ?? 0;

      const passedTests = summary?.passed_tests ?? 0;
      const failedTests = summary?.failed_tests ?? 0;

      setSuiteMessage(
        `Test suite completed: ${totalTests} tests processed — ${passedTests} passed, ${failedTests} failed.`
      );

      await loadTestCases();

      if (
        regressionOldVersion &&
        regressionOldVersion !== regressionNewVersion
      ) {
        try {
          const comparisonData = await api(
            `/api/v1/test-cases/regression/${regressionOldVersion}/${regressionNewVersion}`
          );

          setRegressionResult(comparisonData);
        } catch (error) {
          setRegressionError(
            `Test suite completed, but comparison could not run: ${error.message}`
          );
        }
      }
    } catch (error) {
      setRegressionError(error.message);
    } finally {
      setSuiteLoading(false);
    }
  }

  async function loadAnalytics(versionId) {
    if (!versionId) {
      setAnalytics(null);
      return;
    }

    setAnalyticsLoading(true);

    try {
      const data = await api(
        `/api/v1/test-cases/analytics/${versionId}`
      );

      setAnalytics(data.analytics);
    } catch {
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  }

  // Prompt Optimizer
  async function optimizePrompt() {
    setOptimizerError("");
    setOptimizerResult(null);

    if (!optimizerPrompt.trim()) {
      setOptimizerError("Original prompt is required.");
      return;
    }

    if (!optimizerInput.trim()) {
      setOptimizerError("User input is required.");
      return;
    }

    if (!optimizerExpected.trim()) {
      setOptimizerError("Expected output is required.");
      return;
    }

    if (!optimizerActual.trim()) {
      setOptimizerError("Actual output is required.");
      return;
    }

    setOptimizerLoading(true);

    try {
      const data = await api("/api/v1/prompts/optimize", {
        method: "POST",
        body: JSON.stringify({
          prompt: optimizerPrompt,
          input: optimizerInput,
          expected_output: optimizerExpected,
          actual_output: optimizerActual,
        }),
      });

      setOptimizerResult(data);
    } catch (error) {
      setOptimizerError(error.message);
    } finally {
      setOptimizerLoading(false);
    }
  }

  function usePlaygroundForOptimizer() {
    setOptimizerPrompt(prompt);
    setOptimizerInput(promptInput);

    if (promptOutput) {
      setOptimizerActual(promptOutput);
    }

    setPage("optimizer");
  }

  function useTestResultForOptimizer() {
    setOptimizerPrompt(testPrompt);
    setOptimizerInput(testInput);
    setOptimizerExpected(expectedOutput);

    if (testResult?.actual_output) {
      setOptimizerActual(testResult.actual_output);
    }

    setPage("optimizer");
  }

  useEffect(() => {
    if (page === "dashboard") {
      loadDashboard();
    }

    if (page === "testcases") {
      loadTestCases();
      loadTestVersions();
    }

    if (page === "versions") {
      loadVersions();
    }

    if (page === "regression") {
      loadVersions();
    }

    if (page === "history") {
      loadTestCases();
    }
  }, [page]);

  const totalRuns = testRuns.length;

  const passedRuns = useMemo(
    () => testRuns.filter((run) => run.passed).length,
    [testRuns]
  );

  const averageScore = useMemo(() => {
    if (!testRuns.length) return 0;

    return (
      testRuns.reduce(
        (sum, run) => sum + Number(run.score || 0),
        0
      ) / testRuns.length
    ).toFixed(2);
  }, [testRuns]);

  function renderSidebar() {
    const items = [
      ["dashboard", "Dashboard"],
      ["playground", "Playground"],
      ["optimizer", "Prompt Optimizer"],
      ["testcases", "Test Cases"],
      ["history", "Run History"],
      ["versions", "Prompt Versions"],
      ["regression", "Regression Testing"],
    ];

    return (
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          Prompt<span style={styles.logoAccent}>Forge</span>
        </div>

        {items.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setPage(key)}
            style={{
              ...styles.navButton,
              background:
                page === key ? "#21262d" : "transparent",
              color:
                page === key ? "#58a6ff" : "#c9d1d9",
            }}
          >
            {label}
          </button>
        ))}
      </aside>
    );
  }

  function renderDashboard() {
    const failedRuns = totalRuns - passedRuns;

    const passRate = totalRuns
      ? ((passedRuns / totalRuns) * 100).toFixed(2)
      : "0.00";

    const recentRuns = [...testRuns]
      .sort(
        (a, b) =>
          new Date(b.created_at || 0) -
          new Date(a.created_at || 0)
      )
      .slice(0, 8);

    return (
      <>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              PromptForge Dashboard
            </h1>

            <div style={styles.subtitle}>
              Monitor prompt testing, evaluation results,
              and stored runs.
            </div>
          </div>

          <button
            style={styles.secondaryButton}
            onClick={loadDashboard}
            disabled={dashboardLoading}
          >
            {dashboardLoading
              ? "Refreshing..."
              : "Refresh Dashboard"}
          </button>
        </div>

        {dashboardError && (
          <div style={styles.error}>{dashboardError}</div>
        )}

        <div style={styles.grid3}>
          <div style={styles.stat}>
            <div style={styles.statNumber}>
              {testCases.length}
            </div>
            <div style={styles.statLabel}>
              Total Test Cases
            </div>
          </div>

          <div style={styles.stat}>
            <div style={styles.statNumber}>
              {totalRuns}
            </div>
            <div style={styles.statLabel}>
              Total Test Runs
            </div>
          </div>

          <div style={styles.stat}>
            <div style={styles.statNumber}>
              {averageScore}
            </div>
            <div style={styles.statLabel}>
              Average Score
            </div>
          </div>

          <div style={styles.stat}>
            <div style={styles.statNumber}>
              {passedRuns}
            </div>
            <div style={styles.statLabel}>
              Passed Runs
            </div>
          </div>

          <div style={styles.stat}>
            <div style={styles.statNumber}>
              {failedRuns}
            </div>
            <div style={styles.statLabel}>
              Failed Runs
            </div>
          </div>

          <div style={styles.stat}>
            <div style={styles.statNumber}>
              {passRate}%
            </div>
            <div style={styles.statLabel}>
              Pass Rate
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={{ marginTop: 0 }}>
            Recent Test Runs
          </h3>

          {recentRuns.length === 0 ? (
            <div style={styles.subtitle}>
              No test runs yet.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Run</th>
                    <th style={styles.th}>Test Case</th>
                    <th style={styles.th}>Version</th>
                    <th style={styles.th}>Score</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Created</th>
                  </tr>
                </thead>

                <tbody>
                  {recentRuns.map((run) => (
                    <tr key={run.run_id}>
                      <td style={styles.td}>
                        #{run.run_id ?? "—"}
                      </td>

                      <td style={styles.td}>
                        #{run.test_case_id ?? "—"}
                      </td>

                      <td style={styles.td}>
                        {run.prompt_version_id
                          ? `#${run.prompt_version_id}`
                          : "—"}
                      </td>

                      <td style={styles.td}>
                        {run.score ?? "—"}
                      </td>

                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            background: run.passed
                              ? "#16301d"
                              : "#3d1f24",
                            color: run.passed
                              ? "#aff5b8"
                              : "#ffb3b3",
                          }}
                        >
                          {run.passed
                            ? "PASSED"
                            : "FAILED"}
                        </span>
                      </td>

                      <td style={styles.td}>
                        {run.created_at
                          ? new Date(
                              run.created_at
                            ).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={styles.grid2}>
          <div style={styles.card}>
            <h3 style={{ marginTop: 0 }}>
              What PromptForge Tracks
            </h3>

            <div style={styles.subtitle}>
              PromptForge stores evaluation runs so you
              can inspect how prompts behave over time.
            </div>

            <ul
              style={{
                lineHeight: 1.9,
                color: "#c9d1d9",
              }}
            >
              <li>Prompt test cases</li>
              <li>Evaluation scores</li>
              <li>Pass and fail results</li>
              <li>Prompt version IDs</li>
              <li>Run history</li>
            </ul>
          </div>

          <div style={styles.card}>
            <h3 style={{ marginTop: 0 }}>
              Quick Actions
            </h3>

            <button
              style={styles.button}
              onClick={() => setPage("testcases")}
            >
              Open Test Cases
            </button>

            <br />

            <button
              style={styles.secondaryButton}
              onClick={() => setPage("versions")}
            >
              Manage Prompt Versions
            </button>

            <br />

            <button
              style={styles.secondaryButton}
              onClick={() => setPage("optimizer")}
            >
              Optimize a Prompt
            </button>

            <br />

            <button
              style={styles.secondaryButton}
              onClick={() => setPage("history")}
            >
              View Run History
            </button>
          </div>
        </div>
      </>
    );
  }

  function renderPlayground() {
    return (
      <>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              AI Prompt Playground
            </h1>

            <div style={styles.subtitle}>
              Test a prompt against Gemini and inspect the
              generated output.
            </div>
          </div>
        </div>

        {promptError && (
          <div style={styles.error}>
            {promptError}
          </div>
        )}

        <div style={styles.card}>
          <label style={styles.label}>
            Prompt
          </label>

          <textarea
            style={styles.textarea}
            value={prompt}
            onChange={(event) =>
              setPrompt(event.target.value)
            }
          />

          <label style={styles.label}>
            Input
          </label>

          <textarea
            style={{
              ...styles.textarea,
              minHeight: "100px",
            }}
            value={promptInput}
            onChange={(event) =>
              setPromptInput(event.target.value)
            }
          />

          <button
            style={styles.button}
            onClick={runPrompt}
            disabled={promptLoading}
          >
            {promptLoading
              ? "Running..."
              : "Run Prompt"}
          </button>

          {promptOutput && (
            <>
              <h3>Output</h3>

              <div style={styles.output}>
                {promptOutput}
              </div>

              <button
                style={{
                  ...styles.secondaryButton,
                  borderColor: "#58a6ff",
                  color: "#58a6ff",
                }}
                onClick={usePlaygroundForOptimizer}
              >
                Optimize This Prompt
              </button>
            </>
          )}
        </div>

        <div style={styles.grid3}>
          <div style={styles.stat}>
            <div style={styles.statNumber}>
              {testCases.length}
            </div>

            <div style={styles.statLabel}>
              Saved Test Cases
            </div>
          </div>

          <div style={styles.stat}>
            <div style={styles.statNumber}>
              {totalRuns}
            </div>

            <div style={styles.statLabel}>
              Stored Test Runs
            </div>
          </div>

          <div style={styles.stat}>
            <div style={styles.statNumber}>
              {averageScore}
            </div>

            <div style={styles.statLabel}>
              Average Score
            </div>
          </div>
        </div>
      </>
    );
  }

  function renderOptimizer() {
    return (
      <>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              Prompt Optimizer
            </h1>

            <div style={styles.subtitle}>
              Analyze a failed prompt test and generate an
              improved version using PromptForge's AI
              debugging engine.
            </div>
          </div>
        </div>

        {optimizerError && (
          <div style={styles.error}>
            {optimizerError}
          </div>
        )}

        <div style={styles.card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h3 style={{ marginTop: 0, marginBottom: "5px" }}>
                Prompt Analysis
              </h3>

              <div style={styles.subtitle}>
                Give PromptForge the original prompt and
                compare the expected result with the actual
                AI output.
              </div>
            </div>

            <button
              style={styles.secondaryButton}
              onClick={usePlaygroundForOptimizer}
            >
              Use Playground Data
            </button>
          </div>

          <label style={styles.label}>
            Original Prompt
          </label>

          <textarea
            style={styles.textarea}
            value={optimizerPrompt}
            onChange={(event) =>
              setOptimizerPrompt(event.target.value)
            }
            placeholder="Enter the prompt that needs improvement..."
          />

          <label style={styles.label}>
            User Input
          </label>

          <textarea
            style={{
              ...styles.textarea,
              minHeight: "100px",
            }}
            value={optimizerInput}
            onChange={(event) =>
              setOptimizerInput(event.target.value)
            }
            placeholder="Enter the input given to the prompt..."
          />

          <label style={styles.label}>
            Expected Output
          </label>

          <textarea
            style={styles.textarea}
            value={optimizerExpected}
            onChange={(event) =>
              setOptimizerExpected(event.target.value)
            }
            placeholder="What should the AI have returned?"
          />

          <label style={styles.label}>
            Actual Output
          </label>

          <textarea
            style={styles.textarea}
            value={optimizerActual}
            onChange={(event) =>
              setOptimizerActual(event.target.value)
            }
            placeholder="What did the AI actually return?"
          />

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              style={styles.button}
              onClick={optimizePrompt}
              disabled={optimizerLoading}
            >
              {optimizerLoading
                ? "Analyzing..."
                : "Optimize Prompt"}
            </button>

            <button
              style={styles.secondaryButton}
              onClick={() => {
                setOptimizerPrompt(
                  "Explain the given computer science topic."
                );
                setOptimizerInput("Binary Search");
                setOptimizerExpected(
                  "Binary search works on a sorted array and repeatedly halves the search space. Its time complexity is O(log n)."
                );
                setOptimizerActual(
                  "Binary search is a searching algorithm that checks every element one by one. Its time complexity is O(n)."
                );
                setOptimizerResult(null);
                setOptimizerError("");
              }}
              disabled={optimizerLoading}
            >
              Load Example
            </button>
          </div>
        </div>

        {optimizerResult && (
          <>
            <div style={styles.card}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "15px",
                }}
              >
                <span
                  style={{
                    ...styles.badge,
                    background: "#30260f",
                    color: "#e3b341",
                    padding: "7px 10px",
                  }}
                >
                  ANALYSIS
                </span>

                <h3 style={{ margin: 0 }}>
                  What PromptForge Found
                </h3>
              </div>

              <h4>Problem</h4>

              <div style={styles.output}>
                {optimizerResult.problem || "No problem returned."}
              </div>

              <h4>Reason</h4>

              <div style={styles.output}>
                {optimizerResult.reason || "No reason returned."}
              </div>

              <h4>Suggested Improvement</h4>

              <div style={styles.output}>
                {optimizerResult.suggestion ||
                  "No suggestion returned."}
              </div>
            </div>

            <div style={styles.card}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "15px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h3 style={{ marginTop: 0 }}>
                    Optimized Prompt
                  </h3>

                  <div style={styles.subtitle}>
                    PromptForge's generated improved version.
                  </div>
                </div>

                <button
                  style={styles.secondaryButton}
                  onClick={() => {
                    setOptimizerPrompt(
                      optimizerResult.optimized_prompt || ""
                    );
                  }}
                >
                  Use as Original Prompt
                </button>
              </div>

              <div
                style={{
                  ...styles.output,
                  borderColor: "#238636",
                  lineHeight: 1.7,
                }}
              >
                {optimizerResult.optimized_prompt ||
                  "No optimized prompt returned."}
              </div>
            </div>
          </>
        )}
      </>
    );
  }

  function renderTestCases() {
    return (
      <>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              Test Cases
            </h1>

            <div style={styles.subtitle}>
              Create reusable prompt tests and evaluate
              their outputs.
            </div>
          </div>

          <button
            style={styles.secondaryButton}
            onClick={loadTestCases}
          >
            Refresh
          </button>
        </div>

        {testError && (
          <div style={styles.error}>
            {testError}
          </div>
        )}

        <div style={styles.card}>
          <h3 style={{ marginTop: 0 }}>
            Create Test Case
          </h3>

          <label style={styles.label}>
            Prompt
          </label>

          <textarea
            style={styles.textarea}
            value={testPrompt}
            onChange={(event) =>
              setTestPrompt(event.target.value)
            }
          />

          <label style={styles.label}>
            Input
          </label>

          <input
            style={styles.input}
            value={testInput}
            onChange={(event) =>
              setTestInput(event.target.value)
            }
          />

          <label style={styles.label}>
            Expected Output
          </label>

          <textarea
            style={{
              ...styles.textarea,
              minHeight: "100px",
            }}
            value={expectedOutput}
            onChange={(event) =>
              setExpectedOutput(event.target.value)
            }
          />

          <button
            style={styles.button}
            onClick={createTestCase}
            disabled={testLoading}
          >
            {testLoading
              ? "Saving..."
              : "Save Test Case"}
          </button>

          <button
            style={{
              ...styles.secondaryButton,
              marginLeft: "10px",
            }}
            onClick={runUnsavedTest}
            disabled={testLoading}
          >
            Run Without Saving
          </button>
        </div>

        {testResult && (
          <div style={styles.card}>
            <h3 style={{ marginTop: 0 }}>
              Latest Evaluation
            </h3>

            <div style={styles.grid3}>
              <div style={styles.stat}>
                <div style={styles.statNumber}>
                  {testResult.evaluation?.score ??
                    testResult.score ??
                    "—"}
                </div>

                <div style={styles.statLabel}>
                  Score
                </div>
              </div>

              <div style={styles.stat}>
                <div style={styles.statNumber}>
                 {(testResult.demo_mode || testResult.evaluation?.demo_mode)
                  ?  "DEMO — NOT EVALUATED"
                      :   ((testResult.evaluation?.passed ?? testResult.passed)
                      ? "PASS"
                      : "FAIL")}
                </div>

                <div style={styles.statLabel}>
                  Result
                </div>
              </div>

              <div style={styles.stat}>
                <div style={styles.statNumber}>
                  {testResult.evaluation?.criteria
                    ? "3"
                    : "—"}
                </div>

                <div style={styles.statLabel}>
                  Evaluation Criteria
                </div>
              </div>
            </div>

            {testResult.actual_output && (
              <>
                <h4>Actual Output</h4>

                <div style={styles.output}>
                  {testResult.actual_output}
                </div>

                <button
                  style={{
                    ...styles.secondaryButton,
                    borderColor: "#58a6ff",
                    color: "#58a6ff",
                  }}
                  onClick={useTestResultForOptimizer}
                >
                  Analyze With Prompt Optimizer
                </button>
              </>
            )}

            {testResult.evaluation?.reason && (
              <>
                <h4>Evaluator Reason</h4>

                <div style={styles.output}>
                  {testResult.evaluation.reason}
                </div>
              </>
            )}
          </div>
        )}

        <div style={styles.card}>
          <h3 style={{ marginTop: 0 }}>
            Saved Test Cases
          </h3>

          {loadingTests ? (
            <div style={styles.subtitle}>
              Loading...
            </div>
          ) : testCases.length === 0 ? (
            <div style={styles.subtitle}>
              No saved test cases yet.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Input</th>
                    <th style={styles.th}>
                      Expected Output
                    </th>
                    <th style={styles.th}>
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {testCases.map((item) => (
                    <tr key={item.id}>
                      <td style={styles.td}>
                        #{item.id}
                      </td>

                      <td style={styles.td}>
                        {item.input}
                      </td>

                      <td style={styles.td}>
                        {item.expected_output}
                      </td>

                      <td style={styles.td}>
                        <select
                          style={{
                            ...styles.select,
                            width: "170px",
                            marginTop: 0,
                            marginBottom: "8px",
                          }}
                          value={
                            selectedTestVersions[
                              item.id
                            ] || ""
                          }
                          onChange={(event) =>
                            setSelectedTestVersions(
                              (current) => ({
                                ...current,
                                [item.id]:
                                  event.target.value,
                              })
                            )
                          }
                          disabled={
                            testVersionsLoading
                          }
                        >
                          <option value="">
                            {testVersionsLoading
                              ? "Loading versions..."
                              : "No version selected"}
                          </option>

                          {testVersions.map(
                            (version) => (
                              <option
                                key={version.id}
                                value={version.id}
                              >
                                Version{" "}
                                {version.version}
                              </option>
                            )
                          )}
                        </select>

                        <div>
                          <button
                            style={styles.button}
                            onClick={() =>
                              runSavedTest(item.id)
                            }
                            disabled={testLoading}
                          >
                            {testLoading
                              ? "Running..."
                              : "Run Test"}
                          </button>

                          <button
                            style={{
                              ...styles.dangerButton,
                              marginLeft: "8px",
                            }}
                            onClick={() =>
                              deleteTestCase(item.id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    );
  }

  function renderHistory() {
    return (
      <>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              Run History
            </h1>

            <div style={styles.subtitle}>
              Stored evaluation runs from PromptForge.
            </div>
          </div>

          <button
            style={styles.secondaryButton}
            onClick={loadTestCases}
          >
            Refresh
          </button>
        </div>

        {testError && (
          <div style={styles.error}>
            {testError}
          </div>
        )}

        <div style={styles.grid3}>
          <div style={styles.stat}>
            <div style={styles.statNumber}>
              {totalRuns}
            </div>

            <div style={styles.statLabel}>
              Total Runs
            </div>
          </div>

          <div style={styles.stat}>
            <div style={styles.statNumber}>
              {passedRuns}
            </div>

            <div style={styles.statLabel}>
              Passed
            </div>
          </div>

          <div style={styles.stat}>
            <div style={styles.statNumber}>
              {averageScore}
            </div>

            <div style={styles.statLabel}>
              Average Score
            </div>
          </div>
        </div>

        <div style={styles.card}>
          {loadingTests ? (
            <div style={styles.subtitle}>
              Loading history...
            </div>
          ) : testRuns.length === 0 ? (
            <div style={styles.subtitle}>
              No test runs yet.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Run</th>
                    <th style={styles.th}>
                      Test Case
                    </th>
                    <th style={styles.th}>
                      Version
                    </th>
                    <th style={styles.th}>Score</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Created</th>
                  </tr>
                </thead>

                <tbody>
                  {testRuns.map((run) => (
                    <tr key={run.run_id}>
                      <td style={styles.td}>
                        #{run.run_id ?? "—"}
                      </td>

                      <td style={styles.td}>
                        #{run.test_case_id ?? "—"}
                      </td>

                      <td style={styles.td}>
                        {run.prompt_version_id
                          ? `#${run.prompt_version_id}`
                          : "—"}
                      </td>

                      <td style={styles.td}>
                        {run.score}
                      </td>

                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            background: run.passed
                              ? "#16301d"
                              : "#3d1f24",
                            color: run.passed
                              ? "#aff5b8"
                              : "#ffb3b3",
                          }}
                        >
                          {run.passed
                            ? "PASSED"
                            : "FAILED"}
                        </span>
                      </td>

                      <td style={styles.td}>
                        {run.created_at
                          ? new Date(
                              run.created_at
                            ).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    );
  }

  function renderVersionList() {
    return (
      <div style={styles.card}>
        <h3 style={{ marginTop: 0 }}>
          Stored Versions
        </h3>

        {loadingVersions ? (
          <div style={styles.subtitle}>
            Loading versions...
          </div>
        ) : versions.length === 0 ? (
          <div style={styles.subtitle}>
            No versions found for this prompt name.
          </div>
        ) : (
          versions.map((version) => (
            <div
              key={version.id}
              style={{
                borderTop: "1px solid #30363d",
                padding: "16px 0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "15px",
                  alignItems: "center",
                }}
              >
                <strong>
                  Version {version.version}
                </strong>

                <button
                  style={styles.secondaryButton}
                  onClick={() => {
                    const value = String(
                      version.version
                    );

                    if (
                      !compareA ||
                      compareA === value
                    ) {
                      setCompareA(value);
                    } else {
                      setCompareB(value);
                    }

                    setComparison(null);
                    setComparisonError("");
                  }}
                >
                  Use in Compare
                </button>
              </div>

              <div style={styles.output}>
                {version.prompt}
              </div>

              <div style={styles.subtitle}>
                ID: {version.id}{" "}
                {version.created_at
                  ? `· Created ${new Date(
                      version.created_at
                    ).toLocaleString()}`
                  : ""}
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  function renderComparison() {
    const versionOptions = versions.map(
      (version) => String(version.version)
    );

    return (
      <div style={styles.card}>
        <h3 style={{ marginTop: 0 }}>
          Version Comparison
        </h3>

        <div style={styles.grid2}>
          <div>
            <label style={styles.label}>
              Version A
            </label>

            <select
              style={styles.select}
              value={compareA}
              onChange={(event) => {
                setCompareA(event.target.value);
                setComparison(null);
              }}
            >
              <option value="">
                Select Version A
              </option>

              {versionOptions.map((version) => (
                <option
                  key={version}
                  value={version}
                >
                  Version {version}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={styles.label}>
              Version B
            </label>

            <select
              style={styles.select}
              value={compareB}
              onChange={(event) => {
                setCompareB(event.target.value);
                setComparison(null);
              }}
            >
              <option value="">
                Select Version B
              </option>

              {versionOptions.map((version) => (
                <option
                  key={version}
                  value={version}
                >
                  Version {version}
                </option>
              ))}
            </select>
          </div>
        </div>

        {comparisonError && (
          <div
            style={{
              ...styles.error,
              marginTop: "15px",
            }}
          >
            {comparisonError}
          </div>
        )}

        <button
          style={styles.button}
          onClick={compareVersions}
          disabled={comparisonLoading}
        >
          {comparisonLoading
            ? "Comparing..."
            : "Compare Versions"}
        </button>

        {comparison && (
          <div style={{ marginTop: "22px" }}>
            <div style={styles.grid3}>
              <div style={styles.stat}>
                <div style={styles.statNumber}>
                  {Number(
                    comparison.version_a.average_score
                  ).toFixed(2)}
                </div>

                <div style={styles.statLabel}>
                  Version{" "}
                  {comparison.version_a.version}{" "}
                  Average
                </div>
              </div>

              <div style={styles.stat}>
                <div style={styles.statNumber}>
                  {Number(
                    comparison.version_b.average_score
                  ).toFixed(2)}
                </div>

                <div style={styles.statLabel}>
                  Version{" "}
                  {comparison.version_b.version}{" "}
                  Average
                </div>
              </div>

              <div style={styles.stat}>
                <div style={styles.statNumber}>
                  {Number(
                    comparison.score_difference
                  ) > 0
                    ? "+"
                    : ""}
                  {Number(
                    comparison.score_difference
                  ).toFixed(2)}
                </div>

                <div style={styles.statLabel}>
                  Score Difference (B − A)
                </div>
              </div>
            </div>

            <div
              style={{
                ...styles.card,
                marginTop: "16px",
              }}
            >
              <h4 style={{ marginTop: 0 }}>
                Stored Evaluation Data
              </h4>

              <div style={styles.grid2}>
                <div>
                  <strong>
                    Version{" "}
                    {comparison.version_a.version}
                  </strong>

                  <div style={styles.subtitle}>
                    {
                      comparison.version_a
                        .passed_tests
                    }
                    /
                    {
                      comparison.version_a
                        .total_tests
                    }{" "}
                    tests passed
                    <br />
                    {Number(
                      comparison.version_a
                        .pass_rate
                    ).toFixed(2)}
                    % pass rate
                  </div>
                </div>

                <div>
                  <strong>
                    Version{" "}
                    {comparison.version_b.version}
                  </strong>

                  <div style={styles.subtitle}>
                    {
                      comparison.version_b
                        .passed_tests
                    }
                    /
                    {
                      comparison.version_b
                        .total_tests
                    }{" "}
                    tests passed
                    <br />
                    {Number(
                      comparison.version_b
                        .pass_rate
                    ).toFixed(2)}
                    % pass rate
                  </div>
                </div>
              </div>

              <div style={styles.output}>
                {comparison.result}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderVersions() {
    return (
      <>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              Prompt Versions
            </h1>

            <div style={styles.subtitle}>
              Track prompt versions and compare stored
              evaluation results.
            </div>
          </div>

          <button
            style={styles.secondaryButton}
            onClick={() =>
              loadVersions(versionName)
            }
          >
            {loadingVersions
              ? "Loading..."
              : "Load Versions"}
          </button>
        </div>

        {versionError && (
          <div style={styles.error}>
            {versionError}
          </div>
        )}

        {versionMessage && (
          <div style={styles.success}>
            {versionMessage}
          </div>
        )}

        <div style={styles.card}>
          <h3 style={{ marginTop: 0 }}>
            Create Prompt Version
          </h3>

          <label style={styles.label}>
            Prompt Name
          </label>

          <input
            style={styles.input}
            value={versionName}
            onChange={(event) =>
              setVersionName(event.target.value)
            }
            placeholder="e.g. Binary Search"
          />

          <label style={styles.label}>
            Prompt
          </label>

          <textarea
            style={styles.textarea}
            value={versionPrompt}
            onChange={(event) =>
              setVersionPrompt(event.target.value)
            }
          />

          <button
            style={styles.button}
            onClick={createVersion}
          >
            Create New Version
          </button>
        </div>

        {renderVersionList()}

        {versions.length > 0 &&
          renderComparison()}

        <div style={styles.card}>
          <h3 style={{ marginTop: 0 }}>
            Version Analytics
          </h3>

          <label style={styles.label}>
            Prompt Version
          </label>

          <select
            style={styles.select}
            value={analyticsVersionId}
            onChange={(event) => {
              setAnalyticsVersionId(
                event.target.value
              );

              loadAnalytics(
                event.target.value
              );
            }}
          >
            <option value="">
              Select a prompt version
            </option>

            {versions.map((version) => (
              <option
                key={version.id}
                value={version.id}
              >
                Version {version.version} — ID{" "}
                {version.id}
              </option>
            ))}
          </select>

          {analyticsLoading && (
            <div style={styles.subtitle}>
              Loading analytics...
            </div>
          )}

          {analytics && (
            <div
              style={{
                ...styles.grid3,
                marginTop: "18px",
              }}
            >
              <div style={styles.stat}>
                <div style={styles.statNumber}>
                  {analytics.total_runs ?? 0}
                </div>

                <div style={styles.statLabel}>
                  Total Runs
                </div>
              </div>

              <div style={styles.stat}>
                <div style={styles.statNumber}>
                  {Number(
                    analytics.average_score ?? 0
                  ).toFixed(2)}
                </div>

                <div style={styles.statLabel}>
                  Average Score
                </div>
              </div>

              <div style={styles.stat}>
                <div style={styles.statNumber}>
                  {Number(
                    analytics.pass_rate ?? 0
                  ).toFixed(2)}
                  %
                </div>

                <div style={styles.statLabel}>
                  Pass Rate
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  function renderRegression() {
    const result = regressionResult;

    const comparison = result?.comparison;

    const regressions = result?.regressions || [];
    const improvements = result?.improvements || [];
    const unchanged = result?.unchanged || [];

    const selectedOldVersion = versions.find(
      (version) =>
        String(version.id) === String(regressionOldVersion)
    );

    const selectedNewVersion = versions.find(
      (version) =>
        String(version.id) === String(regressionNewVersion)
    );

    const storedRunsForOldVersion = testRuns.filter(
      (run) =>
        String(run.prompt_version_id) ===
        String(regressionOldVersion)
    );

    const storedRunsForNewVersion = testRuns.filter(
      (run) =>
        String(run.prompt_version_id) ===
        String(regressionNewVersion)
    );

    return (
      <>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              Regression Testing
            </h1>

            <div style={styles.subtitle}>
              Compare stored evaluation results between two
              prompt versions without using Gemini.
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={{ marginTop: 0 }}>
            Compare Prompt Versions
          </h3>

          <div style={styles.grid2}>
            <div>
              <label style={styles.label}>
                Old Version
              </label>

              <select
                style={styles.input}
                value={regressionOldVersion}
                onChange={(event) => {
                  setRegressionOldVersion(
                    event.target.value
                  );

                  setRegressionResult(null);
                  setRegressionGateResult(null);
                  setRegressionError("");
                  setRegressionGateError("");
                }}
              >
                <option value="">
                  Select old version
                </option>

                {versions.map((version) => (
                  <option
                    key={version.id}
                    value={version.id}
                  >
                    {version.prompt_name || versionName} —
                    Version {version.version}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={styles.label}>
                New Version
              </label>

              <select
                style={styles.input}
                value={regressionNewVersion}
                onChange={(event) => {
                  setRegressionNewVersion(
                    event.target.value
                  );

                  setRegressionResult(null);
                  setRegressionGateResult(null);
                  setRegressionError("");
                  setRegressionGateError("");
                }}
              >
                <option value="">
                  Select new version
                </option>

                {versions.map((version) => (
                  <option
                    key={version.id}
                    value={version.id}
                  >
                    {version.prompt_name || versionName} —
                    Version {version.version}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {regressionOldVersion &&
            regressionNewVersion &&
            regressionOldVersion !==
              regressionNewVersion && (
              <div
                style={{
                  ...styles.grid2,
                  marginTop: "16px",
                }}
              >
                <div style={styles.stat}>
                  <div style={styles.statNumber}>
                    {storedRunsForOldVersion.length}
                  </div>

                  <div style={styles.statLabel}>
                    Stored Runs —{" "}
                    {selectedOldVersion
                      ? `Version ${selectedOldVersion.version}`
                      : "Old Version"}
                  </div>
                </div>

                <div style={styles.stat}>
                  <div style={styles.statNumber}>
                    {storedRunsForNewVersion.length}
                  </div>

                  <div style={styles.statLabel}>
                    Stored Runs —{" "}
                    {selectedNewVersion
                      ? `Version ${selectedNewVersion.version}`
                      : "New Version"}
                  </div>
                </div>
              </div>
            )}

          {regressionOldVersion &&
            regressionNewVersion &&
            regressionOldVersion !==
              regressionNewVersion &&
            storedRunsForOldVersion.length === 0 && (
              <div
                style={{
                  ...styles.warning,
                  marginTop: "16px",
                  marginBottom: 0,
                }}
              >
                The selected old version has no stored test
                results yet. Run its saved tests before
                comparing versions.
              </div>
            )}

          {regressionOldVersion &&
            regressionNewVersion &&
            regressionOldVersion !==
              regressionNewVersion &&
            storedRunsForNewVersion.length === 0 && (
              <div
                style={{
                  ...styles.warning,
                  marginTop: "16px",
                  marginBottom: 0,
                }}
              >
                The selected new version has no stored test
                results yet. Use "Run Test Suite" to
                generate them.
              </div>
            )}

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              style={styles.button}
              onClick={runRegressionSuite}
              disabled={
                suiteLoading || versions.length === 0
              }
            >
              {suiteLoading
                ? "Running Test Suite..."
                : "Run Test Suite"}
            </button>

            <button
              style={styles.secondaryButton}
              onClick={runRegressionComparison}
              disabled={
                regressionLoading ||
                versions.length < 2 ||
                !regressionOldVersion ||
                !regressionNewVersion
              }
            >
              {regressionLoading
                ? "Comparing..."
                : "Compare Versions"}
            </button>

            <button
              style={{
                ...styles.secondaryButton,
                borderColor: "#58a6ff",
                color: "#58a6ff",
              }}
              onClick={runRegressionGate}
              disabled={
                regressionGateLoading ||
                versions.length < 2 ||
                !regressionOldVersion ||
                !regressionNewVersion
              }
            >
              {regressionGateLoading
                ? "Checking Gate..."
                : "Run Regression Gate"}
            </button>
          </div>

          <div
            style={{
              ...styles.subtitle,
              marginTop: "12px",
            }}
          >
            Run all saved test cases against the selected
            new version, then compare its stored results
            with the selected old version.
          </div>

          {versions.length < 2 && (
            <div style={styles.subtitle}>
              Create at least two prompt versions before
              running a comparison.
            </div>
          )}

          {suiteMessage && (
            <div style={styles.success}>
              {suiteMessage}
            </div>
          )}

          {regressionError && (
            <div style={styles.error}>
              {regressionError}
            </div>
          )}

          {regressionGateError && (
            <div style={styles.error}>
              {regressionGateError}
            </div>
          )}
        </div>

        {regressionGateResult && (
          <div style={styles.card}>
            <div style={styles.header}>
              <div>
                <h3 style={{ marginTop: 0 }}>
                  Regression Gate
                </h3>

                <div style={styles.subtitle}>
                  Version{" "}
                  {regressionGateResult.old_version?.version}{" "}
                  → Version{" "}
                  {regressionGateResult.new_version?.version}
                </div>
              </div>

              <span
                style={{
                  ...styles.badge,
                  background:
                    regressionGateResult.status ===
                    "PASS"
                      ? "#16301d"
                      : "#3d1f24",
                  color:
                    regressionGateResult.status ===
                    "PASS"
                      ? "#aff5b8"
                      : "#ffb3b3",
                  padding: "9px 14px",
                  fontSize: "13px",
                }}
              >
                {regressionGateResult.status === "PASS"
                  ? "PASS"
                  : "FAIL"}
              </span>
            </div>

            <div style={styles.grid3}>
              <div style={styles.stat}>
                <div style={styles.statNumber}>
                  {regressionGateResult.regression_count ??
                    0}
                </div>

                <div style={styles.statLabel}>
                  Regressions
                </div>
              </div>

              <div style={styles.stat}>
                <div style={styles.statNumber}>
                  {regressionGateResult.regression_detected
                    ? "YES"
                    : "NO"}
                </div>

                <div style={styles.statLabel}>
                  Regression Detected
                </div>
              </div>

              <div style={styles.stat}>
                <div style={styles.statNumber}>
                  {regressionGateResult.status}
                </div>

                <div style={styles.statLabel}>
                  Gate Status
                </div>
              </div>
            </div>

            {regressionGateResult.status === "PASS" ? (
              <div
                style={{
                  ...styles.success,
                  marginTop: "16px",
                  marginBottom: 0,
                }}
              >
                No regressions were detected. The selected
                prompt version passed the regression gate.
              </div>
            ) : (
              <div
                style={{
                  ...styles.error,
                  marginTop: "16px",
                  marginBottom: 0,
                }}
              >
                Regression detected. Review the failed test
                cases before treating this prompt version as
                safe.
              </div>
            )}

            {Array.isArray(
              regressionGateResult.regressions
            ) &&
              regressionGateResult.regressions.length >
                0 && (
                <div style={{ marginTop: "16px" }}>
                  <h4 style={{ marginBottom: "10px" }}>
                    Gate Regressions
                  </h4>

                  {regressionGateResult.regressions.map(
                    (item) => (
                      <div
                        key={`gate-regression-${item.test_case_id}`}
                        style={{
                          border:
                            "1px solid #5a3035",
                          borderRadius: "10px",
                          padding: "14px",
                          marginBottom: "10px",
                        }}
                      >
                        <strong>
                          Test #{item.test_case_id}
                        </strong>

                        <div style={styles.subtitle}>
                          {item.input}
                        </div>

                        <div
                          style={{
                            marginTop: "8px",
                          }}
                        >
                          {item.old_score} →{" "}
                          {item.new_score} (
                          {item.reason})
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
          </div>
        )}

        {result && comparison && (
          <>
            <div style={styles.card}>
              <div style={styles.header}>
                <div>
                  <h3 style={{ margin: 0 }}>
                    Regression Status
                  </h3>

                  <div style={styles.subtitle}>
                    Version{" "}
                    {result.old_version.version} → Version{" "}
                    {result.new_version.version}
                  </div>
                </div>

                <span
                  style={{
                    ...styles.badge,
                    background:
                      comparison.regression_detected
                        ? "#3d1f24"
                        : "#16301d",
                    color:
                      comparison.regression_detected
                        ? "#ffb3b3"
                        : "#aff5b8",
                    padding: "8px 12px",
                  }}
                >
                  {comparison.regression_detected
                    ? "REGRESSION DETECTED"
                    : "NO REGRESSION"}
                </span>
              </div>

              <div style={styles.grid3}>
                <div style={styles.stat}>
                  <div style={styles.statNumber}>
                    {result.old_version.average_score} →{" "}
                    {result.new_version.average_score}
                  </div>

                  <div style={styles.statLabel}>
                    Average Score
                  </div>
                </div>

                <div style={styles.stat}>
                  <div style={styles.statNumber}>
                    {result.old_version.pass_rate}% →{" "}
                    {result.new_version.pass_rate}%
                  </div>

                  <div style={styles.statLabel}>
                    Pass Rate
                  </div>
                </div>

                <div style={styles.stat}>
                  <div
                    style={{
                      ...styles.statNumber,
                      color:
                        comparison.score_difference < 0
                          ? "#ff7b72"
                          : "#aff5b8",
                    }}
                  >
                    {comparison.score_difference > 0
                      ? "+"
                      : ""}
                    {comparison.score_difference}
                  </div>

                  <div style={styles.statLabel}>
                    Score Change
                  </div>
                </div>
              </div>

              <div style={styles.grid3}>
                <div style={styles.stat}>
                  <div style={styles.statNumber}>
                    {comparison.regression_count}
                  </div>

                  <div style={styles.statLabel}>
                    Regressions
                  </div>
                </div>

                <div style={styles.stat}>
                  <div style={styles.statNumber}>
                    {comparison.improvement_count}
                  </div>

                  <div style={styles.statLabel}>
                    Improvements
                  </div>
                </div>

                <div style={styles.stat}>
                  <div style={styles.statNumber}>
                    {comparison.unchanged_count}
                  </div>

                  <div style={styles.statLabel}>
                    Unchanged
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={{ marginTop: 0 }}>
                Regressions
              </h3>

              {regressions.length === 0 ? (
                <div style={styles.subtitle}>
                  No regressions detected.
                </div>
              ) : (
                regressions.map((item) => (
                  <div
                    key={`regression-${item.test_case_id}`}
                    style={{
                      border:
                        "1px solid #5a3035",
                      borderRadius: "10px",
                      padding: "14px",
                      marginBottom: "10px",
                    }}
                  >
                    <strong>
                      Test #{item.test_case_id}
                    </strong>

                    <div style={styles.subtitle}>
                      {item.input}
                    </div>

                    <div
                      style={{
                        marginTop: "8px",
                      }}
                    >
                      {item.old_score} →{" "}
                      {item.new_score} (
                      {item.reason})
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={styles.card}>
              <h3 style={{ marginTop: 0 }}>
                Improvements
              </h3>

              {improvements.length === 0 ? (
                <div style={styles.subtitle}>
                  No improvements detected.
                </div>
              ) : (
                improvements.map((item) => (
                  <div
                    key={`improvement-${item.test_case_id}`}
                    style={{
                      border:
                        "1px solid #294d32",
                      borderRadius: "10px",
                      padding: "14px",
                      marginBottom: "10px",
                    }}
                  >
                    <strong>
                      Test #{item.test_case_id}
                    </strong>

                    <div style={styles.subtitle}>
                      {item.input}
                    </div>

                    <div
                      style={{
                        marginTop: "8px",
                        color: "#aff5b8",
                      }}
                    >
                      {item.old_score} →{" "}
                      {item.new_score} (+
                      {item.score_difference})
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={styles.card}>
              <h3 style={{ marginTop: 0 }}>
                Unchanged
              </h3>

              {unchanged.length === 0 ? (
                <div style={styles.subtitle}>
                  No unchanged tests.
                </div>
              ) : (
                unchanged.map((item) => (
                  <div
                    key={`unchanged-${item.test_case_id}`}
                    style={{
                      border:
                        "1px solid #30363d",
                      borderRadius: "10px",
                      padding: "14px",
                      marginBottom: "10px",
                    }}
                  >
                    <strong>
                      Test #{item.test_case_id}
                    </strong>

                    <div style={styles.subtitle}>
                      {item.input}
                    </div>

                    <div
                      style={{
                        marginTop: "8px",
                      }}
                    >
                      {item.old_score} →{" "}
                      {item.new_score}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </>
    );
  }

  return (
    <div style={styles.app}>
      {renderSidebar()}

      <main style={styles.content}>
        {page === "dashboard" &&
          renderDashboard()}

        {page === "playground" &&
          renderPlayground()}

        {page === "optimizer" &&
          renderOptimizer()}

        {page === "testcases" &&
          renderTestCases()}

        {page === "history" &&
          renderHistory()}

        {page === "versions" &&
          renderVersions()}

        {page === "regression" &&
          renderRegression()}

        <footer
          style={{
            color: "#6e7681",
            borderTop: "1px solid #21262d",
            marginTop: "40px",
            paddingTop: "20px",
            fontSize: "13px",
          }}
        >
          PromptForge — AI Prompt Engineering &
          Evaluation Platform
        </footer>
      </main>
    </div>
  );
}

export default App;
