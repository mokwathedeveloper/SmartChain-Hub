
# SmartChain Hub: User Journey and Detailed Wireframe

## User Journey Breakdown

### 1. User Logs In
- **Action**: The user logs into **SmartChain Hub** using their credentials (via **Supabase authentication**).
- **Expected Outcome**: The user is successfully logged in and directed to the **Dashboard Landing Page**.
- **Key Components**: 
  - **Login Form**: Email and password fields, with options for **forgot password** and **sign-up**.

### 2. Dashboard Landing Page
- **Action**: After logging in, the user is greeted with a **personalized hero section**.
- **Expected Outcome**: The user sees their **current balance**, **recent transactions**, and **AI-driven transaction optimization** suggestions.
- **Key Components**:
  - **Hero Section**: Displays user’s name, current balance, and recent transaction statistics.
  - **AI Transaction Optimization**: A form that lets users input **transaction details** (amount and transaction type).
  - **Blockchain Transactions**: Users can see **pending** and **confirmed transactions** in real-time.
  - **Revenue Sharing**: Display the user's share of **revenue** from optimized transactions, with an option to **claim earnings**.

### 3. Transaction Optimization
- **Action**: The user inputs **transaction data** and the system returns **optimized results** for the best transaction route and cost.
- **Expected Outcome**: The user receives the **optimized transaction details** and can choose to **confirm** or **modify** the transaction.
- **Key Components**:
  - **Transaction Input Form**: Inputs for **amount**, **transaction type**, and **destination**.
  - **Optimized Transaction Recommendations**: Based on AI-driven analysis, the user sees the **optimized transaction route**.

### 4. Blockchain Interaction
- **Action**: Once the user confirms the transaction, the **blockchain interaction** happens automatically in the backend via **smart contracts**.
- **Expected Outcome**: The transaction is confirmed on the **blockchain**, and the user receives real-time updates on the **transaction status**.
- **Key Components**:
  - **Transaction Status**: Displays the **current status** (pending, confirmed) of the blockchain transaction.
  - **Smart Contract Interaction**: Blockchain **smart contracts** handle the transaction execution and verification.

### 5. Revenue Sharing
- **Action**: The user checks their **revenue share** from previous transactions and claims any earnings.
- **Expected Outcome**: The user sees how much **revenue** they have earned from transaction optimizations and clicks **claim** to receive their earnings.
- **Key Components**:
  - **Revenue Summary**: Displays the user's **share of revenue**.
  - **Claim Revenue Button**: A button to allow users to claim their share of earnings.

### 6. Profile and Settings
- **Action**: The user can navigate to their **profile settings** to manage their account and preferences.
- **Expected Outcome**: The user can edit their **profile** information and log out.
- **Key Components**:
  - **Profile Form**: Editable fields for **user name**, **email**, **preferences**, etc.
  - **Logout Option**: Option for the user to log out of their account.

## Wireframes for SmartChain Hub

### 1. Login Page Wireframe
- **Components**: 
  - **Login Form**: Input fields for **Email** and **Password**.
  - **Forgot Password** link and **Sign-Up** link.
![Login Page Wireframe](sandbox:/mnt/data/a_wireframe_design_of_a_dashboard_landing_page_is.png)

### 2. Dashboard Landing Page Wireframe
- **Components**:
  - **Hero Section**: Personalized greeting, current balance, and recent transactions.
  - **AI Transaction Optimization**: Form for entering transaction data.
  - **Blockchain Transactions**: Display pending and confirmed transactions.
  - **Revenue Sharing**: Displays the user’s revenue share.
![Dashboard Landing Page Wireframe](sandbox:/mnt/data/a_wireframe_design_of_a_dashboard_landing_page_is.png)

### 3. Transaction Optimization Wireframe
- **Components**:
  - **Transaction Input Form**: Users input the **amount** and **transaction type**.
  - **Optimized Results**: AI-driven optimized transaction suggestions.
![Transaction Optimization Wireframe](sandbox:/mnt/data/a_wireframe_design_of_a_dashboard_landing_page_is.png)

### 4. Blockchain Transaction Status Wireframe
- **Components**:
  - **Transaction Status**: Shows the status of the user’s blockchain transaction (e.g., **pending**, **confirmed**).
  - **Transaction Details**: Detailed view of the transaction, including **transaction hash** and confirmation status.

### 5. Revenue Sharing Wireframe
- **Components**:
  - **Revenue Summary**: Display of the user’s revenue share from optimized transactions.
  - **Claim Revenue Button**: Button to claim available earnings.

### 6. Profile Settings Wireframe
- **Components**:
  - **Profile Form**: Allows users to edit their name, email, and preferences.
  - **Logout Option**: Button to log out.

---

### Next Steps:
1. **Frontend Development**: Start by implementing the **Dashboard Page**, **Transaction Optimization**, and **Blockchain Integration** using the **wireframes** as a reference.
2. **Backend Integration**: Ensure that the **Supabase backend** is set up to handle **user authentication**, **transaction data**, and **real-time updates**.
3. **Blockchain Smart Contract**: Implement and deploy the **smart contracts** for **transaction validation** and **revenue sharing**.
