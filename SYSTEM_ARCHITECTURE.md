# WANA System Architecture

## How to View These Diagrams
- **GitHub/GitLab**: Push this file and view it directly (automatic Mermaid rendering)
- **VS Code**: Install "Markdown Preview Mermaid Support" extension
- **Online**: Copy diagram code to https://mermaid.live

---

## 1. Complete System Architecture

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'fontSize':'20px'}}}%%
graph LR
    subgraph clients["👥 CLIENTS"]
        U[User]
        S[Supervisor]
        A[Admin]
        AC[Acceptor]
    end

    subgraph frontend["⚛️ FRONTEND"]
        L[Login/Signup]
        D[Dashboard]
        AP[Approval]
    end

    subgraph backend["🔧 BACKEND"]
        API[REST API]
    end

    subgraph data["💾 DATA"]
        M[(MongoDB)]
        F[(Firestore)]
    end

    subgraph ext["☁️ EXTERNAL"]
        FA[Firebase Auth]
        MP[Mappls Maps]
    end

    U --> FA
    U --> F
    AC --> F
    
    S --> L
    A --> L
    
    L --> API
    D --> API
    AP --> API
    
    API --> M
    D --> F
    D --> MP
    
    style clients fill:#e3f2fd,stroke:#1976d2,stroke-width:4px
    style frontend fill:#f3e5f5,stroke:#7b1fa2,stroke-width:4px
    style backend fill:#fff3e0,stroke:#f57c00,stroke-width:4px
    style data fill:#e8f5e9,stroke:#388e3c,stroke-width:4px
    style ext fill:#fce4ec,stroke:#c2185b,stroke-width:4px
```

---

## 2. SOS Event Creation Flow

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'fontSize':'20px'}}}%%
sequenceDiagram
    actor User as 👤 User
    participant App as 📱 Mobile App
    participant Auth as 🔥 Firebase Auth
    participant DB as 🗿 Firestore

    User->>App: Press SOS Button
    App->>Auth: Verify User
    Auth-->>App: User Token
    App->>DB: Create Event Document
    Note right of DB: ongoingEvents collection<br/>- email<br/>- type<br/>- location<br/>- city<br/>- timestamp
    DB-->>App: Event Created
    App->>User: SOS Triggered ✅
    Note over DB: Supervisors notified<br/>via real-time listener
```

---

## 3. Supervisor Registration & Approval

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'fontSize':'20px'}}}%%
sequenceDiagram
    actor Sup as 👨‍💼 Supervisor
    participant Web as 🌐 Web App
    participant API as 🔧 Backend
    participant DB as 🍃 MongoDB
    actor Admin as 👨‍💻 Admin

    Sup->>Web: Register
    Web->>API: POST /auth/register
    API->>DB: Create Supervisor<br/>(isApproved: false)
    DB-->>API: Created
    API-->>Web: Pending Approval
    Web->>Sup: Wait for Approval ⏳

    Admin->>Web: View Pending
    Web->>API: GET /admin/pending
    API->>DB: Fetch Pending
    DB-->>API: List
    API-->>Web: Display

    Admin->>Web: Approve
    Web->>API: POST /admin/approve
    API->>DB: Update isApproved = true
    DB-->>API: Updated
    API-->>Web: Success ✅

    Sup->>Web: Login
    Web->>API: POST /auth/login
    API->>DB: Verify
    DB-->>API: Approved
    API-->>Web: JWT Token
    Web->>Sup: Access Granted 🎉
```

---

## 4. Event Acceptance Flow

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'fontSize':'20px'}}}%%
sequenceDiagram
    actor Acc as 🚑 Acceptor
    participant App as 📱 Mobile App
    participant DB as 🗿 Firestore
    actor Sup as 👨‍💼 Supervisor

    Acc->>App: View Events
    App->>DB: Query ongoingEvents
    DB-->>App: List of Events
    
    Acc->>App: Accept Event
    App->>DB: Create Acceptor Document
    Note right of DB: acceptedEvents/{eventId}/acceptors<br/>- name<br/>- email<br/>- userLocation<br/>- acceptedAt
    DB-->>App: Recorded
    App->>Acc: Responding! 🚑
    
    DB->>Sup: Real-time Update
    Note over Sup: Green pin appears
```

---

## 5. Dashboard Real-time Updates

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'fontSize':'20px'}}}%%
sequenceDiagram
    actor Sup as 👨‍💼 Supervisor
    participant Web as 🌐 Dashboard
    participant API as 🔧 Backend
    participant Mongo as 🍃 MongoDB
    participant Fire as 🗿 Firestore
    participant Map as 🗺️ Mappls

    Sup->>Web: Access Dashboard
    Web->>API: GET /supervisor/profile
    API->>Mongo: Fetch Profile
    Mongo-->>API: Data
    API-->>Web: Profile

    Web->>Fire: onSnapshot(ongoingEvents)
    Fire-->>Web: Stream Events

    loop Each Event
        Web->>Fire: Get Acceptors
        Fire-->>Web: Acceptor List
    end

    Web->>Map: Initialize
    Web->>Map: Add Red Pins (Events)
    Web->>Map: Add Green Pins (Acceptors)
    Web->>Map: Draw Lines
    Map-->>Sup: Interactive Map
```

---

## 6. Locate Button Flow

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'fontSize':'20px'}}}%%
sequenceDiagram
    actor Sup as 👨‍💼 Supervisor
    participant Table as 📊 Table
    participant Page as 🌐 Page
    participant Map as 🗺️ Map

    Sup->>Table: Click Locate
    Table->>Page: locate(lat, lng, id)
    Page->>Page: Scroll to Top
    Page->>Map: focusLocation()
    Map->>Map: setCenter()
    Map->>Map: setZoom(16)
    Map->>Map: highlightMarker()
    Note over Map: Golden glow<br/>Scale 1.3x<br/>Pulse 3x
    Map-->>Sup: Highlighted Pin ✨
```

---

## 7. Technology Stack

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'fontSize':'20px'}}}%%
graph LR
    subgraph fe["Frontend"]
        react[React 19]
        vite[Vite]
        router[React Router 7]
        bootstrap[Bootstrap]
    end

    subgraph be["Backend"]
        node[Node.js]
        express[Express]
        jwt[JWT]
        bcrypt[Bcrypt]
    end

    subgraph db["Database"]
        mongo[MongoDB]
        firestore[Firestore]
    end

    subgraph ext["External"]
        fireauth[Firebase Auth]
        mappls[Mappls API]
    end

    react --> vite
    react --> router
    react --> bootstrap
    node --> express
    express --> jwt
    express --> bcrypt
    mongo -.-> be
    firestore -.-> fe
    fireauth -.-> fe
    mappls -.-> fe
```

---

## 8. Security Architecture

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'fontSize':'20px'}}}%%
graph TB
    subgraph auth["🔐 Authentication"]
        jwt[JWT Token]
        firebase[Firebase Token]
    end

    subgraph authz["🎭 Authorization"]
        check{Role Check}
        admin[Admin]
        sup[Supervisor]
        user[User]
    end

    subgraph security["🔒 Security"]
        rules[Firestore Rules]
        hash[Password Hash]
        env[Environment Vars]
    end

    jwt --> check
    firebase --> check
    check -->|Admin| admin
    check -->|Supervisor| sup
    check -->|User| user
    admin --> rules
    sup --> rules
    user --> rules
    hash --> env
```

---

## 9. Deployment Architecture

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'fontSize':'20px'}}}%%
graph TB
    subgraph client["Client"]
        browser[🌐 Browser]
        mobile[📱 Mobile]
    end

    subgraph hosting["Hosting"]
        frontend[Frontend<br/>Vercel/Netlify]
        backend[Backend<br/>Heroku/Railway]
    end

    subgraph services["Services"]
        mongodb[MongoDB Atlas]
        firebase[Firebase Cloud]
        mappls[Mappls Cloud]
    end

    browser --> frontend
    mobile --> frontend
    frontend --> backend
    backend --> mongodb
    backend --> firebase
    frontend --> firebase
    frontend --> mappls
```

---

## Key Features

### Real-time Capabilities
✅ Live event updates using Firestore onSnapshot  
✅ Automatic acceptor tracking  
✅ Real-time map pin updates  
✅ Distance calculation between events and acceptors  

### Security Features
✅ JWT-based authentication  
✅ Role-based access control (Admin, Supervisor)  
✅ Firebase authentication for users  
✅ Firestore security rules  
✅ Password hashing with bcrypt  

### Map Features
✅ Interactive Mappls map integration  
✅ Red pins for SOS events  
✅ Green pins for acceptors  
✅ Distance lines between events and acceptors  
✅ Pin highlighting with glow effect  
✅ Auto-scroll to map on locate  

### Responsive Design
✅ Mobile-first approach  
✅ Tablet optimization  
✅ Desktop layouts  
✅ Touch-friendly buttons (44px min height)  
✅ Horizontal scrolling tables on mobile  

---

**Generated:** February 2026  
**Project:** WANA - Women Safety Emergency Response System -->

