// Role Configuration Utilities
export class RoleConfigUtils {
	static getRoleConfig(role: string) {
		const roleConfigs: Record<string, any> = {
			'sales-support': {
				requirements: {
					autoDepartmentId: 1, // Sales department
				},
				fields: [
					'supportLevel',
					'supportSpecialization',
					'notes',
				],
			},
			'sales-manager': {
				requirements: {
					autoDepartmentId: 1,
				},
				fields: [
					'territory',
					'teamSize',
					'salesTarget',
				],
			},
			salesman: {
				requirements: {
					autoDepartmentId: 1,
				},
				fields: [
					'territory',
					'salesTarget',
					'commissionRate',
				],
			},
		};

		return (
			roleConfigs[role] || {
				requirements: {
					autoDepartmentId: 1,
				},
				fields: [],
			}
		);
	}

	static getRequiredFields(role: string): string[] {
		const config = this.getRoleConfig(role);
		return config.fields || [];
	}

	static getAutoDepartmentId(role: string): number {
		const config = this.getRoleConfig(role);
		return config.requirements?.autoDepartmentId || 1;
	}

	static getApiEndpoint(role: string): string {
		const roleEndpoints: Record<string, string> = {
			'sales-support': '/api/users/sales-support',
			'sales-manager': '/api/users/sales-manager',
			salesman: '/api/users/salesman',
		};
		return roleEndpoints[role] || '/api/users';
	}

	static getAllRoles(): string[] {
		return ['sales-support', 'sales-manager', 'salesman'];
	}
}
