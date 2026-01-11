// Find the weekly plan for Ahmed_Ashraf_Sales_001
fetch('/api/WeeklyPlan?page=1&pageSize=50', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
})
.then(response => response.json())
.then(data => {
    console.log('=== All Weekly Plans for Ahmed_Ashraf_Sales_001 ===\n');
    
    if (data && data.success && data.data && data.data.data) {
        const plans = data.data.data.filter(p => p.employeeId === 'Ahmed_Ashraf_Sales_001');
        
        if (plans.length === 0) {
            console.log('No plans found for Ahmed_Ashraf_Sales_001');
        } else {
            plans.forEach(plan => {
                console.log(`Plan ID: ${plan.id}`);
                console.log(`Title: ${plan.title}`);
                console.log(`Week: ${plan.weekStartDate} to ${plan.weekEndDate}`);
                console.log(`Total Tasks: ${plan.totalTasks}`);
                console.log(`Completed Tasks: ${plan.completedTasks}`);
                console.log(`Completion %: ${plan.completionPercentage}%`);
                
                if (plan.tasks && plan.tasks.length > 0) {
                    console.log('Tasks:');
                    plan.tasks.forEach(task => {
                        console.log(`  - Task ${task.id}: ${task.title}`);
                        console.log(`    isCompleted: ${task.isCompleted}`);
                        console.log(`    status: ${task.status}`);
                        console.log(`    progressCount: ${task.progressCount}`);
                        console.log(`    progresses length: ${task.progresses?.length || 0}`);
                    });
                }
                console.log('---');
            });
        }
    }
})
.catch(error => console.error('Error:', error));
