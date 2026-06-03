const eq1 = document.getElementById("eq1");
const eq2 = document.getElementById("eq2");
const eq3 = document.getElementById("eq3");
const x0Input = document.getElementById("x0");
const y0Input = document.getElementById("y0");
const z0Input = document.getElementById("z0");
const iterInput = document.getElementById("iter");
const omegaInput = document.getElementById("omega");
const tolInput = document.getElementById("tol");
const table = document.getElementById("table");
const fx = document.getElementById("fx");
const fy = document.getElementById("fy");
const fz = document.getElementById("fz");
const conv = document.getElementById("conv");
const residualEl = document.getElementById("residual");
const status = document.getElementById("status");
let animationTimer = null;

function parseEquation(eq) {
    eq = eq.replace(/\s+/g, "");
    if (!eq.includes("=")) return null;

    let [left, right] = eq.split("=");
    if (!left || right === undefined) return null;

    function coef(v) {
        let regex = new RegExp("([+-]?(?:\\d+\\.?\\d*|\\.?\\d+)?)(?=" + v + "(?![a-zA-Z]))");
        let m = left.match(regex);
        if (!m) return 0;
        if (m[1] === "" || m[1] === "+") return 1;
        if (m[1] === "-") return -1;
        return parseFloat(m[1]);
    }

    return {
        a: [coef("x"), coef("y"), coef("z")],
        b: parseFloat(right)
    };
}

function appendRow(index, data) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${data.x.toFixed(6)}</td>
        <td>${data.y.toFixed(6)}</td>
        <td>${data.z.toFixed(6)}</td>
        <td>${data.residual.toExponential(2)}</td>
    `;
    table.appendChild(tr);
}

function renderHistory(history) {
    table.innerHTML = "";

    if (!history.length) {
        table.innerHTML = `<tr><td colspan="5">No iterations recorded.</td></tr>`;
        return;
    }

    history.forEach((row, index) => appendRow(index, row));
}

function clearAnimation() {
    if (animationTimer) {
        clearInterval(animationTimer);
        animationTimer = null;
    }
}

function highlightCurrentRow(index) {
    const rows = [...table.querySelectorAll("tr")];
    rows.forEach((row, i) => row.classList.toggle("active", i === index));
}

function startAnimation(history) {
    if (!history.length) return;

    table.innerHTML = "";
    let index = 0;
    status.textContent = "Animating iterations...";
    clearAnimation();

    animationTimer = setInterval(() => {
        appendRow(index, history[index]);
        highlightCurrentRow(index);
        index += 1;

        if (index >= history.length) {
            clearAnimation();
            status.textContent = "Animation complete.";
        }
    }, 220);
}

function showFinal(x, y, z, iterations, residual, converged) {
    fx.textContent = x.toFixed(6);
    fy.textContent = y.toFixed(6);
    fz.textContent = z.toFixed(6);
    conv.textContent = `${converged ? "Converged" : "Stopped"} after ${iterations} iteration${iterations === 1 ? "" : "s"}`;
    residualEl.textContent = `Residual: ${residual.toExponential(2)}`;
}

function solve(animated = false) {
    clearAnimation();
    status.textContent = "Solving system...";

    const eqs = [eq1.value, eq2.value, eq3.value];
    const x0 = parseFloat(x0Input.value) || 0;
    const y0 = parseFloat(y0Input.value) || 0;
    const z0 = parseFloat(z0Input.value) || 0;
    const nMax = Math.max(1, parseInt(iterInput.value, 10) || 1);
    const omega = parseFloat(omegaInput.value) || 1;
    const tolerance = Math.max(0, parseFloat(tolInput.value) || 0);

    const parsed = eqs.map(parseEquation);
    if (parsed.some(item => !item || item.a.some(coef => Number.isNaN(coef)) || Number.isNaN(item.b))) {
        status.textContent = "Error: Please enter three valid equations using x, y, and z.";
        return [];
    }

    const A = parsed.map(item => item.a);
    const b = parsed.map(item => item.b);

    if (A[0][0] === 0 || A[1][1] === 0 || A[2][2] === 0) {
        status.textContent = "Error: Diagonal coefficients cannot be zero for the relaxation method.";
        return [];
    }

    let x = x0;
    let y = y0;
    let z = z0;
    const history = [];
    let converged = false;
    let latestResidual = 0;

    for (let i = 0; i < nMax; i++) {
        const r1 = b[0] - (A[0][0] * x + A[0][1] * y + A[0][2] * z);
        const r2 = b[1] - (A[1][0] * x + A[1][1] * y + A[1][2] * z);
        const r3 = b[2] - (A[2][0] * x + A[2][1] * y + A[2][2] * z);

        x += omega * (r1 / A[0][0]);
        y += omega * (r2 / A[1][1]);
        z += omega * (r3 / A[2][2]);

        latestResidual = Math.max(Math.abs(r1), Math.abs(r2), Math.abs(r3));
        history.push({ x, y, z, residual: latestResidual });

        if (tolerance > 0 && latestResidual <= tolerance) {
            converged = true;
            break;
        }
    }

    if (animated) {
        startAnimation(history);
    } else {
        renderHistory(history);
        status.textContent = "Computation complete.";
    }

    showFinal(x, y, z, history.length, latestResidual, converged);
    return history;
}

function animateSolve() {
    solve(true);
}

function clearAll() {
    clearAnimation();
    table.innerHTML = "";
    fx.textContent = fy.textContent = fz.textContent = "–";
    conv.textContent = "–";
    residualEl.textContent = "Residual: –";
    status.textContent = "Ready to compute.";
}
