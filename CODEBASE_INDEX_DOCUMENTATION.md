# SmartChain Hub - Codebase Index & Documentation Structure

## 📁 Project Structure Overview

```
SmartChain-Hub/
├── 🎯 Core Applications
│   ├── smartchain_hub_frontend/     # Next.js 16 Frontend Application
│   ├── smartchain_hub_backend/      # Node.js Express API Server
│   ├── ai-agent/                    # Python Flask AI Service
│   └── blockchain/                  # Solidity Smart Contracts
├── 📚 Documentation
│   ├── docs/                        # Comprehensive Documentation
│   ├── *.md                        # Root-level Documentation
│   └── README.md                    # Main Project Documentation
├── 🔧 Configuration
│   ├── .env.production.example      # Production Environment Template
│   ├── deploy.sh                    # Automated Deployment Script
│   └── update-env.sh               # Environment Update Script
└── 🚀 Deployment
    ├── render.yaml                  # Render.com Configuration
    └── vercel.json                 # Vercel Deployment Configuration
```

---

## 🎯 Core Applications

### 1. Frontend Application (`smartchain_hub_frontend/`)

**Technology Stack:** Next.js 16, TypeScript, Tailwind CSS, ethers.js

#### 📂 Directory Structure
```
src/
├── components/          # Reusable UI Components
│   ├── Layout.tsx      # Main application layout
│   ├── Header.tsx      # Navigation header with wallet connection
│   ├── Sidebar.tsx     # Application sidebar navigation
│   ├── Footer.tsx      # Application footer
│   └── AgentIDCard.tsx # Soulbound Agent ID display component
├── context/            # React Context Providers
│   ├── Web3Context.tsx # Ethereum wallet connection management
│   └── NotificationContext.tsx # Toast notification system
├── hooks/              # Custom React Hooks
│   └── useAuth.ts      # Authentication hook for Supabase
├── pages/              # Next.js Pages (App Router)
│   ├── api/            # API Routes (Server-side)
│   │   ├── storage-upload.ts    # 0G Storage Log layer integration
│   │   ├── agent-memory.ts      # 0G Storage KV layer integration
│   │   └── onramp/
│   │       ├── stripe.ts        # Stripe payment processing
│   │       └── mpesa.ts         # Flutterwave M-Pesa integration
│   ├── dashboard.tsx   # Agent overview and statistics
│   ├── transactions.tsx # AI-powered transaction optimizer
│   ├── payments.tsx    # Send/stake/withdraw A0GI
│   ├── onramp.tsx      # Buy A0GI with fiat/crypto
│   ├── revenue.tsx     # Revenue sharing and claims
│   └── profile.tsx     # User account management
├── styles/             # Global Styles
│   └── globals.css     # Tailwind CSS configuration
└── utils/              # Utility Functions
    ├── api.ts          # AI agent API client
    ├── blockchain.ts   # Smart contract interactions
    ├── storage.ts      # 0G Storage client wrapper
    ├── agentId.ts      # Agent ID contract helpers
    └── agentMemory.ts  # Persistent memory management
```

#### 🔑 Key Features
- **Wallet Integration:** MetaMask + manual address entry
- **0G Chain Integration:** Full 0G stack utilization
- **AI Optimization:** TEE-verified transaction optimization
- **Payment Processing:** Stripe + M-Pesa onramp
- **Agent Identity:** Soulbound NFT management

#### 📋 Code Quality Standards
```typescript
/**
 * @fileoverview Transaction optimization component with AI integration
 * @author SmartChain Hub Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/context/Web3Context';
import { useNotification } from '@/context/NotificationContext';

/**
 * Transaction optimization interface
 */
interface TransactionParams {
  /** Recipient address */
  to: string;
  /** Transaction value in wei */
  value: string;
  /** Gas limit */
  gasLimit: number;
  /** Gas price in gwei */
  gasPrice?: string;
}

/**
 * AI optimization result
 */
interface OptimizationResult {
  /** Original transaction parameters */
  original: TransactionParams;
  /** Optimized transaction parameters */
  optimized: TransactionParams;
  /** Estimated savings in USD */
  savings: number;
  /** Optimization strategy used */
  strategy: 'gas_price' | 'gas_limit' | 'timing' | 'route';
  /** TEE verification proof */
  teeProof?: string;
}

/**
 * Transaction Optimizer Component
 * Provides AI-powered transaction optimization with 0G Compute integration
 */
export default function TransactionOptimizer(): JSX.Element {
  // Component implementation with proper error handling and logging
}
```

### 2. Backend API (`smartchain_hub_backend/`)

**Technology Stack:** Node.js, Express.js, Supabase, ethers.js

#### 📂 Directory Structure
```
├── config/             # Configuration Management
│   ├── supabaseConfig.js    # Database configuration
│   └── blockchainConfig.js  # 0G Chain configuration
├── controllers/        # Request Controllers
│   ├── transactionController.js # Transaction processing logic
│   └── userController.js       # User management logic
├── models/            # Data Models
│   ├── transactionModel.js     # Transaction data model
│   └── userModel.js            # User data model
├── routes/            # API Routes
│   ├── transactions.js         # Transaction endpoints
│   └── users.js               # User endpoints
├── services/          # Business Logic Services
│   ├── aiService.js           # AI agent integration
│   └── blockchainService.js   # Smart contract interactions
├── functions/         # Utility Functions
│   └── optimizeTransaction.js # Transaction optimization logic
└── scripts/           # Deployment Scripts
    └── deployContracts.js     # Contract deployment automation
```

#### 🔑 API Endpoints
```javascript
/**
 * @swagger
 * /api/transactions/process:
 *   post:
 *     summary: Process and optimize transaction
 *     description: Optimizes transaction parameters using AI analysis
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - value
 *               - gasLimit
 *             properties:
 *               to:
 *                 type: string
 *                 description: Recipient address
 *                 example: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87"
 *               value:
 *                 type: string
 *                 description: Transaction value in wei
 *                 example: "1000000000000000000"
 *               gasLimit:
 *                 type: number
 *                 description: Gas limit
 *                 example: 21000
 *     responses:
 *       200:
 *         description: Optimization successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OptimizationResult'
 *       400:
 *         description: Invalid transaction parameters
 *       500:
 *         description: Internal server error
 */
router.post('/process', transactionController.processTransaction);
```

### 3. AI Agent Service (`ai-agent/`)

**Technology Stack:** Python 3.12, Flask, TensorFlow, 0G Compute SDK

#### 📂 Directory Structure
```
├── server/            # Flask Application
│   └── app.py        # Main Flask server with 0G Compute integration
├── models/           # AI Models
│   ├── savings_model.py      # TensorFlow savings prediction model
│   └── tf_savings_model.keras # Trained model weights
├── scripts/          # Utility Scripts
│   ├── optimizer.py          # Transaction optimization logic
│   ├── train_model.py        # Model training script
│   └── generate_training_data.py # Training data generation
├── tests/            # Test Suite
│   ├── test_api.py          # API endpoint tests
│   ├── test_optimizer.py    # Optimization logic tests
│   └── test_integration.py  # Integration tests
└── requirements.txt  # Python dependencies
```

#### 🔑 AI Model Architecture
```python
"""
SmartChain Hub AI Transaction Optimizer

This module implements a TensorFlow-based model for predicting transaction
savings through various optimization strategies.

Model Architecture:
- Input Layer: 6 features (gas_price, gas_limit, value, network_congestion, time_of_day, tx_type)
- Hidden Layers: 2 dense layers with ReLU activation
- Output Layer: 3 outputs (optimized_gas_price, optimized_gas_limit, savings_percentage)

Training Data:
- Historical transaction data from 0G Chain
- Network congestion metrics
- Gas price trends
- Transaction success rates
"""

import tensorflow as tf
import numpy as np
from typing import Dict, List, Tuple, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TransactionOptimizer:
    """
    AI-powered transaction optimizer using TensorFlow
    
    This class implements machine learning algorithms to optimize blockchain
    transactions for reduced gas costs and improved success rates.
    """
    
    def __init__(self, model_path: str = 'models/tf_savings_model.keras'):
        """
        Initialize the transaction optimizer
        
        Args:
            model_path: Path to the trained TensorFlow model
            
        Raises:
            FileNotFoundError: If model file doesn't exist
            ValueError: If model is invalid
        """
        self.model = self._load_model(model_path)
        self.feature_scaler = self._initialize_scaler()
        
    def optimize_transaction(self, tx_params: Dict) -> Dict:
        """
        Optimize transaction parameters using AI analysis
        
        Args:
            tx_params: Dictionary containing transaction parameters
                - gas_price: Current gas price in gwei
                - gas_limit: Gas limit for transaction
                - value: Transaction value in wei
                - network_congestion: Network congestion level (0-1)
                
        Returns:
            Dictionary containing optimization results:
                - optimized_gas_price: Recommended gas price
                - optimized_gas_limit: Recommended gas limit
                - estimated_savings: Predicted savings in USD
                - confidence_score: Model confidence (0-1)
                
        Raises:
            ValueError: If transaction parameters are invalid
            RuntimeError: If optimization fails
        """
        try:
            # Validate input parameters
            self._validate_transaction_params(tx_params)
            
            # Prepare features for model inference
            features = self._prepare_features(tx_params)
            
            # Run model inference
            predictions = self.model.predict(features)
            
            # Process and return results
            return self._process_predictions(predictions, tx_params)
            
        except Exception as e:
            logger.error(f"Transaction optimization failed: {str(e)}")
            raise RuntimeError(f"Optimization failed: {str(e)}")
```

### 4. Blockchain Contracts (`blockchain/`)

**Technology Stack:** Solidity 0.8.19, Hardhat, OpenZeppelin

#### 📂 Directory Structure
```
├── contracts/        # Smart Contracts
│   ├── SmartChainAgentID.sol     # Soulbound Agent ID NFT
│   ├── SmartChainTransaction.sol # Transaction recording
│   ├── SmartChainRevenue.sol     # Revenue sharing
│   └── SmartChainPayments.sol    # Payment processing
├── scripts/          # Deployment Scripts
│   ├── deploy.js               # Main deployment script
│   └── deployAgentID.js        # Agent ID deployment
├── tests/            # Contract Tests
│   ├── SmartChain.test.js      # Main contract tests
│   └── SmartChainPayments.test.js # Payment tests
└── hardhat.config.js # Hardhat configuration
```

#### 🔑 Smart Contract Architecture
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SmartChain Agent ID
 * @dev Soulbound NFT contract for AI agent identity management
 * @notice This contract creates non-transferable tokens representing AI agents
 * 
 * Features:
 * - Soulbound tokens (non-transferable)
 * - One token per address limit
 * - On-chain memory root storage
 * - Reputation tracking
 * - Model hash verification
 * 
 * @author SmartChain Hub Team
 * @version 1.0.0
 */
contract SmartChainAgentID is ERC721, Ownable, ReentrancyGuard {
    
    /// @dev Agent information structure
    struct AgentInfo {
        bytes32 modelHash;      // Hash of AI model configuration
        bytes32 memoryRoot;     // Merkle root of agent memory
        uint256 reputation;     // Agent reputation score
        uint256 createdAt;      // Creation timestamp
        bool isActive;          // Agent status
    }
    
    /// @dev Mapping from token ID to agent information
    mapping(uint256 => AgentInfo) public agents;
    
    /// @dev Mapping from address to token ID (one per address)
    mapping(address => uint256) public addressToTokenId;
    
    /// @dev Current token ID counter
    uint256 private _tokenIdCounter;
    
    /// @dev Events
    event AgentMinted(address indexed owner, uint256 indexed tokenId, bytes32 modelHash);
    event MemoryUpdated(uint256 indexed tokenId, bytes32 newMemoryRoot);
    event ReputationUpdated(uint256 indexed tokenId, uint256 newReputation);
    
    /// @dev Custom errors
    error AgentAlreadyExists();
    error AgentNotFound();
    error InvalidModelHash();
    error InvalidMemoryRoot();
    error TransferNotAllowed();
    
    /**
     * @dev Constructor
     * @param name Token name
     * @param symbol Token symbol
     */
    constructor(string memory name, string memory symbol) 
        ERC721(name, symbol) 
        Ownable(msg.sender) 
    {
        _tokenIdCounter = 1; // Start from 1
    }
    
    /**
     * @dev Mint a new agent ID (soulbound NFT)
     * @param modelHash Hash of the AI model configuration
     * @param memoryRoot Initial memory root
     * @return tokenId The newly minted token ID
     * 
     * Requirements:
     * - Caller must not already have an agent ID
     * - Model hash must be valid (non-zero)
     * - Memory root must be valid (non-zero)
     */
    function mintAgentID(bytes32 modelHash, bytes32 memoryRoot) 
        external 
        nonReentrant 
        returns (uint256 tokenId) 
    {
        if (addressToTokenId[msg.sender] != 0) {
            revert AgentAlreadyExists();
        }
        
        if (modelHash == bytes32(0)) {
            revert InvalidModelHash();
        }
        
        if (memoryRoot == bytes32(0)) {
            revert InvalidMemoryRoot();
        }
        
        tokenId = _tokenIdCounter++;
        
        // Mint the token
        _safeMint(msg.sender, tokenId);
        
        // Store agent information
        agents[tokenId] = AgentInfo({
            modelHash: modelHash,
            memoryRoot: memoryRoot,
            reputation: 0,
            createdAt: block.timestamp,
            isActive: true
        });
        
        // Map address to token ID
        addressToTokenId[msg.sender] = tokenId;
        
        emit AgentMinted(msg.sender, tokenId, modelHash);
    }
    
    /**
     * @dev Update agent memory root (called after optimization)
     * @param tokenId Agent token ID
     * @param newMemoryRoot New memory root hash
     * 
     * Requirements:
     * - Caller must own the token
     * - Memory root must be valid
     */
    function updateMemory(uint256 tokenId, bytes32 newMemoryRoot) 
        external 
        nonReentrant 
    {
        if (ownerOf(tokenId) != msg.sender) {
            revert AgentNotFound();
        }
        
        if (newMemoryRoot == bytes32(0)) {
            revert InvalidMemoryRoot();
        }
        
        agents[tokenId].memoryRoot = newMemoryRoot;
        
        emit MemoryUpdated(tokenId, newMemoryRoot);
    }
    
    /**
     * @dev Override transfer functions to make tokens soulbound
     */
    function transferFrom(address, address, uint256) public pure override {
        revert TransferNotAllowed();
    }
    
    function safeTransferFrom(address, address, uint256) public pure override {
        revert TransferNotAllowed();
    }
    
    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert TransferNotAllowed();
    }
}
```

---

## 📚 Documentation Standards

### 1. Code Documentation Requirements

#### TypeScript/JavaScript
```typescript
/**
 * @fileoverview Brief description of file purpose
 * @author Author name
 * @version Version number
 * @since Date created
 */

/**
 * Function description
 * @param {Type} paramName - Parameter description
 * @returns {Type} Return value description
 * @throws {ErrorType} Error condition description
 * @example
 * ```typescript
 * const result = functionName(param);
 * ```
 */
```

#### Python
```python
"""
Module description

This module provides functionality for...

Classes:
    ClassName: Brief description
    
Functions:
    function_name: Brief description
    
Constants:
    CONSTANT_NAME: Brief description
    
Author: Author name
Version: Version number
Since: Date created
"""

def function_name(param: Type) -> ReturnType:
    """
    Function description
    
    Args:
        param: Parameter description
        
    Returns:
        Return value description
        
    Raises:
        ErrorType: Error condition description
        
    Example:
        >>> result = function_name(value)
        >>> print(result)
    """
```

#### Solidity
```solidity
/**
 * @title Contract Title
 * @dev Contract description
 * @notice User-facing description
 * @author Author name
 * @version Version number
 */

/**
 * @dev Function description
 * @param paramName Parameter description
 * @return returnName Return value description
 * @notice User-facing function description
 */
```

### 2. API Documentation Standards

#### OpenAPI/Swagger Specification
```yaml
openapi: 3.0.0
info:
  title: SmartChain Hub API
  description: AI-powered blockchain transaction optimization platform
  version: 1.0.0
  contact:
    name: SmartChain Hub Team
    email: support@smartchainhub.io
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.smartchainhub.io/v1
    description: Production server
  - url: http://localhost:3001/v1
    description: Development server

paths:
  /transactions/optimize:
    post:
      summary: Optimize transaction parameters
      description: |
        Uses AI analysis to optimize blockchain transaction parameters
        for reduced gas costs and improved success rates.
      tags:
        - Transactions
      security:
        - ApiKeyAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TransactionParams'
            example:
              to: "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87"
              value: "1000000000000000000"
              gasLimit: 21000
              gasPrice: "20000000000"
      responses:
        '200':
          description: Optimization successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OptimizationResult'
        '400':
          description: Invalid request parameters
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '401':
          description: Unauthorized
        '500':
          description: Internal server error

components:
  schemas:
    TransactionParams:
      type: object
      required:
        - to
        - value
        - gasLimit
      properties:
        to:
          type: string
          pattern: '^0x[a-fA-F0-9]{40}$'
          description: Recipient Ethereum address
        value:
          type: string
          pattern: '^[0-9]+$'
          description: Transaction value in wei
        gasLimit:
          type: integer
          minimum: 21000
          maximum: 10000000
          description: Gas limit for transaction
        gasPrice:
          type: string
          pattern: '^[0-9]+$'
          description: Gas price in wei (optional)
```

### 3. README Standards

Each module should have a comprehensive README.md:

```markdown
# Module Name

Brief description of the module's purpose and functionality.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.12+
- Git

### Installation
```bash
npm install
# or
pip install -r requirements.txt
```

### Configuration
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Usage
```bash
npm start
# or
python app.py
```

## 📖 Documentation

- [API Documentation](./docs/api.md)
- [Configuration Guide](./docs/configuration.md)
- [Deployment Guide](./docs/deployment.md)

## 🧪 Testing

```bash
npm test
# or
pytest
```

## 🤝 Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file.
```

---

## 🔧 Development Standards

### 1. Code Style Guidelines

#### TypeScript/JavaScript (ESLint + Prettier)
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

#### Python (Black + Flake8)
```ini
[flake8]
max-line-length = 88
extend-ignore = E203, W503
exclude = .git,__pycache__,docs/source/conf.py,old,build,dist

[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
```

#### Solidity (Solhint)
```json
{
  "extends": "solhint:recommended",
  "rules": {
    "compiler-version": ["error", "^0.8.0"],
    "func-visibility": ["warn", {"ignoreConstructors": true}],
    "max-line-length": ["error", 120],
    "not-rely-on-time": "off"
  }
}
```

### 2. Git Workflow

#### Commit Message Format
```
type(scope): subject

body

footer
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling changes

**Example:**
```
feat(frontend): add wallet connection with manual address entry

- Implement MetaMask integration with auto-detection
- Add manual address entry as fallback option
- Include proper validation and error handling
- Update Web3Context with improved connection logic

Closes #123
```

### 3. Testing Standards

#### Unit Test Coverage Requirements
- **Minimum Coverage:** 80%
- **Critical Functions:** 100%
- **Integration Tests:** Required for all API endpoints
- **E2E Tests:** Required for user workflows

#### Test Structure
```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should handle normal case', () => {
      // Arrange
      const input = createTestInput();
      
      // Act
      const result = component.methodName(input);
      
      // Assert
      expect(result).toBe(expectedValue);
    });
    
    it('should handle error case', () => {
      // Test error scenarios
    });
    
    it('should handle edge case', () => {
      // Test edge cases
    });
  });
});
```

---

## 📊 Quality Metrics

### Code Quality Targets
- **Maintainability Index:** >70
- **Cyclomatic Complexity:** <10 per function
- **Code Duplication:** <3%
- **Technical Debt Ratio:** <5%

### Performance Targets
- **API Response Time:** <200ms (95th percentile)
- **Frontend Load Time:** <2s (First Contentful Paint)
- **AI Model Inference:** <500ms
- **Database Query Time:** <50ms

### Security Requirements
- **OWASP Top 10:** All vulnerabilities addressed
- **Dependency Vulnerabilities:** Zero high/critical
- **Code Scanning:** Clean security scan results
- **Penetration Testing:** Annual third-party assessment

---

This comprehensive documentation structure ensures professional-grade code quality and maintainability following SonarQube standards and industry best practices.