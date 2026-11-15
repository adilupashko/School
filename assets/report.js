// Sends a practice result by email through Web3Forms (https://web3forms.com).
// The access key is public by design: it only lets this site send mail TO the owner's address.
window.SchoolReport = (function () {
  const ACCESS_KEY = "PASTE_WEB3FORMS_KEY_HERE";
  const KIDS = { noga: "נגה", shahar: "שחר", alon: "אלון", yuval: "יובל" };

  function student() {
    const parts = location.pathname.split("/").filter(Boolean);
    for (const p of parts) if (KIDS[p.toLowerCase()]) return KIDS[p.toLowerCase()];
    return "לא ידוע";
  }

  async function send({ practice, score, max, status, lines, extra }) {
    if (!ACCESS_KEY || ACCESS_KEY.startsWith("PASTE_")) { console.warn("SchoolReport: no access key"); return { ok: false, skipped: true }; }
    const who = student();
    const body = [
      `תלמיד/ה: ${who}`,
      `תרגול: ${practice}`,
      `ציון: ${score} / ${max}`,
      `סטטוס: ${status}`,
      extra || "",
      "",
      "פירוט לפי שאלה:",
      ...lines,
      "",
      `נשלח: ${new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" })}`,
      `קישור: ${location.href}`
    ].join("\n");
    try {
      const r = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          subject: `${who} – ${practice}: ${score}/${max}`,
          from_name: "תרגולים – School",
          message: body
        })
      });
      const j = await r.json().catch(() => ({}));
      return { ok: r.ok && j.success !== false };
    } catch (e) { return { ok: false }; }
  }
  return { send, student };
})();
