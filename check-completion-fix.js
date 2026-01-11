// Test script to check if the API is now returning correct completion data
fetch('/api/WeeklyPlan?page=1&pageSize=20', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
})
.then(response => response.json())
.then(data => {
    console.log('=== Checking if API now returns correct completion data ===\n');
    
    if (data && data.success && data.data && data.data.data) {
        const plans = data.data.data;
        
        plans.forEach(plan => {
            console.log(`Plan ${plan.id}: ${plan.title}`);
            console.log(`  Total Tasks: ${plan.totalTasks}`);
            console.log(`  Completed Tasks: ${plan.completedTasks}`);
            console.log(`  Completion %: ${plan.completionPercentage}%`);
            
            if (plan.tasks && plan.tasks.length > 0) {
                console.log('  Tasks:');
                plan.tasks.forEach(task => {
                    console.log(`    - Task ${task.id}: ${task.title} (Completed: ${task.isCompleted}, Status: ${task.status})`);
                });
                
                // Verify calculation
                const actualCompleted = plan.tasks.filter(t => t.isCompleted).length;
                const expectedPercentage = plan.tasks.length > 0 ? (actualCompleted / plan.tasks.length) * 100 : 0;
                
                console.log(`  Verification:`);
                console.log(`    Actual completed tasks: ${actualCompleted}`);
                console.log(`    Expected percentage: ${expectedPercentage}%`);
                console.log(`    API percentage matches: ${plan.completionPercentage === expectedPercentage ? '✓' : '✗'}`);
            }
            console.log('---');
        });
    }
})
.catch(error => console.error('Error:', error));
