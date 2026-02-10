# Property Bot Design Document

## Overview
A chat interfaces for real estate agents to forward property messages. The system parses these messages to extract property details and saves them to a database. Agents can then query/filter properties by location.

## User Flow
1.  **Agent Logic**:
    -   Agent opens the chat UI.
    -   Agent pastes/forwards a property listing message (e.g., from WhatsApp).
    -   System saves the message.
    -   System attempts to extract property details (Location, Price, Type, etc.).
    -   If valid, saves to `properties` table.
2.  **Search Logic**:
    -   Agent asks "Show me properties in Bandra".
    -   System filters `properties` table by location "Bandra".
    -   Displays list of matching properties.

## Database Schema (Supabase)

### `messages`
Stores the raw chat history.
-   `id`: uuid (PK)
-   `content`: text
-   `sender_role`: text ('user' | 'assistant')
-   `created_at`: timestamp

### `properties`
Stores structured property data extracted from messages.
-   `id`: uuid (PK)
-   `message_id`: uuid (FK -> messages.id)
-   `raw_text`: text (original message content)
-   `location`: text
-   `price`: textOrNumber
-   `type`: text (e.g., 'Sell', 'Rent')
-   `bhk`: text (e.g., '2BHK')
-   `description`: text
-   `contact_info`: text
-   `created_at`: timestamp

## Technical Architecture

### Frontend (Next.js)
-   **Chat Interface**:
    -   Component: `ChatWindow`
    -   Input: `MessageInput`
    -   Display: `MessageList` (renders text and property cards)
-   **Property List**:
    -   Component: `PropertyFeed` (optional, or integrated into chat)

### Backend / Logic
-   **Extraction Logic**:
    -   Initially rule-based (regex) or simple LLM call (if API key available) to parse unstructured text.
    -   For now, we can use a simple keyword extraction or ask the user if they want to integrate an LLM (OpenAI/Gemini) for parsing.
    -   **Server Action / API Route**: `POST /api/chat`
        1.  Save message to `messages`.
        2.  Run extraction.
        3.  If property found -> Insert into `properties`.
        4.  Return response (echo or confirmation).

## UI Design
-   **Theme**: Clean, mobile-friendly (since agents might use phone).
-   **Colors**: Professional Blue/Green accents.
-   **Layout**:
    -   Header: "Property Bot"
    -   Main: Chat history scrollable.
    -   Bottom: Input bar.