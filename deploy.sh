#!/bin/bash

# SmartChain Hub - Production Deployment Script
# This script automates the deployment of AI agent to cloud platforms

set -e

echo "🚀 SmartChain Hub - Production Deployment"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "ai-agent" ]; then
    echo "❌ Error: Run this script from the SmartChain-Hub root directory"
    exit 1
fi

# Function to deploy to Render
deploy_render() {
    echo "📦 Deploying AI Agent to Render..."
    echo "1. Push code to GitHub:"
    git add .
    git commit -m "deploy: AI agent production deployment" || echo "No changes to commit"
    git push origin master
    
    echo "2. Manual steps required:"
    echo "   - Go to https://render.com"
    echo "   - Connect your GitHub repository"
    echo "   - Select 'ai-agent/' as root directory"
    echo "   - Set environment variables:"
    echo "     OG_COMPUTE_PRIVATE_KEY=your_private_key"
    echo "     OG_COMPUTE_BROKER_URL=https://broker.0g.ai"
    echo "     OG_COMPUTE_MODEL=llama-3.1-8b-instruct"
    echo "     OG_COMPUTE_RPC=https://evmrpc-testnet.0g.ai"
    echo ""
    echo "✅ After deployment, update NEXT_PUBLIC_AI_AGENT_URL in .env.local"
}

# Function to deploy to Railway
deploy_railway() {
    echo "🚂 Deploying AI Agent to Railway..."
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        echo "Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    cd ai-agent/
    
    echo "Logging into Railway..."
    railway login
    
    echo "Deploying to Railway..."
    railway up
    
    echo "Setting environment variables..."
    read -p "Enter your OG_COMPUTE_PRIVATE_KEY: " private_key
    railway variables set OG_COMPUTE_PRIVATE_KEY="$private_key"
    railway variables set OG_COMPUTE_BROKER_URL="https://broker.0g.ai"
    railway variables set OG_COMPUTE_MODEL="llama-3.1-8b-instruct"
    railway variables set OG_COMPUTE_RPC="https://evmrpc-testnet.0g.ai"
    
    echo "Getting deployment URL..."
    railway_url=$(railway status --json | jq -r '.deployments[0].url')
    echo "✅ AI Agent deployed to: $railway_url"
    
    cd ..
    echo "Update your .env.local with: NEXT_PUBLIC_AI_AGENT_URL=$railway_url"
}

# Function to deploy to Fly.io
deploy_fly() {
    echo "🪰 Deploying AI Agent to Fly.io..."
    
    # Check if Fly CLI is installed
    if ! command -v fly &> /dev/null; then
        echo "Installing Fly CLI..."
        curl -L https://fly.io/install.sh | sh
    fi
    
    cd ai-agent/
    
    echo "Logging into Fly.io..."
    fly auth login
    
    echo "Launching app..."
    fly launch --no-deploy
    
    echo "Setting secrets..."
    read -p "Enter your OG_COMPUTE_PRIVATE_KEY: " private_key
    fly secrets set OG_COMPUTE_PRIVATE_KEY="$private_key"
    
    echo "Deploying..."
    fly deploy
    
    echo "Getting deployment URL..."
    fly_url="https://$(fly info --json | jq -r '.Hostname')"
    echo "✅ AI Agent deployed to: $fly_url"
    
    cd ..
    echo "Update your .env.local with: NEXT_PUBLIC_AI_AGENT_URL=$fly_url"
}

# Function to test deployment
test_deployment() {
    echo "🧪 Testing AI Agent deployment..."
    
    if [ -z "$1" ]; then
        read -p "Enter your AI Agent URL: " agent_url
    else
        agent_url="$1"
    fi
    
    echo "Testing health endpoint..."
    health_response=$(curl -s "$agent_url/health" || echo "failed")
    
    if [[ $health_response == *"healthy"* ]]; then
        echo "✅ Health check passed"
    else
        echo "❌ Health check failed: $health_response"
        return 1
    fi
    
    echo "Testing optimization endpoint..."
    opt_response=$(curl -s -X POST "$agent_url/optimize" \
        -H "Content-Type: application/json" \
        -d '{"amount": 1000, "priority": "efficiency"}' || echo "failed")
    
    if [[ $opt_response == *"fee"* ]]; then
        echo "✅ Optimization endpoint working"
        echo "Response: $opt_response"
    else
        echo "❌ Optimization endpoint failed: $opt_response"
        return 1
    fi
    
    echo "🎉 All tests passed! AI Agent is ready for production."
}

# Main menu
echo "Choose deployment platform:"
echo "1) Render (Recommended - Free tier available)"
echo "2) Railway (Easy CLI deployment)"
echo "3) Fly.io (Global edge deployment)"
echo "4) Test existing deployment"
echo "5) Exit"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        deploy_render
        ;;
    2)
        deploy_railway
        ;;
    3)
        deploy_fly
        ;;
    4)
        test_deployment
        ;;
    5)
        echo "Deployment cancelled."
        exit 0
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "🎯 Next Steps:"
echo "1. Update NEXT_PUBLIC_AI_AGENT_URL in smartchain_hub_frontend/.env.local"
echo "2. Redeploy frontend to Vercel (auto-deploys from GitHub)"
echo "3. Test the full application at https://smartchainhubfrontend.vercel.app"
echo ""
echo "✅ Deployment complete!"