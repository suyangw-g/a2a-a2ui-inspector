"""Sample A2A Agent returning A2UI v0.9 recommendation cards with conversational filtering."""

import json
import uvicorn
from fastapi import FastAPI, Request

app = FastAPI()

CARD = {
    "name": "Restaurant Recommendation A2UI Agent",
    "description": "An A2A Agent that returns A2UI UI card components for restaurant recommendations with conversational filtering.",
    "version": "1.0.0",
    "url": "http://127.0.0.1:8998",
    "preferredTransport": "JSONRPC",
    "protocolVersion": "0.3.0",
    "capabilities": {},
    "defaultInputModes": ["text/plain"],
    "defaultOutputModes": ["text/plain", "application/json"],
    "skills": [
        {
            "id": "restaurant_recommendations",
            "name": "Restaurant Recommendations",
            "description": "Returns a list of recommended restaurants with rich A2UI cards and supports follow-up filtering",
            "tags": ["restaurant", "food", "a2ui", "recommendations", "filter"],
        }
    ],
}

# Initial multi-cuisine recommendations
INITIAL_A2UI_PAYLOAD = {
    "version": "v0.9",
    "surface": "restaurant-recommendations-surface",
    "createSurface": {
        "surfaceId": "restaurant-recommendations-surface",
        "catalogId": "https://a2ui.org/catalogs/basic.json",
    },
    "updateComponents": {
        "surfaceId": "restaurant-recommendations-surface",
        "components": [
            {
                "id": "root",
                "component": "Column",
                "children": ["header-text", "card-1", "card-2", "card-3", "card-4"],
            },
            {
                "id": "header-text",
                "component": "Text",
                "text": "🍽️ Top Recommended Restaurants Near You",
                "usageHint": "h2",
            },
            # Card 1: French
            {
                "id": "card-1",
                "component": "Card",
                "child": "card-1-col",
            },
            {
                "id": "card-1-col",
                "component": "Column",
                "children": ["c1-img", "c1-title", "c1-sub", "c1-desc", "c1-btn"],
            },
            {
                "id": "c1-img",
                "component": "Image",
                "url": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
                "fit": "scaleDown",
            },
            {
                "id": "c1-title",
                "component": "Text",
                "text": "La Belle Cuisine",
                "usageHint": "h3",
            },
            {
                "id": "c1-sub",
                "component": "Text",
                "text": "French Fine Dining • ⭐ 4.8 • $$$",
                "usageHint": "caption",
            },
            {
                "id": "c1-desc",
                "component": "Text",
                "text": "Cozy atmosphere with authentic French dishes and chef's tasting menu.",
            },
            {
                "id": "c1-btn",
                "component": "Button",
                "child": "c1-btn-label",
                "primary": True,
                "action": {
                    "event": {
                        "name": "reserve_table",
                        "context": [{"key": "restaurant", "value": "La Belle Cuisine"}],
                    }
                },
            },
            {
                "id": "c1-btn-label",
                "component": "Text",
                "text": "Reserve Table",
            },
            # Card 2: Chinese
            {
                "id": "card-2",
                "component": "Card",
                "child": "card-2-col",
            },
            {
                "id": "card-2-col",
                "component": "Column",
                "children": ["c2-img", "c2-title", "c2-sub", "c2-desc", "c2-btn"],
            },
            {
                "id": "c2-img",
                "component": "Image",
                "url": "https://images.unsplash.com/photo-1563245372-f21724e3856d",
                "fit": "scaleDown",
            },
            {
                "id": "c2-title",
                "component": "Text",
                "text": "Dragon Palace Gourmet",
                "usageHint": "h3",
            },
            {
                "id": "c2-sub",
                "component": "Text",
                "text": "Chinese / Szechuan & Dim Sum • ⭐ 4.9 • $$",
                "usageHint": "caption",
            },
            {
                "id": "c2-desc",
                "component": "Text",
                "text": "Authentic spicy Szechuan specialties, Peking duck, and handmade morning dim sum.",
            },
            {
                "id": "c2-btn",
                "component": "Button",
                "child": "c2-btn-label",
                "primary": True,
                "action": {
                    "event": {
                        "name": "reserve_table",
                        "context": [{"key": "restaurant", "value": "Dragon Palace"}],
                    }
                },
            },
            {
                "id": "c2-btn-label",
                "component": "Text",
                "text": "Reserve Table",
            },
            # Card 3: Japanese
            {
                "id": "card-3",
                "component": "Card",
                "child": "card-3-col",
            },
            {
                "id": "card-3-col",
                "component": "Column",
                "children": ["c3-img", "c3-title", "c3-sub", "c3-desc", "c3-btn"],
            },
            {
                "id": "c3-img",
                "component": "Image",
                "url": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c",
                "fit": "scaleDown",
            },
            {
                "id": "c3-title",
                "component": "Text",
                "text": "Sakura Sushi & Omakase",
                "usageHint": "h3",
            },
            {
                "id": "c3-sub",
                "component": "Text",
                "text": "Japanese / Sushi • ⭐ 4.9 • $$$$",
                "usageHint": "caption",
            },
            {
                "id": "c3-desc",
                "component": "Text",
                "text": "Fresh, premium fish imported daily from Tokyo.",
            },
            {
                "id": "c3-btn",
                "component": "Button",
                "child": "c3-btn-label",
                "primary": True,
                "action": {
                    "event": {
                        "name": "reserve_table",
                        "context": [{"key": "restaurant", "value": "Sakura Sushi"}],
                    }
                },
            },
            {
                "id": "c3-btn-label",
                "component": "Text",
                "text": "Reserve Table",
            },
            # Card 4: Italian
            {
                "id": "card-4",
                "component": "Card",
                "child": "card-4-col",
            },
            {
                "id": "card-4-col",
                "component": "Column",
                "children": ["c4-img", "c4-title", "c4-sub", "c4-desc", "c4-btn"],
            },
            {
                "id": "c4-img",
                "component": "Image",
                "url": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
                "fit": "scaleDown",
            },
            {
                "id": "c4-title",
                "component": "Text",
                "text": "Trattoria Della Nonna",
                "usageHint": "h3",
            },
            {
                "id": "c4-sub",
                "component": "Text",
                "text": "Italian / Pasta • ⭐ 4.7 • $$",
                "usageHint": "caption",
            },
            {
                "id": "c4-desc",
                "component": "Text",
                "text": "Handmade fresh pasta daily and wood-fired pizzas.",
            },
            {
                "id": "c4-btn",
                "component": "Button",
                "child": "c4-btn-label",
                "primary": True,
                "action": {
                    "event": {
                        "name": "reserve_table",
                        "context": [
                            {"key": "restaurant", "value": "Trattoria Della Nonna"}
                        ],
                    }
                },
            },
            {
                "id": "c4-btn-label",
                "component": "Text",
                "text": "Reserve Table",
            },
        ]
    },
    "updateDataModel": {
        "surfaceId": "restaurant-recommendations-surface",
        "data": {"query": "restaurant recommendations", "totalResults": 4},
    },
}

# Filtered Chinese Restaurants surface payload
CHINESE_ONLY_A2UI_PAYLOAD = {
    "version": "v0.9",
    "surface": "chinese-restaurants-surface",
    "createSurface": {
        "surfaceId": "chinese-restaurants-surface",
        "catalogId": "https://a2ui.org/catalogs/basic.json",
    },
    "updateComponents": {
        "surfaceId": "chinese-restaurants-surface",
        "components": [
            {
                "id": "root",
                "component": "Column",
                "children": ["header-text", "chinese-card-1", "chinese-card-2"],
            },
            {
                "id": "header-text",
                "component": "Text",
                "text": "🥢 Chinese Restaurants Only (Filtered)",
                "usageHint": "h2",
            },

            # Chinese Card 1
            {
                "id": "chinese-card-1",
                "component": "Card",
                "child": "cc1-col",
            },
            {
                "id": "cc1-col",
                "component": "Column",
                "children": ["cc1-img", "cc1-title", "cc1-sub", "cc1-desc", "cc1-btn"],
            },
            {
                "id": "cc1-img",
                "component": "Image",
                "url": "https://images.unsplash.com/photo-1563245372-f21724e3856d",
                "fit": "scaleDown",
            },
            {
                "id": "cc1-title",
                "component": "Text",
                "text": "Dragon Palace Gourmet",
                "usageHint": "h3",
            },
            {
                "id": "cc1-sub",
                "component": "Text",
                "text": "Chinese / Szechuan & Dim Sum • ⭐ 4.9 • $$",
                "usageHint": "caption",
            },
            {
                "id": "cc1-desc",
                "component": "Text",
                "text": "Authentic spicy Szechuan specialties, Peking duck, and handmade morning dim sum.",
            },
            {
                "id": "cc1-btn",
                "component": "Button",
                "child": "cc1-btn-label",
                "primary": True,
                "action": {
                    "event": {
                        "name": "reserve_table",
                        "context": [{"key": "restaurant", "value": "Dragon Palace"}],
                    }
                },
            },
            {
                "id": "cc1-btn-label",
                "component": "Text",
                "text": "Reserve Table",
            },

            # Chinese Card 2
            {
                "id": "chinese-card-2",
                "component": "Card",
                "child": "cc2-col",
            },
            {
                "id": "cc2-col",
                "component": "Column",
                "children": ["cc2-img", "cc2-title", "cc2-sub", "cc2-desc", "cc2-btn"],
            },
            {
                "id": "cc2-img",
                "component": "Image",
                "url": "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf",
                "fit": "scaleDown",
            },
            {
                "id": "cc2-title",
                "component": "Text",
                "text": "Golden Lantern Noodle House",
                "usageHint": "h3",
            },
            {
                "id": "cc2-sub",
                "component": "Text",
                "text": "Chinese / Cantonese & Dumplings • ⭐ 4.8 • $",
                "usageHint": "caption",
            },
            {
                "id": "cc2-desc",
                "component": "Text",
                "text": "Famous hand-pulled noodles, Xiao Long Bao soup dumplings, and wonton soup.",
            },
            {
                "id": "cc2-btn",
                "component": "Button",
                "child": "cc2-btn-label",
                "primary": True,
                "action": {
                    "event": {
                        "name": "reserve_table",
                        "context": [{"key": "restaurant", "value": "Golden Lantern"}],
                    }
                },
            },
            {
                "id": "cc2-btn-label",
                "component": "Text",
                "text": "Reserve Table",
            },
        ],
    },
    "updateDataModel": {
        "surfaceId": "chinese-restaurants-surface",
        "data": {
            "query": "filter out non-Chinese restaurants",
            "filterApplied": "Chinese",
            "totalResults": 2,
        },
    },
}


@app.get("/.well-known/agent-card.json")
async def agent_card():
  return CARD


@app.post("/")
async def jsonrpc_endpoint(request: Request):
  data = await request.json()
  req_id = data.get("id", "1")
  params = data.get("params", {})
  message = params.get("message", {})
  parts = message.get("parts", [])

  user_text = ""
  for part in parts:
    if "text" in part:
      user_text += part["text"].lower()

  if "chinese" in user_text or "filter" in user_text:
    payload = CHINESE_ONLY_A2UI_PAYLOAD
    intro = "I've filtered out non-Chinese restaurants for you! Here is the updated A2UI surface with top Chinese restaurant options:"
  else:
    payload = INITIAL_A2UI_PAYLOAD
    intro = "Here are your top restaurant recommendations formatted as A2UI JSON cards:"

  response_text = f"{intro}\n\n```json\n{json.dumps(payload, indent=2)}\n```"

  return {
      "jsonrpc": "2.0",
      "id": req_id,
      "result": {
          "kind": "message",
          "role": "agent",
          "parts": [{"kind": "text", "text": response_text}],
          "messageId": f"resp-{req_id}",
      },
  }


if __name__ == "__main__":
  uvicorn.run(app, host="127.0.0.1", port=8998)
