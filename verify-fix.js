// Test if the fix worked
fetch('/api/WeeklyPlan?page=1&pageSize=20', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
})
.then(response => response.json())
.then(data => {
    // Find the weekly plan for Jan 10-16, 2026
    const plan = data.data.data.find(p => 
        p.weekStartDate === '2026-01-10' && 
        p.weekEndDate === '2026-01-16'
    );
    
    if (plan) {
        console.log('=== Weekly Plan Found ===');
        console.log(`Plan ID: ${plan.id}`);
        console.log(`Title: ${plan.title}`);
        console.log(`Total Tasks: ${plan.totalTasks}`);
        console.log(`Completed Tasks: ${plan.completedTasks}`);
        console.log(`Completion %: ${plan.completionPercentage}%`);
        
        if (plan.tasks && plan.tasks.length > 0) {
            const task = plan.tasks[0];
            console.log('\n=== Task Details ===');
            console.log(`Task ID: ${task.id}`);
            console.log(`Title: ${task.title}`);
            console.log(`isCompleted: ${task.isCompleted}`);
            console.log(`status: ${task.status}`);
        }
    } else {
        console.log('Plan not found');
    }
})
.catch(error => console.error('Error:', error));
