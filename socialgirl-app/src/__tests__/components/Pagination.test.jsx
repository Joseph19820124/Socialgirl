import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '../../components/Pagination';

describe('Pagination', () => {
    const defaultProps = {
        currentPage: 1,
        totalItems: 100,
        itemsPerPage: 15,
        onPageChange: vi.fn()
    };

    it('should render pagination controls when more than one page', () => {
        render(<Pagination {...defaultProps} />);

        expect(screen.getByText('‹ Prev')).toBeInTheDocument();
        expect(screen.getByText('Next ›')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('Showing 1-15 of 100')).toBeInTheDocument();
    });

    it('should not render when only one page and no page size selector', () => {
        const { container } = render(
            <Pagination 
                currentPage={1}
                totalItems={10}
                itemsPerPage={15}
                onPageChange={vi.fn()}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it('should render when one page but page size selector is provided', () => {
        render(
            <Pagination 
                currentPage={1}
                totalItems={10}
                itemsPerPage={15}
                onPageChange={vi.fn()}
                onItemsPerPageChange={vi.fn()}
            />
        );

        expect(screen.getByText('Show:')).toBeInTheDocument();
        expect(screen.getByText('per page')).toBeInTheDocument();
    });

    it('should handle page changes', () => {
        const onPageChange = vi.fn();
        render(<Pagination {...defaultProps} onPageChange={onPageChange} />);

        // Click next
        fireEvent.click(screen.getByText('Next ›'));
        expect(onPageChange).toHaveBeenCalledWith(2);

        // Click page number
        fireEvent.click(screen.getByText('3'));
        expect(onPageChange).toHaveBeenCalledWith(3);
    });

    it('should handle previous button click', () => {
        const onPageChange = vi.fn();
        render(
            <Pagination 
                {...defaultProps} 
                currentPage={3}
                onPageChange={onPageChange} 
            />
        );

        fireEvent.click(screen.getByText('‹ Prev'));
        expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('should disable prev button on first page', () => {
        render(<Pagination {...defaultProps} currentPage={1} />);

        const prevButton = screen.getByText('‹ Prev');
        expect(prevButton).toBeDisabled();
    });

    it('should disable next button on last page', () => {
        render(
            <Pagination 
                {...defaultProps} 
                currentPage={7} // 100 items / 15 per page = 7 pages
            />
        );

        const nextButton = screen.getByText('Next ›');
        expect(nextButton).toBeDisabled();
    });

    it('should render page size selector when onItemsPerPageChange provided', () => {
        const onItemsPerPageChange = vi.fn();
        render(
            <Pagination 
                {...defaultProps} 
                onItemsPerPageChange={onItemsPerPageChange}
            />
        );

        const select = screen.getByLabelText('Show:');
        expect(select).toBeInTheDocument();
        expect(select).toHaveValue('15');

        // Change page size
        fireEvent.change(select, { target: { value: '25' } });
        expect(onItemsPerPageChange).toHaveBeenCalledWith(25);
    });

    it('should use custom page size options', () => {
        render(
            <Pagination 
                {...defaultProps} 
                onItemsPerPageChange={vi.fn()}
                pageSizeOptions={[10, 20, 30]}
            />
        );

        const select = screen.getByLabelText('Show:');
        const options = screen.getAllByRole('option');
        
        expect(options).toHaveLength(3);
        expect(options[0]).toHaveTextContent('10');
        expect(options[1]).toHaveTextContent('20');
        expect(options[2]).toHaveTextContent('30');
    });

    it('should show correct page numbers for middle pages', () => {
        render(
            <Pagination 
                currentPage={5}
                totalItems={200}
                itemsPerPage={10}
                onPageChange={vi.fn()}
            />
        );

        // Should show pages 3, 4, 5, 6, 7 (5 pages centered on current)
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('4')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('6')).toBeInTheDocument();
        expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('should show correct page numbers near start', () => {
        render(
            <Pagination 
                currentPage={2}
                totalItems={200}
                itemsPerPage={10}
                onPageChange={vi.fn()}
            />
        );

        // Should show pages 1, 2, 3, 4, 5
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('4')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should show correct page numbers near end', () => {
        render(
            <Pagination 
                currentPage={19}
                totalItems={200}
                itemsPerPage={10}
                onPageChange={vi.fn()}
            />
        );

        // Should show pages 16, 17, 18, 19, 20
        expect(screen.getByText('16')).toBeInTheDocument();
        expect(screen.getByText('17')).toBeInTheDocument();
        expect(screen.getByText('18')).toBeInTheDocument();
        expect(screen.getByText('19')).toBeInTheDocument();
        expect(screen.getByText('20')).toBeInTheDocument();
    });

    it('should highlight current page', () => {
        render(
            <Pagination 
                currentPage={3}
                totalItems={100}
                itemsPerPage={10}
                onPageChange={vi.fn()}
            />
        );

        const currentPageButton = screen.getByText('3');
        expect(currentPageButton).toHaveClass('aurora-btn-primary');
        
        const otherPageButton = screen.getByText('2');
        expect(otherPageButton).toHaveClass('aurora-btn-subtle');
    });

    it('should show correct item range', () => {
        render(
            <Pagination 
                currentPage={3}
                totalItems={45}
                itemsPerPage={15}
                onPageChange={vi.fn()}
            />
        );

        expect(screen.getByText('Showing 31-45 of 45')).toBeInTheDocument();
    });

    it('should handle empty data', () => {
        render(
            <Pagination 
                currentPage={1}
                totalItems={0}
                itemsPerPage={15}
                onPageChange={vi.fn()}
                onItemsPerPageChange={vi.fn()}
            />
        );

        // Should still show page size selector
        expect(screen.getByText('Show:')).toBeInTheDocument();
        // But no pagination controls or info
        expect(screen.queryByText('‹ Prev')).not.toBeInTheDocument();
        expect(screen.queryByText('Showing')).not.toBeInTheDocument();
    });
});