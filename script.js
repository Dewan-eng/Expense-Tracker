import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, where } 
from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } 
from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// --- YOUR FIREBASE CONFIG ---
const firebaseConfig = {
    apiKey: "AIzaSyAtUvr00M_ZPO3emUz5Vk03FWKOfHU8_08",
    authDomain: "expense-tracker-b5708.firebaseapp.com",
    projectId: "expense-tracker-b5708",
    storageBucket: "expense-tracker-b5708.firebasestorage.app",
    messagingSenderId: "927056899088",
    appId: "1:927056899088:web:8fec13a1717014e15aee95"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// State
let transactions = [];
let myChart;
let currentUser = null;
let unsubscribe = null; 

// Elements
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const authForm = document.getElementById('auth-form');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const authTitle = document.getElementById('auth-title');
const authToggleBtn = document.getElementById('auth-toggle-btn');
const authToggleText = document.getElementById('auth-toggle-text');
const authError = document.getElementById('auth-error');
const logoutBtn = document.getElementById('logout-btn');

// Toggle Login / Signup Mode
let isLoginMode = true;
authToggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    authTitle.innerText = isLoginMode ? 'Login' : 'Sign Up';
    authToggleBtn.innerText = isLoginMode ? 'Sign Up' : 'Login';
    authToggleText.innerText = isLoginMode ? "Don't have an account?" : "Already have an account?";
    authError.classList.add('hidden');
});

// Handle Authentication Form Submit
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = authEmail.value;
    const password = authPassword.value;
    authError.classList.add('hidden');

    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, email, password);
        } else {
            await createUserWithEmailAndPassword(auth, email, password);
        }
    } catch (error) {
        authError.innerText = error.message;
        authError.classList.remove('hidden');
    }
});

// Handle Logout
logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

// --- AUTH STATE LISTENER ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        initApp(); 
    } else {
        currentUser = null;
        authContainer.classList.remove('hidden');
        appContainer.classList.add('hidden');
        
        transactions = [];
        if (unsubscribe) unsubscribe(); 
        updateUI();
    }
});

// --- APP LOGIC ---

function initApp() {
    const q = query(
        collection(db, "transactions"), 
        where("uid", "==", currentUser.uid), 
        orderBy("createdAt", "desc")
    );
    
    unsubscribe = onSnapshot(q, (snapshot) => {
        transactions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        updateUI();
    });
}

async function addTransaction(e) {
    e.preventDefault();
    const text = document.getElementById('text');
    const amount = document.getElementById('amount');
    const category = document.getElementById('category');

    if (text.value.trim() === '' || amount.value.trim() === '') return;

    const newTransaction = {
        text: text.value,
        amount: +amount.value,
        category: category.value,
        createdAt: serverTimestamp(),
        uid: currentUser.uid 
    };

    await addDoc(collection(db, "transactions"), newTransaction);
    text.value = ''; amount.value = '';
}

// Attach to window so HTML button can find it
window.removeTransaction = async function(id) {
    await deleteDoc(doc(db, "transactions", id));
}

function formatMoney(number) {
    return number.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function updateAccount() {
    const balance = document.getElementById('balance');
    const money_plus = document.getElementById('money-plus');
    const money_minus = document.getElementById('money-minus');

    const amounts = transactions.map(t => t.amount);
    const total = amounts.reduce((acc, item) => (acc += item), 0);
    const income = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0);
    const expense = (amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1);

    balance.innerText = `₹${formatMoney(total)}`;
    money_plus.innerText = `+₹${formatMoney(income)}`;
    money_minus.innerText = `-₹${formatMoney(expense)}`;
}

function renderList() {
    const list = document.getElementById('list');
    list.innerHTML = '';
    transactions.slice(0, 10).forEach(transaction => {
        const sign = transaction.amount < 0 ? '-' : '+';
        const colorClass = transaction.amount < 0 ? 'text-red-500' : 'text-green-500';
        
        const row = document.createElement('tr');
        row.className = 'border-b hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-4 py-2">${transaction.text}</td>
            <td class="px-4 py-2"><span class="bg-gray-200 text-gray-700 py-1 px-3 rounded-full text-xs">${transaction.category}</span></td>
            <td class="px-4 py-2 text-right font-bold ${colorClass}">${sign}₹${formatMoney(Math.abs(transaction.amount))}</td>
            <td class="px-4 py-2 text-center">
                <button class="text-red-500 hover:text-red-700 font-bold" onclick="removeTransaction('${transaction.id}')">Delete</button>
            </td>
        `;
        list.appendChild(row);
    });
}

function updateChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    const categories = {};
    transactions.forEach(t => {
        if (t.amount < 0) {
            if (categories[t.category]) categories[t.category] += Math.abs(t.amount);
            else categories[t.category] = Math.abs(t.amount);
        }
    });

    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#6B7280']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function updateUI() {
    updateAccount();
    renderList();
    updateChart();
}

document.getElementById('form').addEventListener('submit', addTransaction);

// PDF Export (Attached to Window)
window.downloadPDF = function() {
    const element = document.getElementById('app-container'); 
    const formCard = document.getElementById('form').parentElement; 
    const deleteButtons = document.querySelectorAll('button[onclick^="removeTransaction"]');
    const downloadBtn = document.querySelector('button[onclick="downloadPDF()"]');
    const logoutBtn = document.getElementById('logout-btn');

    if(formCard) formCard.style.display = 'none';
    if(downloadBtn) downloadBtn.style.display = 'none';
    if(logoutBtn) logoutBtn.style.display = 'none';
    deleteButtons.forEach(btn => btn.style.display = 'none');

    const opt = { margin: 0.3, filename: 'Expense_Report.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } };

    html2pdf().set(opt).from(element).save().then(() => {
        if(formCard) formCard.style.display = 'block';
        if(downloadBtn) downloadBtn.style.display = 'flex';
        if(logoutBtn) logoutBtn.style.display = 'block';
        deleteButtons.forEach(btn => btn.style.display = 'inline-block');
    });
}