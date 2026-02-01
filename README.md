# 💸 SplitTheExpenses

A beautiful and intuitive mobile application for splitting expenses among friends and groups. Built with React Native (Expo) and Node.js, this app makes tracking shared expenses effortless.

![App Banner](./screenshots/banner.png)

---

## ✨ Features

- **👥 Friends Management** - Add and manage friends to split expenses with
- **📁 Group Support** - Create groups for trips, events, or shared households
- **💰 Expense Tracking** - Record expenses with multiple split options
- **📊 Smart Settlements** - Automatically calculates who owes whom
- **🗂️ Journey Archive** - Archive completed trips/events for future reference
- **🌓 Dark & Light Mode** - Automatic theme based on system preferences
- **☁️ Cloud Sync** - Data synced across devices via MongoDB

---

## 📱 Screenshots

<table>
  <tr>
    <td><img src="./screenshots/home_screen.png" alt="Home Screen" width="200"/></td>
    <td><img src="./screenshots/add_expense.png" alt="Add Expense" width="200"/></td>
    <td><img src="./screenshots/groups.png" alt="Groups" width="200"/></td>
  </tr>
  <tr>
    <td align="center"><b>Home Screen</b></td>
    <td align="center"><b>Add Expense</b></td>
    <td align="center"><b>Groups</b></td>
  </tr>
</table>

<table>
  <tr>
    <td><img src="./screenshots/settlement.png" alt="Settlement" width="200"/></td>
    <td><img src="./screenshots/activity.png" alt="Activity" width="200"/></td>
    <td><img src="./screenshots/light_mode.png" alt="Light Mode" width="200"/></td>
  </tr>
  <tr>
    <td align="center"><b>Settlement</b></td>
    <td align="center"><b>Activity</b></td>
    <td align="center"><b>Dark Mode</b></td>
  </tr>
</table>

---

## 🛠️ Tech Stack

### Frontend (Mobile App)
- **React Native** with **Expo** (~54.0)
- **React Navigation** for seamless navigation
- **React Native Paper** for Material Design components
- **Axios** for API calls
- **AsyncStorage** for local data persistence

### Backend (API Server)
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose** ODM
- **CORS** enabled for cross-origin requests
- RESTful API architecture

---

## 🚀 Getting Started

### Prerequisites

- Node.js (≥18.0.0)
- npm or yarn
- MongoDB Atlas account (or local MongoDB installation)
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/SplitTheExpenses.git
   cd SplitTheExpenses
   ```

2. **Setup the Server**
   ```bash
   cd server
   npm install
   ```

3. **Configure Environment Variables**
   
   Create a `.env` file in the `server` directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   ```

4. **Start the Server**
   ```bash
   npm start
   ```

5. **Setup the Client**
   ```bash
   cd ../client
   npm install
   ```

6. **Update API URL**
   
   Update the API base URL in `client/src/services/api.js` to point to your server.

7. **Start the App**
   ```bash
   npx expo start
   ```

8. **Scan QR Code**
   
   Scan the QR code with Expo Go app on your phone to run the application.

---

## 📂 Project Structure

```
SplitTheExpenses/
├── client/                    # React Native mobile app
│   ├── src/
│   │   ├── context/          # React Context providers
│   │   ├── navigation/       # Navigation configuration
│   │   ├── screens/          # App screens
│   │   └── services/         # API service layer
│   ├── assets/               # Images and icons
│   ├── App.js                # App entry point
│   └── app.json              # Expo configuration
│
├── server/                    # Node.js backend
│   ├── models/               # Mongoose models
│   ├── db.js                 # Database connection
│   ├── logic.js              # Settlement calculation logic
│   └── index.js              # Express server & routes
│
├── screenshots/              # App screenshots (add your own!)
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/user/init` | Initialize user |
| GET | `/api/people` | Get all people |
| POST | `/api/people` | Add a person |
| GET | `/api/friends` | Get friends list |
| POST | `/api/friends` | Add a friend |
| DELETE | `/api/friends/:id` | Delete a friend |
| GET | `/api/groups` | Get all groups |
| POST | `/api/groups` | Create a group |
| DELETE | `/api/groups/:id` | Delete a group |
| GET | `/api/expenses` | Get all expenses |
| POST | `/api/expenses` | Add an expense |
| DELETE | `/api/expenses/:id` | Delete an expense |
| GET | `/api/settlement` | Calculate settlements |
| GET | `/api/journeys` | Get archived journeys |
| POST | `/api/journeys/archive` | Archive current journey |
| DELETE | `/api/journeys/:id` | Delete a journey |

---

## 📸 Adding Your Screenshots

To add screenshots to this README:

1. Create a `screenshots` folder in the root directory
2. Add your screenshots with these names:
   - `banner.png` - A wide banner image
   - `home_screen.png` - Home screen screenshot
   - `add_expense.png` - Add expense screen
   - `groups.png` - Groups screen
   - `settlement.png` - Settlement screen
   - `activity.png` - Activity/History screen
   - `light_mode.png` - light mode example

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**Sajal Rastogi**

- GitHub: [@Sajalrastogi191](https://github.com/Sajalrastogi191)

---

## 🙏 Acknowledgments

- React Native community
- Expo team for the amazing development experience
- MongoDB Atlas for free tier cloud database

---

<p align="center">
  Made with ❤️ for easier expense splitting
</p>

