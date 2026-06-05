# API Reference (draft)

Base URL: `http://localhost:4000/api`

All responses use the `ApiResponse<T>` envelope from `@propertypulse/shared-types`.

## Auth
| Method | Path | Description |
| --- | --- | --- |
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login, returns session |
| GET | `/auth/me` | Current profile |

## Properties
| Method | Path | Description |
| --- | --- | --- |
| GET | `/properties` | Search/list (filters via query) |
| GET | `/properties/:id` | Property details |
| POST | `/properties` | Create listing |

## Analysis
| Method | Path | Description |
| --- | --- | --- |
| POST | `/analysis/metrics` | Compute investment metrics from assumptions |
| POST | `/analysis/compare` | Compare multiple properties |

## Reports
| Method | Path | Description |
| --- | --- | --- |
| POST | `/reports` | Generate an AI investment report |
| GET | `/reports/:id` | Fetch a report |
| GET | `/reports` | List user reports |

## Watchlist
| Method | Path | Description |
| --- | --- | --- |
| GET | `/watchlist` | List saved properties |
| POST | `/watchlist` | Save a property |
| DELETE | `/watchlist/:id` | Remove |

## Chat
| Method | Path | Description |
| --- | --- | --- |
| POST | `/chat` | Ask a grounded (RAG) question |
