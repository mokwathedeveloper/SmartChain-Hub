#!/bin/bash

# Update Frontend Environment for Production AI Agent URL

echo "🔧 Updating Frontend Environment"
echo "================================"

# Check if .env.local exists
if [ ! -f "smartchain_hub_frontend/.env.local" ]; then
    echo "❌ Error: .env.local not found in smartchain_hub_frontend/"
    echo "Copy .env.local.example to .env.local first"
    exit 1
fi

# Get current AI agent URL
current_url=$(grep "NEXT_PUBLIC_AI_AGENT_URL" smartchain_hub_frontend/.env.local | cut -d'=' -f2)
echo "Current AI Agent URL: $current_url"

# Prompt for new URL
read -p "Enter new AI Agent URL (or press Enter to keep current): " new_url

if [ ! -z "$new_url" ]; then
    # Update the URL in .env.local
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|NEXT_PUBLIC_AI_AGENT_URL=.*|NEXT_PUBLIC_AI_AGENT_URL=$new_url|" smartchain_hub_frontend/.env.local
    else
        # Linux
        sed -i "s|NEXT_PUBLIC_AI_AGENT_URL=.*|NEXT_PUBLIC_AI_AGENT_URL=$new_url|" smartchain_hub_frontend/.env.local
    fi
    
    echo "✅ Updated AI Agent URL to: $new_url"
    
    # Test the new URL
    echo "🧪 Testing new AI Agent URL..."
    response=$(curl -s "$new_url/health" || echo "failed")
    
    if [[ $response == *"healthy"* ]]; then
        echo "✅ AI Agent is responding correctly"
    else
        echo "⚠️  Warning: AI Agent health check failed"
        echo "Response: $response"
    fi
    
    echo ""
    echo "🚀 Next steps:"
    echo "1. Commit and push changes to trigger Vercel redeploy"
    echo "2. Test the full application"
    
    read -p "Commit and push changes now? (y/n): " commit_choice
    if [[ $commit_choice == "y" || $commit_choice == "Y" ]]; then
        git add smartchain_hub_frontend/.env.local
        git commit -m "update: AI agent URL for production deployment"
        git push origin master
        echo "✅ Changes pushed to GitHub - Vercel will auto-deploy"
    fi
else
    echo "No changes made."
fi