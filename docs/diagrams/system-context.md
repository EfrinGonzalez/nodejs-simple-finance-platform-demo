# System Context Diagram
Shows primary actors and external integration placeholders.

```mermaid
flowchart LR
  User[Small Business User] --> API[Shine Demo API]
  API --> INV[Invoicing Context]
  API --> WAL[Wallet/Ledger Context]
  INV --> BUS[Async Event Bus]
  WAL --> BUS
  BUS --> RM[Read Model Store]
  BUS --> EXT[Future External Services\n(Banking/Accounting/Notifications)]
```

Notes: strong consistency is inside command handlers; projection store is eventual.
