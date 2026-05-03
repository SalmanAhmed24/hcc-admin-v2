# Graph Report - src/components/clients  (2026-05-03)

## Corpus Check
- Corpus is ~15,920 words - fits in a single context window. You may not need a graph.

## Summary
- 73 nodes · 101 edges · 5 communities detected
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Research Tab UI Components|Research Tab UI Components]]
- [[_COMMUNITY_Analysis & Opportunity Tabs|Analysis & Opportunity Tabs]]
- [[_COMMUNITY_DrawerShell AI Panel|DrawerShell AI Panel]]
- [[_COMMUNITY_Client Row Card|Client Row Card]]
- [[_COMMUNITY_Pagination Controls|Pagination Controls]]

## God Nodes (most connected - your core abstractions)
1. `ghostBtnStyle()` - 13 edges
2. `SectionLabel()` - 10 edges
3. `Field()` - 8 edges
4. `Input()` - 5 edges
5. `AiBanner()` - 5 edges
6. `ClientRowCard()` - 4 edges
7. `DrawerShell()` - 4 edges
8. `primaryBtnStyle()` - 3 edges
9. `Toggle()` - 3 edges
10. `MetricCard()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `TabCompanyInfo()` --calls--> `ghostBtnStyle()`  [INFERRED]
  research\tabs\TabCompanyInfo.jsx → DrawerShell.jsx
- `TabCompetitors()` --calls--> `ghostBtnStyle()`  [INFERRED]
  research\tabs\TabCompetitors.jsx → DrawerShell.jsx
- `TabKeywords()` --calls--> `ghostBtnStyle()`  [INFERRED]
  research\tabs\TabKeywords.jsx → DrawerShell.jsx
- `TabOpportunity()` --calls--> `ghostBtnStyle()`  [INFERRED]
  research\tabs\TabOpportunity.jsx → DrawerShell.jsx
- `TabSeoMetrics()` --calls--> `ghostBtnStyle()`  [INFERRED]
  research\tabs\TabSeoMetrics.jsx → DrawerShell.jsx

## Communities

### Community 0 - "Research Tab UI Components"
Cohesion: 0.22
Nodes (6): Field(), Input(), MetricCard(), SectionLabel(), Toggle(), TabCompanyInfo()

### Community 2 - "Analysis & Opportunity Tabs"
Cohesion: 0.27
Nodes (5): ghostBtnStyle(), TabCompetitors(), TabKeywords(), TabOpportunity(), TabSeoMetrics()

### Community 3 - "DrawerShell AI Panel"
Cohesion: 0.43
Nodes (5): AiBanner(), aiBtnStyle(), DrawerShell(), formatRelative(), primaryBtnStyle()

### Community 4 - "Client Row Card"
Cohesion: 0.7
Nodes (4): ClientRowCard(), getInitials(), getStatusStyle(), hashString()

### Community 7 - "Pagination Controls"
Cohesion: 0.67
Nodes (2): buildPageNumbers(), ClientsPagination()

## Knowledge Gaps
- **Thin community `Pagination Controls`** (4 nodes): `buildPageNumbers()`, `ClientsPagination()`, `PageBtn()`, `ClientsPagination.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SectionLabel()` connect `Research Tab UI Components` to `Research Submit Tab`, `Analysis & Opportunity Tabs`, `DrawerShell AI Panel`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `ghostBtnStyle()` connect `Analysis & Opportunity Tabs` to `Research Tab UI Components`, `DrawerShell AI Panel`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `Field()` connect `Research Tab UI Components` to `Analysis & Opportunity Tabs`, `DrawerShell AI Panel`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `ghostBtnStyle()` (e.g. with `TabCompanyInfo()` and `TabCompetitors()`) actually correct?**
  _`ghostBtnStyle()` has 5 INFERRED edges - model-reasoned connections that need verification._