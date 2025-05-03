Nutribyte is a full-stack nutrition tracking web app.

Features: Search foods by name or category, view nutrient information, add foods to personal log, see nutrient totals, persist user logs in MongoDB per user ID, and simple user ID input

Tech used: Frontend (React / Parcel), Backend (Node.js, Express), and Database (MongoDB)

Application:
- git clone https://github.com/on-wins/nutribyte.git
- in the nutribyte root folder:
    npm install
- in the client folder:
    npm install

- in one terminal in the root folder, start backend:
    node nutriserver.cjs
- in another terminal in the client folder, start frontend:
    npm start

Future Improvements:
- add real authentication
- optimize large dataset queries
- improve UI styling
- data cleaning
