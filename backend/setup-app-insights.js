/**
 * Application Insights Setup Script
 * 
 * This script helps you understand and setup Application Insights
 * for production monitoring of your Roastify application.
 */

console.log('📊 Application Insights Setup Guide\n');
console.log('='.repeat(60));

console.log('\n🎯 What Application Insights Does:\n');
console.log('1. ✅ Monitors application performance in real-time');
console.log('2. ✅ Tracks all HTTP requests and response times');
console.log('3. ✅ Captures exceptions and errors automatically');
console.log('4. ✅ Monitors database queries and external API calls');
console.log('5. ✅ Provides live metrics dashboard');
console.log('6. ✅ Analyzes user behavior and usage patterns');
console.log('7. ✅ Alerts you when issues occur');
console.log('8. ✅ Helps identify performance bottlenecks');

console.log('\n📈 What You Can Monitor:\n');
console.log('Performance Metrics:');
console.log('  • Average response time per endpoint');
console.log('  • Slowest requests');
console.log('  • Database query performance');
console.log('  • Memory and CPU usage');
console.log('');
console.log('Error Tracking:');
console.log('  • Exception count and types');
console.log('  • Error rate percentage');
console.log('  • Failed requests');
console.log('  • Stack traces for debugging');
console.log('');
console.log('Usage Analytics:');
console.log('  • Active users count');
console.log('  • Most used features');
console.log('  • User sessions');
console.log('  • Geographic distribution');
console.log('');
console.log('Dependencies:');
console.log('  • Azure SQL Database calls');
console.log('  • Email service (Azure Communication)');
console.log('  • External API calls');
console.log('  • Response times for each');

console.log('\n🔧 How It Works:\n');
console.log('1. Application Insights SDK is installed in your app');
console.log('2. It automatically collects telemetry data');
console.log('3. Data is sent to Azure Application Insights');
console.log('4. You view insights in Azure Portal dashboard');
console.log('5. Set up alerts for critical issues');

console.log('\n📦 What\'s Already Installed:\n');
console.log('✅ Package: applicationinsights (installed)');
console.log('✅ Code: Added to backend/src/server.js');
console.log('✅ Configuration: Auto-initializes in production');
console.log('✅ Features: All monitoring enabled');

console.log('\n⚙️ Configuration in Your Code:\n');
console.log('Location: backend/src/server.js (lines 3-17)');
console.log('');
console.log('if (process.env.NODE_ENV === \'production\') {');
console.log('  const appInsights = require(\'applicationinsights\');');
console.log('  appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)');
console.log('    .setAutoDependencyCorrelation(true)      // Track dependencies');
console.log('    .setAutoCollectRequests(true)            // Track HTTP requests');
console.log('    .setAutoCollectPerformance(true)         // Track performance');
console.log('    .setAutoCollectExceptions(true)          // Track exceptions');
console.log('    .setAutoCollectDependencies(true)        // Track DB/API calls');
console.log('    .setAutoCollectConsole(true)             // Track console logs');
console.log('    .setUseDiskRetryCaching(true)            // Retry failed sends');
console.log('    .setSendLiveMetrics(true)                // Enable live metrics');
console.log('    .start();');
console.log('}');

console.log('\n🚀 Setup Steps:\n');
console.log('Step 1: Create Application Insights in Azure Portal');
console.log('  • Go to: https://portal.azure.com');
console.log('  • Create Resource → Application Insights');
console.log('  • Name: roastify-insights');
console.log('  • Region: Same as your app');
console.log('  • Click Create');
console.log('');
console.log('Step 2: Get Connection String');
console.log('  • Open Application Insights resource');
console.log('  • Copy "Connection String" from Overview');
console.log('  • Format: InstrumentationKey=xxx;IngestionEndpoint=https://...');
console.log('');
console.log('Step 3: Add to App Service');
console.log('  • App Service → Configuration');
console.log('  • New application setting');
console.log('  • Name: APPLICATIONINSIGHTS_CONNECTION_STRING');
console.log('  • Value: Paste connection string');
console.log('  • Save and restart');

console.log('\n📊 View Your Insights:\n');
console.log('After setup, go to Azure Portal → Application Insights:');
console.log('');
console.log('1. Live Metrics - Real-time monitoring');
console.log('   • See requests as they happen');
console.log('   • Monitor response times');
console.log('   • Track active users');
console.log('');
console.log('2. Performance - Analyze slow operations');
console.log('   • Slowest endpoints');
console.log('   • Database query times');
console.log('   • Dependency calls');
console.log('');
console.log('3. Failures - Track errors');
console.log('   • Exception count');
console.log('   • Failed requests');
console.log('   • Stack traces');
console.log('');
console.log('4. Users - Understand usage');
console.log('   • Active users');
console.log('   • Session duration');
console.log('   • User flows');
console.log('');
console.log('5. Logs - Query telemetry');
console.log('   • Custom queries');
console.log('   • Advanced analytics');
console.log('   • Export data');

console.log('\n🔔 Setup Alerts (Recommended):\n');
console.log('Create alerts for:');
console.log('  • Error rate > 5%');
console.log('  • Response time > 2 seconds');
console.log('  • Server down (no requests for 5 minutes)');
console.log('  • Memory usage > 80%');
console.log('  • Failed dependencies');

console.log('\n💰 Cost:\n');
console.log('First 5GB per month: FREE');
console.log('Additional data: ~$2.30 per GB');
console.log('Typical small app: $0-10 per month');
console.log('Your app (estimated): $5-15 per month');

console.log('\n✅ Benefits:\n');
console.log('• Find and fix issues before users report them');
console.log('• Understand which features are most used');
console.log('• Optimize slow endpoints');
console.log('• Track error trends over time');
console.log('• Make data-driven decisions');
console.log('• Improve user experience');

console.log('\n📝 Example Queries:\n');
console.log('// Slowest requests in last 24 hours');
console.log('requests');
console.log('| where timestamp > ago(1d)');
console.log('| summarize avg(duration) by name');
console.log('| order by avg_duration desc');
console.log('| take 10');
console.log('');
console.log('// Error rate by endpoint');
console.log('requests');
console.log('| where timestamp > ago(1d)');
console.log('| summarize total=count(), errors=countif(success==false) by name');
console.log('| extend errorRate = (errors * 100.0) / total');
console.log('| order by errorRate desc');

console.log('\n🎉 Summary:\n');
console.log('Application Insights is:');
console.log('  ✅ Already installed in your code');
console.log('  ✅ Configured to auto-collect everything');
console.log('  ✅ Ready to use in production');
console.log('  ⏳ Just needs connection string from Azure');

console.log('\n📖 Full Guide: See SETUP_APP_INSIGHTS.md');
console.log('');
console.log('='.repeat(60));
console.log('🚀 Your app is ready for production monitoring!');
console.log('='.repeat(60));
console.log('');
