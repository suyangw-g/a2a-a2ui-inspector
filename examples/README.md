# Example A2A Agents (`examples/`)

This directory contains sample **Agent-to-Agent (A2A) protocol agents** that return **A2UI v0.9 surface cards**.

---

## 🍽️ `restaurant_a2ui_agent.py`

A mock A2A agent that demonstrates:
1. Returning rich A2UI recommendation cards (`Card`, `Column`, `Text`, `Image`, `Button`).
2. Handling conversational follow-up queries (e.g. *"filter out non-Chinese restaurants"*).
3. Emitting dynamic surface lifecycle updates (`restaurant-recommendations-surface` and `chinese-restaurants-surface`).

### How to Run

```bash
# 1. Run the sample agent on port 8998
python3 examples/restaurant_a2ui_agent.py
```

### How to Test in A2A Inspector

1. Open **[http://127.0.0.1:5001](http://127.0.0.1:5001)** in your browser.
2. In the **Agent URL** box, enter `http://127.0.0.1:8998` and click **Connect**.
3. Type `"show me some restaurant recommendations"` and press Enter.
4. Type `"filter out non-Chinese restaurants"` to see multi-turn surface filtering!
