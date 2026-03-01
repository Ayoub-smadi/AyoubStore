## Packages
react-leaflet | Map rendering for live bus tracking
leaflet | Core map library required by react-leaflet
@types/leaflet | TypeScript definitions for Leaflet
recharts | Dashboard analytics and graphs
jspdf | PDF report generation for attendance and student lists
jspdf-autotable | Table formatting for PDF exports
lucide-react | Standardized iconography

## Notes
- Ensure Leaflet CSS is imported in index.css
- Role-based routing: Admin, Parent, Driver pages have distinct views
- The backend API contract specifies simple stats and list endpoints; mock mutations if not provided in the schema contract.
