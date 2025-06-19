import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../../components/SearchBar';

describe('SearchBar', () => {
    it('should render with default placeholder', () => {
        render(<SearchBar onSearch={vi.fn()} />);
        
        const input = screen.getByPlaceholderText('Search Users');
        expect(input).toBeInTheDocument();
    });

    it('should render with custom placeholder', () => {
        render(<SearchBar onSearch={vi.fn()} placeholder="Search Videos" />);
        
        const input = screen.getByPlaceholderText('Search Videos');
        expect(input).toBeInTheDocument();
    });

    it('should render search icon', () => {
        const { container } = render(<SearchBar onSearch={vi.fn()} />);
        
        const svg = container.querySelector('svg.search-icon');
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveClass('search-icon');
    });

    it('should update input value when typing', async () => {
        const user = userEvent.setup();
        render(<SearchBar onSearch={vi.fn()} />);
        
        const input = screen.getByPlaceholderText('Search Users');
        
        await user.type(input, 'test query');
        
        expect(input).toHaveValue('test query');
    });

    it('should call onSearch when form is submitted', () => {
        const onSearch = vi.fn();
        render(<SearchBar onSearch={onSearch} />);
        
        const input = screen.getByPlaceholderText('Search Users');
        const form = input.closest('form');
        
        // Type in the input
        fireEvent.change(input, { target: { value: 'search term' } });
        
        // Submit the form
        fireEvent.submit(form);
        
        expect(onSearch).toHaveBeenCalledWith('search term');
    });

    it('should call onSearch with empty string when submitted without input', () => {
        const onSearch = vi.fn();
        render(<SearchBar onSearch={onSearch} />);
        
        const form = screen.getByPlaceholderText('Search Users').closest('form');
        fireEvent.submit(form);
        
        expect(onSearch).toHaveBeenCalledWith('');
    });

    it('should prevent default form submission', () => {
        const onSearch = vi.fn();
        render(<SearchBar onSearch={onSearch} />);
        
        const form = screen.getByPlaceholderText('Search Users').closest('form');
        const event = new Event('submit', { bubbles: true, cancelable: true });
        
        form.dispatchEvent(event);
        
        expect(event.defaultPrevented).toBe(true);
    });

    it('should have proper CSS classes for styling', () => {
        const { container } = render(<SearchBar onSearch={vi.fn()} />);
        
        expect(container.querySelector('.morph-search')).toBeInTheDocument();
        expect(container.querySelector('.morph-border')).toBeInTheDocument();
    });

    it('should handle rapid input changes', async () => {
        const user = userEvent.setup();
        render(<SearchBar onSearch={vi.fn()} />);
        
        const input = screen.getByPlaceholderText('Search Users');
        
        // Rapid typing
        await user.type(input, 'abc');
        await user.clear(input);
        await user.type(input, 'xyz');
        
        expect(input).toHaveValue('xyz');
    });

    it('should maintain state between searches', () => {
        const onSearch = vi.fn();
        const { rerender } = render(<SearchBar onSearch={onSearch} />);
        
        const input = screen.getByPlaceholderText('Search Users');
        
        // First search
        fireEvent.change(input, { target: { value: 'first search' } });
        fireEvent.submit(input.closest('form'));
        
        expect(onSearch).toHaveBeenCalledWith('first search');
        expect(input).toHaveValue('first search');
        
        // Rerender component
        rerender(<SearchBar onSearch={onSearch} />);
        
        // Input should maintain its value after rerender (same component instance)
        const newInput = screen.getByPlaceholderText('Search Users');
        expect(newInput).toHaveValue('first search');
    });

    it('should handle special characters in search', () => {
        const onSearch = vi.fn();
        render(<SearchBar onSearch={onSearch} />);
        
        const input = screen.getByPlaceholderText('Search Users');
        const specialChars = '@#$%^&*()';
        
        fireEvent.change(input, { target: { value: specialChars } });
        fireEvent.submit(input.closest('form'));
        
        expect(onSearch).toHaveBeenCalledWith(specialChars);
    });
});