# Bounded Context Diagram

```mermaid
flowchart LR
  SK[Shared Kernel\nMoney/Currency/DomainEvent]
  INV[Invoicing BC\nInvoice Aggregate (Event Sourced)\nCustomer]
  WAL[Wallet BC\nWallet Aggregate\nLedger-like Transactions]
  INV -->|PaymentRegistered event| WAL
  INV --- SK
  WAL --- SK
```

Ownership is explicit: invoice owns billing workflow, wallet owns funds state.
