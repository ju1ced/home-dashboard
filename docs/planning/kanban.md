# Home Dashboard — kanban bord

Het bord leeft sinds 3 november 2026 in [GitHub Issues](https://github.com/ju1ced/home-dashboard/issues), gegroepeerd per epic in [milestones](https://github.com/ju1ced/home-dashboard/milestones). Ticketnummers (HD-xxx) en hun issue staan in [tickets.md](tickets.md).

| Kolom | Weergave |
|---|---|
| Backlog | [`status:backlog`](https://github.com/ju1ced/home-dashboard/issues?q=is%3Aissue+is%3Aopen+label%3Astatus%3Abacklog) |
| In uitvoering | [`status:in-progress`](https://github.com/ju1ced/home-dashboard/issues?q=is%3Aissue+is%3Aopen+label%3Astatus%3Ain-progress) |
| Review/validatie | [`status:review`](https://github.com/ju1ced/home-dashboard/issues?q=is%3Aissue+is%3Aopen+label%3Astatus%3Areview) |
| Geblokkeerd | [`status:blocked`](https://github.com/ju1ced/home-dashboard/issues?q=is%3Aissue+is%3Aopen+label%3Astatus%3Ablocked) |
| Klaar | [gesloten issues](https://github.com/ju1ced/home-dashboard/issues?q=is%3Aissue+is%3Aclosed+reason%3Acompleted) |

## Werkafspraken

- WIP-limiet: maximaal één ticket **In uitvoering** en maximaal twee in **Review/validatie**.
- Scope en gates volgen het [implementatieplan](../design/implementation-plan.md), de [deliveryroadmap](../design/delivery-roadmap.md) en het [beslislog](../design/decision-log.md).
- Geen push, PR, prerelease, Home Assistant-write of productiecutover zonder de daar vastgelegde expliciete goedkeuring.
- De oorspronkelijke fasevolgorde (fase 0–7, kolom *Volgorde*) staat per ticket in de eerste reactie op het issue.
