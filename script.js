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

// Get category badge class (Red & Black Theme)
function getCategoryBadgeClass(category) {
    const badgeMap = {
        'Salary': 'badge-salary',
        'Food': 'badge-food',
        'Rent': 'badge-rent',
        'Entertainment': 'badge-entertainment',
        'Utilities': 'badge-utilities',
        'Other': 'badge-other'
    };
    return badgeMap[category] || 'badge-other';
}

function renderList() {
    const list = document.getElementById('list');
    list.innerHTML = '';
    
    if (transactions.length === 0) {
        list.innerHTML = `
            <tr>
                <td colspan="4" class="px-6 py-8 text-center">
                    <div class="flex flex-col items-center gap-3">
                        <svg class="w-16 h-16" style="color: rgba(255, 0, 0, 0.3);" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <p class="text-lg font-semibold" style="color: rgba(255, 255, 255, 0.7);">No transactions yet</p>
                        <p class="text-sm" style="color: rgba(255, 255, 255, 0.5);">Add your first transaction to get started</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    transactions.slice(0, 10).forEach(transaction => {
        const sign = transaction.amount < 0 ? '-' : '+';
        const colorClass = transaction.amount < 0 ? 'text-red-400' : 'text-green-400';
        const badgeClass = getCategoryBadgeClass(transaction.category);
        
        const row = document.createElement('tr');
        row.className = 'transition-all duration-300';
        row.innerHTML = `
            <td class="px-6 py-4">
                <span class="font-semibold" style="color: rgba(255, 255, 255, 0.9);">${transaction.text}</span>
            </td>
            <td class="px-6 py-4">
                <span class="${badgeClass} py-2 px-4 rounded-full text-xs font-bold shadow-lg">
                    ${transaction.category}
                </span>
            </td>
            <td class="px-6 py-4 text-right font-bold text-lg ${colorClass}">
                ${sign}₹${formatMoney(Math.abs(transaction.amount))}
            </td>
            <td class="px-6 py-4 text-center">
                <button class="delete-btn bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all transform hover:scale-105 hover:shadow-red-500/50" 
                        onclick="removeTransaction('${transaction.id}')"
                        style="position: relative; overflow: hidden;">
                    <span style="position: relative; z-index: 1;">Delete</span>
                </button>
            </td>
        `;
        list.appendChild(row);
    });
    
    // Add glow effect to delete buttons
    addDeleteButtonGlowEffect();
}

// Add glow effect to delete buttons
function addDeleteButtonGlowEffect() {
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.6), 0 0 40px rgba(255, 0, 0, 0.4), 0 0 60px rgba(255, 0, 0, 0.2)';
        });
        btn.addEventListener('mouseleave', function() {
            this.style.boxShadow = '';
        });
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
    
    // Red and Black Theme Colors for Chart
    const redBlackGradients = [
        'rgba(255, 0, 0, 0.9)',      // Bright Red
        'rgba(204, 0, 0, 0.9)',      // Dark Red
        'rgba(255, 51, 51, 0.9)',    // Light Red
        'rgba(153, 0, 0, 0.9)',      // Deep Red
        'rgba(255, 102, 102, 0.9)',  // Pink Red
        'rgba(102, 0, 0, 0.9)'       // Maroon
    ];
    
    const redBlackBorders = [
        'rgba(255, 0, 0, 1)',
        'rgba(204, 0, 0, 1)',
        'rgba(255, 51, 51, 1)',
        'rgba(153, 0, 0, 1)',
        'rgba(255, 102, 102, 1)',
        'rgba(102, 0, 0, 1)'
    ];
    
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: redBlackGradients,
                borderColor: redBlackBorders,
                borderWidth: 3,
                hoverOffset: 15,
                hoverBorderWidth: 4
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 12,
                            weight: '600',
                            family: 'Inter'
                        },
                        color: 'rgba(255, 255, 255, 0.9)',
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.95)',
                    padding: 15,
                    cornerRadius: 12,
                    titleFont: {
                        size: 15,
                        weight: 'bold',
                        family: 'Inter'
                    },
                    bodyFont: {
                        size: 14,
                        family: 'Inter'
                    },
                    borderColor: 'rgba(255, 0, 0, 0.5)',
                    borderWidth: 2,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ₹' + formatMoney(context.parsed);
                        },
                        labelTextColor: function(context) {
                            return '#ffffff';
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1500,
                easing: 'easeInOutQuart'
            }
        }
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

    const opt = { 
        margin: 0.3, 
        filename: 'Expense_Report.pdf', 
        image: { type: 'jpeg', quality: 0.98 }, 
        html2canvas: { scale: 2 }, 
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } 
    };

    html2pdf().set(opt).from(element).save().then(() => {
        if(formCard) formCard.style.display = 'block';
        if(downloadBtn) downloadBtn.style.display = 'flex';
        if(logoutBtn) logoutBtn.style.display = 'block';
        deleteButtons.forEach(btn => btn.style.display = 'inline-block');
    });
}
