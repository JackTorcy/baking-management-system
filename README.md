# Baking Management System

A web app for small local bakers to manage recipes, track ingredient costs, track orders and price their products.

## Tech stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, React Router
- **Backend:** ASP.NET Core Web API, Entity Framework Core, ASP.NET Core Identity
- **Database:** PostgreSQL (hosted on Neon), Deployed on Azure

## Design Decisions

- I built a service layer to contain business logic so that the database is not directly accessible from the front-end, by using dtos (data transfer objects) I was able to ensure my database schema is never displayed to the user.
- I added soft-delete to ingredients and recipes so that data can be restored if deleted by mistake.
- Ingredients are modelled such that the user can type in natural english what was purchased and the system calculates the cost per unit, e.g. "I paid £(price) for (amount) (unit) of (ingredient name)"

## Features

**Built**

- User accounts and authentication (ASP.NET Core Identity)
- Ingredients: create, edit, soft-delete, with unit and price
- Recipes: create and edit, with ingredients and quantities, cost automatically calculated and suggests based on ingredients used.
- Component recipes (recipes used inside other recipes)

<img width="732" height="794" alt="image" src="https://github.com/user-attachments/assets/2c5ec5ec-3c29-4fcc-8781-4420453162ef" />

<img width="1129" height="800" alt="image" src="https://github.com/user-attachments/assets/59b29a0e-2b11-4353-bd87-a61a7e8ba233" />

<img width="1129" height="798" alt="image" src="https://github.com/user-attachments/assets/167de689-adab-45b3-9925-21ea842fdf49" />

<img width="1126" height="796" alt="image" src="https://github.com/user-attachments/assets/1e117995-100a-4c2d-82a1-386db1d2bf6c" />

**Planned**

- Order tracking
- User profiles and settings
- Customer ordering


