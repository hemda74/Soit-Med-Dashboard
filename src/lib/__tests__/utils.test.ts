import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn utility function', () => {
	it('merges class names correctly', () => {
		const result = cn('class1', 'class2');
		expect(result).toContain('class1');
		expect(result).toContain('class2');
	});

	it('handles conditional classes', () => {
		const isActive = true;
		const result = cn('base-class', isActive && 'active-class');
		expect(result).toContain('base-class');
		expect(result).toContain('active-class');
	});

	it('handles false conditional classes', () => {
		const isActive = false;
		const result = cn('base-class', isActive && 'active-class');
		expect(result).toContain('base-class');
		expect(result).not.toContain('active-class');
	});

	it('merges conflicting Tailwind classes', () => {
		const result = cn('p-4', 'p-6');
		// Should only contain the last one (p-6)
		expect(result).toContain('p-6');
		expect(result).not.toContain('p-4');
	});

	it('handles undefined and null values', () => {
		const result = cn('class1', undefined, null, 'class2');
		expect(result).toContain('class1');
		expect(result).toContain('class2');
	});

	it('handles empty strings', () => {
		const result = cn('class1', '', 'class2');
		expect(result).toContain('class1');
		expect(result).toContain('class2');
	});

	it('handles arrays of classes', () => {
		const result = cn(['class1', 'class2'], 'class3');
		expect(result).toContain('class1');
		expect(result).toContain('class2');
		expect(result).toContain('class3');
	});

	it('handles objects with boolean values', () => {
		const result = cn({
			'class1': true,
			'class2': false,
			'class3': true,
		});
		expect(result).toContain('class1');
		expect(result).not.toContain('class2');
		expect(result).toContain('class3');
	});

	it('handles complex combinations', () => {
		const isActive = true;
		const isDisabled = false;
		const result = cn(
			'base-class',
			isActive && 'active-class',
			isDisabled && 'disabled-class',
			['array-class1', 'array-class2'],
			{ 'object-class': true }
		);
		expect(result).toContain('base-class');
		expect(result).toContain('active-class');
		expect(result).not.toContain('disabled-class');
		expect(result).toContain('array-class1');
		expect(result).toContain('array-class2');
		expect(result).toContain('object-class');
	});
});




