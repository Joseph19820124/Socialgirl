import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GenericResizableTable from '../../components/GenericResizableTable';

// Mock dependencies
vi.mock('../../hooks/useColumnResize', () => ({
    useColumnResize: () => ({
        columnWidths: {},
        resizedColumns: new Set(),
        tableRef: { current: null },
        handleMouseDown: vi.fn()
    })
}));

vi.mock('../../utils/formatters', () => ({
    formatNumber: (num) => num?.toLocaleString() || '0',
    getStatClass: (value, type) => value > 1000 ? 'high' : 'low'
}));

vi.mock('../../utils/sortPersistence', () => ({
    getStoredSortConfig: vi.fn(),
    storeSortConfig: vi.fn(),
    getStoredPageSize: vi.fn(),
    storePageSize: vi.fn()
}));

vi.mock('../../components/Pagination', () => ({
    default: ({ currentPage, totalItems, itemsPerPage, onPageChange, onItemsPerPageChange }) => (
        <div data-testid="pagination">
            <span>Page {currentPage} of {Math.ceil(totalItems / itemsPerPage)}</span>
            <button onClick={() => onPageChange(currentPage + 1)}>Next</button>
            <button onClick={() => onItemsPerPageChange(20)}>20 per page</button>
        </div>
    )
}));

vi.mock('../../components/DataVisualization', () => ({
    ProgressBar: ({ value }) => <div data-testid="progress-bar">{value}%</div>,
    StatBadge: ({ value }) => <div data-testid="stat-badge">{value}</div>,
    PerformanceRing: ({ value }) => <div data-testid="performance-ring">{value}</div>
}));

vi.mock('../../components/AuroraTooltip', () => ({
    default: ({ children, content }) => <div title={content}>{children}</div>
}));

describe('GenericResizableTable', () => {
    const mockColumns = [
        { key: 'username', label: 'Username' },
        { key: 'followers', label: 'Followers' },
        { key: 'likes', label: 'Likes' }
    ];

    const mockData = [
        { username: 'user1', followers: 1000, likes: 500 },
        { username: 'user2', followers: 2000, likes: 1000 },
        { username: 'user3', followers: 150000, likes: 75000 }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render loading state with skeletons', () => {
        render(
            <GenericResizableTable
                data={[]}
                isLoading={true}
                columns={mockColumns}
                tableId="test-table"
            />
        );

        // Should show skeleton elements
        const skeletons = document.querySelectorAll('.skeleton');
        expect(skeletons.length).toBeGreaterThan(0);
        
        // Should show column headers even when loading
        expect(screen.getByText('Username')).toBeInTheDocument();
        expect(screen.getByText('Followers')).toBeInTheDocument();
        expect(screen.getByText('Likes')).toBeInTheDocument();
    });

    it('should render data correctly', () => {
        render(
            <GenericResizableTable
                data={mockData}
                isLoading={false}
                columns={mockColumns}
                tableId="test-table"
            />
        );

        // Check if usernames are rendered
        expect(screen.getByText('user1')).toBeInTheDocument();
        expect(screen.getByText('user2')).toBeInTheDocument();
        expect(screen.getByText('user3')).toBeInTheDocument();

        // Check if numbers are formatted (use getAllByText for multiple matches)
        const thousandElements = screen.getAllByText('1,000');
        expect(thousandElements.length).toBeGreaterThan(0);
        expect(screen.getByText('2,000')).toBeInTheDocument();
    });

    it('should handle sorting when column header is clicked', async () => {
        const { rerender } = render(
            <GenericResizableTable
                data={mockData}
                isLoading={false}
                columns={mockColumns}
                tableId="test-table"
            />
        );

        // Click on followers column to sort
        const followersHeader = screen.getByText('Followers');
        fireEvent.click(followersHeader);

        // Wait for sorting to complete
        await waitFor(() => {
            const rows = screen.getAllByRole('row');
            // First row should be header, second row should have user1 (lowest followers)
            expect(rows[1]).toHaveTextContent('user1');
        });
    });

    it('should disable sorting for non-sortable columns', () => {
        const columnsWithNonSortable = [
            ...mockColumns,
            { key: 'actions', label: 'Actions', sortable: false }
        ];

        render(
            <GenericResizableTable
                data={mockData}
                isLoading={false}
                columns={columnsWithNonSortable}
                tableId="test-table"
            />
        );

        const actionsHeader = screen.getByText('Actions');
        expect(actionsHeader).toHaveStyle({ cursor: 'default' });
    });

    it('should handle row selection', () => {
        const onSelectionChange = vi.fn();
        
        render(
            <GenericResizableTable
                data={mockData}
                isLoading={false}
                columns={mockColumns}
                tableId="test-table"
                onSelectionChange={onSelectionChange}
            />
        );

        // Click on first data row
        const rows = screen.getAllByRole('row');
        fireEvent.click(rows[1]); // First data row (after header)

        expect(onSelectionChange).toHaveBeenCalledWith([mockData[0]]);

        // Click again to deselect
        fireEvent.click(rows[1]);
        expect(onSelectionChange).toHaveBeenCalledWith([]);
    });

    it('should render custom cell renderers', () => {
        const customRenderers = {
            username: (value) => <span data-testid="custom-username">{value.toUpperCase()}</span>
        };

        render(
            <GenericResizableTable
                data={mockData}
                isLoading={false}
                columns={mockColumns}
                cellRenderers={customRenderers}
                tableId="test-table"
            />
        );

        const customUsernames = screen.getAllByTestId('custom-username');
        expect(customUsernames[0]).toHaveTextContent('USER1');
        expect(customUsernames[1]).toHaveTextContent('USER2');
        expect(customUsernames[2]).toHaveTextContent('USER3');
    });

    it('should handle pagination', () => {
        render(
            <GenericResizableTable
                data={mockData}
                isLoading={false}
                columns={mockColumns}
                tableId="test-table"
            />
        );

        expect(screen.getByTestId('pagination')).toBeInTheDocument();
        expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
    });

    it('should render special cell types correctly', () => {
        const specialData = [{
            username: 'testuser',
            followers: 150000, // High follower count - should show StatBadge
            performance: 75, // Should show ProgressBar
            avgPerformance: 8, // Should show PerformanceRing
            url: 'https://example.com'
        }];

        const specialColumns = [
            { key: 'username', label: 'Username' },
            { key: 'followers', label: 'Followers' },
            { key: 'performance', label: 'Performance' },
            { key: 'avgPerformance', label: 'Avg Performance' },
            { key: 'url', label: 'Link' }
        ];

        render(
            <GenericResizableTable
                data={specialData}
                isLoading={false}
                columns={specialColumns}
                tableId="test-table"
            />
        );

        // Check special renderings
        expect(screen.getByTestId('stat-badge')).toBeInTheDocument();
        expect(screen.getByTestId('progress-bar')).toHaveTextContent('75%');
        expect(screen.getByTestId('performance-ring')).toHaveTextContent('8');
        expect(screen.getByText('Watch')).toHaveAttribute('href', 'https://example.com');
    });

    it('should handle empty data gracefully', () => {
        render(
            <GenericResizableTable
                data={[]}
                isLoading={false}
                columns={mockColumns}
                tableId="test-table"
            />
        );

        // Should still render headers
        expect(screen.getByText('Username')).toBeInTheDocument();
        
        // Should show pagination with 0 items
        expect(screen.getByText('Page 1 of 0')).toBeInTheDocument();
    });

    it('should determine correct button text based on table type', () => {
        // Test "Visit" button for user tables (has 'about' column)
        const userColumns = [
            { key: 'username', label: 'Username' },
            { key: 'about', label: 'About' },
            { key: 'url', label: 'Link' }
        ];
        
        const { rerender } = render(
            <GenericResizableTable
                data={[{ username: 'test', about: 'Bio', url: 'https://example.com' }]}
                isLoading={false}
                columns={userColumns}
                tableId="test-table"
            />
        );
        
        expect(screen.getByText('Visit')).toBeInTheDocument();
        
        // Test "Profile" button for tables with videoCount
        const profileColumns = [
            { key: 'username', label: 'Username' },
            { key: 'videoCount', label: 'Videos' },
            { key: 'url', label: 'Link' }
        ];
        
        rerender(
            <GenericResizableTable
                data={[{ username: 'test', videoCount: 10, url: 'https://example.com' }]}
                isLoading={false}
                columns={profileColumns}
                tableId="test-table"
            />
        );
        
        expect(screen.getByText('Profile')).toBeInTheDocument();
    });
});