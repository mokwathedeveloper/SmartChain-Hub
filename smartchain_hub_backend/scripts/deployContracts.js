/**
 * Backend deploy script — calls Hardhat deploy and updates .env
 * Usage: node scripts/deployContracts.js
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const blockchainDir = path.join(__dirname, '../../blockchain');

console.log('Deploying contracts to 0G Mainnet...');
const output = execSync(`cd ${blockchainDir} && npx hardhat run scripts/deploy.js --network og_mainnet`, { encoding: 'utf8' });
console.log(output);

// Extract addresses from output and update .env
const match = output.match(/SmartChainTransaction deployed to: (0x[a-fA-F0-9]{40})/);
if (match) {
  const envPath = path.join(__dirname, '../.env');
  let env = fs.readFileSync(envPath, 'utf8');
  env = env.replace(/CONTRACT_ADDRESS=.*/, `CONTRACT_ADDRESS=${match[1]}`);
  fs.writeFileSync(envPath, env);
  console.log(`Updated .env with CONTRACT_ADDRESS=${match[1]}`);
}
