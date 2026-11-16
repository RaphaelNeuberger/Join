# n8n Workflows - Join Issue Collector

Dieser Ordner enthaelt die drei n8n-Workflows der KI-Automatisierung als JSON-Export.

## Workflows

### `01_issue_collector.json` - Issue Collector

Verarbeitet eingehende Stakeholder-E-Mails zu Kanban-Tickets.

**Ablauf:**

1. **Microsoft Outlook Trigger** - pollt das Postfach jede Minute auf neue Mails
2. **Code (Extract)** - extrahiert Absender, Betreff, Body; wandelt HTML zu Plain-Text (UTF-8-sauber)
3. **Get Rate Limit** - liest den heutigen Tageszaehler aus Firebase `/rateLimits/YYYY-MM-DD`
4. **IF (Limit reached?)** - prueft `count >= 10`
   - **TRUE** (Limit erreicht): Mail in Ordner "Zu bearbeiten" verschieben + Limit-Info-Mail an Absender
   - **FALSE**: weiter zur KI-Verarbeitung
5. **OpenAI (Classify)** - GPT-4.1-mini extrahiert strukturiert: title, category, priority, dueDate, description (als JSON)
6. **Code (Build Task Payload)** - baut das Firebase-Task-Objekt (status=triage, creator.type=external, aiGenerated=true)
7. **Create Task in Firebase** - POST an `/tasks.json`
8. **Increment Counter** - PATCH `/rateLimits/YYYY-MM-DD` mit count+1
9. **Move Mail to Erledigt** - verschiebt die Quell-Mail in den "Erledigt"-Ordner (via Microsoft Graph API)
10. **Send Confirmation Mail** - Bestaetigungsmail an den Absender

**Error-Pfad:** Jeder kritische Knoten (OpenAI, Build, Create, Increment, Move, Confirmation) hat "Continue (using error output)" aktiv. Alle Error-Outputs muenden in "Error: Move to Zu bearbeiten" -> "Error: Send Sorry Mail" (Mail in "Zu bearbeiten" + "Wir melden uns"-Hinweis).

### `02_status_notification.json` - Status Notification

Benachrichtigt externe Ersteller, wenn sich der Ticket-Status aendert.

**Ablauf:**

1. **Status Change Webhook** - empfaengt POST vom Join-Frontend mit `{ taskId, oldStatus, newStatus }`
2. **Get Task from Firebase** - holt die Task-Details per taskId
3. **IF (Should Send Mail?)** - prueft `aiGenerated === true` UND `creator.type === "external"` UND `creator.email` vorhanden
4. **Send Status Update Mail** - Mail an den Ersteller mit altem -> neuem Status

### `03_web_request.json` - Web Request (Formular)

Backend fuer `request.html` (Figma-Frame "Request", v. a. mobil). Webhook `POST /webhook/join-request` mit `{ name, email, subject, message, website }`.

**Ablauf:**

1. **Request Form Webhook** - nimmt die Formulardaten entgegen (Antwort erst am Ende via "Respond to Webhook")
2. **Validate Request** (Code) - Laengenbegrenzung, E-Mail-Pruefung, Honeypot `website`, HTML-Escaping, KI-Input wie beim Mail-Collector
3. **Is Valid?** - ungueltig -> `400 { status: "invalid" }`
4. **Get Rate Limit / Limit reached?** - gleicher Tageszaehler `/rateLimits/YYYY-MM-DD` wie Workflow 01
   - **Limit erreicht:** Kopie der Anfrage in Outlook-Ordner "Zu bearbeiten" + Limit-Hinweis an den Absender -> `202 { status: "limit" }`
5. **OpenAI** - gleiche Klassifizierung (title, category, priority, dueDate, description)
6. **Build Task Payload** - Ticket in "Triage", `creator.type = external`, `aiGenerated = true`, `source = "web-form"`
7. **Create Task in Firebase -> Increment Counter -> Send Confirmation Mail** -> `201 { status: "created" }`

**Fehlerpfad:** OpenAI, Build und Create haben einen Error-Output -> Kopie in "Zu bearbeiten" + "Wir melden uns"-Mail -> `202 { status: "manual" }`.

## Import in eine n8n-Instanz

1. n8n oeffnen -> Workflows -> "Import from File"
2. JSON auswaehlen
3. **Credentials neu verbinden** (werden NICHT mit-importiert):
   - **OpenAI** (API-Key)
   - **Microsoft Outlook OAuth2 API** (Azure-App-Registration)
4. Im Issue Collector: die hardcoded **Firebase-DB-URL** und **Outlook-Folder-IDs** ggf. auf die eigene Umgebung anpassen
5. Alle Workflows auf **Active** schalten

## Wichtige Hinweise

- **Keine Secrets im Export:** API-Keys und OAuth-Tokens sind NICHT enthalten - nur Credential-Referenzen (ID + Name).
- **Execution Mode:** Die Instanz laeuft im Direct-Mode (kein Queue-Mode), siehe Projekt-Setup.
- **Folder-IDs:** Die "Erledigt"- und "Zu bearbeiten"-Ordner werden ueber ihre Microsoft-Graph-Folder-IDs im JSON-Body der Move-Requests referenziert. Bei einem anderen Postfach neu via `GET /me/mailFolders` ermitteln.
