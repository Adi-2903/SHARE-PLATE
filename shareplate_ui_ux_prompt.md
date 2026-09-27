# SharePlate - Smart Near-Expiry Food Rescue Platform
## UI/UX Design & Architecture Guide

**Context for AI:** 
I am building a full-stack MERN platform called "SharePlate". The goal is to rescue near-expiry food from restaurants/hostels and redistribute it to NGOs via volunteers. The platform uses a smart priority system to rank food by urgency (e.g., expires in < 4 hours is URGENT).

Please help me design a highly premium, modern, and beautiful UI/UX for this application. Below are all the required windows, user roles, features, and the intended design aesthetic. 

---

## 🎨 Design System & Aesthetics
- **Vibe:** Modern, trustworthy, eco-friendly, and highly premium.
- **Colors:** Deep emerald greens (nature/growth), vibrant oranges/reds for urgency (near-expiry), and clean glassmorphism dark/light modes.
- **Typography:** Modern sans-serif (e.g., Outfit, Inter, or Plus Jakarta Sans). High contrast and highly legible.
- **Components:** Glassmorphic cards, soft glowing shadows, animated counters, micro-interactions on hover, and smooth page transitions. 
- **Layout:** Fully responsive, mobile-first approach, with sidebar-based dashboards for logged-in users.

---

## 👥 User Roles (4 Types)
1. **Donor (Restaurant/Hostel):** Donates excess food.
2. **NGO:** Views the live food board and claims food.
3. **Volunteer:** Picks up the claimed food and delivers it. Earns gamified badges.
4. **Admin:** Oversees the whole platform, manages users, views statistics.

---

## 🪟 Application Windows (Pages)

### 1. Landing Page (Home)
- **Hero Section:** High-impact headline ("Rescue Food. Feed Communities. Save the Planet."). Call-to-action buttons for "Donate Food Now" and "Claim as NGO".
- **Live Stats Counters:** Animated numbers showing "Meals Rescued", "Active NGOs", "Carbon Saved".
- **How It Works (6-Step Pipeline):** A visual pipeline showing: Food created → System checks expiry → Nearby NGOs ranked → Urgent food prioritized → NGO claims → Volunteer delivers.
- **Live Feed:** A scrolling marquee or cards showing recent real-time donations.

### 2. Authentication (Login & Register)
- **Layout:** Split screen or centered glassmorphic card with subtle floating background elements.
- **Register Form:** Needs a visual role selector (Cards with icons for Donor, NGO, Volunteer) before filling out the form.
- **Fields:** Name, Org Name (if applicable), Email, Password, Phone, City, Pincode.

### 3. Donor Dashboard & Donate Page
- **Donate Form:** Clean, step-by-step form to add a food item.
  - Fields: Food Item Name, Quantity (e.g., "50 meals"), Expiry Time (Date/Time picker), Pickup Location.
- **Dynamic Urgency Indicator:** As the user selects an expiry time, the UI should dynamically show a badge (e.g., "URGENT - Expires in 2 hours!" in red).
- **Donation History:** A table/list of past donations and their current status (Pending, Claimed, Delivered).

### 4. Donations Board (Public & NGO View)
- **The Core Feature:** A Kanban-style or Grid layout of all available food.
- **Urgency Sorting:** Cards must be visually distinct based on expiry:
  - 🔴 **URGENT:** Expires in < 4 hours (Pulsing red glow, countdown timer).
  - 🟡 **MODERATE:** Expires in 4-8 hours.
  - 🟢 **SAFE:** Expires in 8+ hours.
- **Card Content:** Food name, Quantity, Distance/Location, Expiry countdown, and a prominent "Claim" button for NGOs.
- **Filters:** Filter by city, urgency level, or vegetarian/non-veg.

### 5. NGO Dashboard
- **Urgent Alerts Sidebar:** A dedicated section notifying the NGO of high-priority food nearby.
- **My Claims:** A list of food the NGO has successfully claimed, showing the assigned Volunteer's contact info and live delivery status.

### 6. Volunteer Dashboard
- **Gamification Profile:** Shows the volunteer's rank, avatar, and badges earned (e.g., "Food Saver Level 1", "Night Rider").
- **Available Pickups:** Map or list view of claimed food that needs a delivery driver.
- **Active Task:** Big, clear UI for their current delivery, with a map link and a swipe-to-confirm "Mark as Delivered" button.
- **City Leaderboard:** A ranking of top volunteers in their city.

### 7. Admin Dashboard
- **Overview Metrics:** Total food rescued, active users, failed deliveries. Visualized using bar charts or line graphs.
- **Data Tables:** Searchable, paginated tables for managing Users (delete/ban) and managing all Donations.
- **System Health:** Quick status indicators.

---

## 🤖 Prompt for the AI UI Generator:
> "Please generate modern, responsive UI components for the [INSERT PAGE NAME HERE] page based on this architecture. Use Tailwind CSS, Lucide Icons, and React. Focus heavily on micro-animations, glassmorphism, and making the Urgency levels (Red/Yellow/Green) visually striking. Include hover states and a premium dark-mode aesthetic."
