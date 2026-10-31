function showPage(page) {
    document.querySelectorAll(".page").forEach(p => {
        p.classList.add("hidden");
    });

    document.getElementById(page).classList.remove("hidden");
}

async function askJunior(message, code = "", mode = "chat") {
    const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message,
            code,
            mode
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
    }

    return data.answer;
}

function addMessage(text, type) {
    const messages = document.getElementById("messages");
    const div = document.createElement("div");

    div.className = "message " + type;
    div.textContent = text;

    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;

    return div;
}

document.getElementById("chatForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const input = document.getElementById("question");
    const question = input.value.trim();

    if (!question) return;

    input.value = "";

    addMessage(question, "user");

    const reply = addMessage("Junior AI is thinking...", "ai");

    try {
        reply.textContent = await askJunior(question);
    } catch (error) {
        reply.textContent = error.message;
    }
});

async function fixCode() {
    const code = document.getElementById("code").value;
    const problem = document.getElementById("problem").value;
    const result = document.getElementById("fixedCode");

    if (!code.trim()) {
        result.textContent = "Paste your code first!";
        return;
    }

    result.textContent = "Junior AI is fixing your code...";

    try {
        result.textContent = await askJunior(
            problem || "Find and fix the problems in this code.",
            code,
            "fix"
        );
    } catch (error) {
        result.textContent = error.message;
    }
}