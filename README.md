# 💰 Financial Expense Tracker

A comprehensive, full-stack financial dashboard designed to track income, expenses, and visualize spending habits. Built with **Vanilla JavaScript**, **Tailwind CSS**, and **Firebase** for real-time data persistence and authentication.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📸 Screenshots

<img width="1919" height="928" alt="Screenshot 2026-01-21 193223" src="https://github.com/user-attachments/assets/12b9ed65-f208-4437-b090-02eb85547723" />

### 🚀 Live Link: [Expense-Tracker](https://dewan-eng.github.io/Expense-Tracker/)

## ✨ Key Features

* **🔐 Secure Authentication:** User registration and login system using Firebase Auth. Data is private and isolated per user.
* **📊 Dynamic Visualization:** Real-time Pie Chart (Chart.js) that updates instantly as expenses are added.
* **💸 Real-time Calculations:** Automatic tracking of Total Balance, Income, and Expenses.
* **🇮🇳 Localization:** Currency formatting in Indian Rupee (₹) with proper locale standards.
* **📄 PDF Reporting:** One-click export feature to download a professional PDF report of the financial summary.
* **📱 Responsive Design:** Fully responsive UI built with Tailwind CSS, looking great on desktop and mobile.

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, JavaScript (ES6+)
* **Styling:** Tailwind CSS (via CDN)
* **Backend / Database:** Firebase Firestore (NoSQL)
* **Authentication:** Firebase Auth
* **Libraries:**
    * [Chart.js](https://www.chartjs.org/) (Data Visualization)
    * [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/) (PDF Export)

## 🚀 Getting Started

To run this project locally, follow these steps:

### Prerequisites
* A modern web browser (Chrome, Firefox, Edge).
* Active internet connection (for CDN libraries and Firebase connection).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/](https://github.com/)[YOUR-USERNAME]/expense-tracker.git
    ```
2.  **Navigate to the project folder:**
    ```bash
    cd expense-tracker
    ```
3.  **Open `index.html`:**
    You can open the file directly in your browser, or use a live server extension in VS Code.

## ⚙️ Configuration

This project relies on Firebase. If you want to use your own backend:

1.  Create a project at [Firebase Console](https://console.firebase.google.com/).
2.  Enable **Authentication** (Email/Password).
3.  Enable **Firestore Database**.
4.  Replace the `firebaseConfig` object in `script.js` with your own credentials.

## 🛡️ Security Note

This project uses client-side Firebase configuration. To ensure data security:
* **Firestore Rules:** Configured to allow users to read/write only their own data (`request.auth.uid == resource.data.uid`).
* **Authorized Domains:** Firebase Authentication is restricted to the specific deployment domains.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeature`).
3.  Commit your changes (`git commit -m 'Add some feature'`).
4.  Push to the branch (`git push origin feature/YourFeature`).
5.  Open a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

> **Note:** This project was built as a portfolio demonstration of full-stack serverless development capabilities.
