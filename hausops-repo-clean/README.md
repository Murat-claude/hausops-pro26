# HausOps PRO

Reinigungsverwaltung für Kurzzeitvermietung Livora Living (7 Einheiten)

## Stack
- **Frontend:** React (pre-built static assets)
- **Backend:** Netlify Functions
- **Datenbank:** Supabase (Frankfurt)
- **Property Management:** Smoobu API v3 mit HMAC-Authentifizierung
- **Deployment:** Netlify (mit Git-Integration)

## Features
- Buchungssync von Smoobu
- Reinigungsplanung
- Teamberwaltung (7 Mitarbeiter)
- Real-time Dashboard

## Einrichtung (Lokal)

```bash
npm install -g netlify-cli
netlify dev
```

Öffne http://localhost:8888

## Environment Variables

Müssen in Netlify Site Settings konfiguriert sein:

```
SMOOBU_API_KEY=usr_live_652933a8098f5f1876582a3ec1ce65f6
SMOOBU_SECRET=b+aY6T8WOJnFQXlQna7OFv5YyH2pzX51T7gRcUsFyz0=
```

## Smoobu Integration

- **API:** https://api.smoobu.com
- **Auth:** HMAC-SHA256 (v3.0)
- **Endpoint:** `GET /api/v3/bookings`
- **Migration:** Bis 31.10.2026 von Legacy auf HMAC erforderlich

## Deploy

```bash
git push origin main
```

Netlify deployt automatisch via GitHub Actions.

## Support

Kontakt: Murat Kurt, Hamm
