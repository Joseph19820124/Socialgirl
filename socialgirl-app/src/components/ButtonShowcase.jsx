import React, { useState } from 'react';
import ButtonGroup from './ButtonGroup';

const ButtonShowcase = () => {
    const [loadingBtn, setLoadingBtn] = useState(null);
    
    const handleAsyncClick = (btnId) => {
        setLoadingBtn(btnId);
        setTimeout(() => setLoadingBtn(null), 2000);
    };
    
    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <section>
                <h3 style={{ marginBottom: '16px' }}>Primary Buttons</h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button className="aurora-btn aurora-btn-primary">Primary</button>
                    <button className="aurora-btn aurora-btn-secondary">Secondary</button>
                    <button className="aurora-btn aurora-btn-success">Success</button>
                    <button className="aurora-btn aurora-btn-danger">Danger</button>
                    <button className="aurora-btn aurora-btn-surface">Surface</button>
                    <button className="aurora-btn aurora-btn-subtle">Subtle</button>
                </div>
            </section>
            
            <section>
                <h3 style={{ marginBottom: '16px' }}>Ghost Buttons</h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button className="aurora-btn aurora-btn-ghost">Ghost Primary</button>
                    <button className="aurora-btn aurora-btn-ghost-secondary">Ghost Secondary</button>
                    <button className="aurora-btn aurora-btn-ghost-danger">Ghost Danger</button>
                </div>
            </section>
            
            <section>
                <h3 style={{ marginBottom: '16px' }}>Button Sizes</h3>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button className="aurora-btn aurora-btn-primary aurora-btn-sm">Small</button>
                    <button className="aurora-btn aurora-btn-primary">Default</button>
                    <button className="aurora-btn aurora-btn-primary aurora-btn-lg">Large</button>
                </div>
            </section>
            
            <section>
                <h3 style={{ marginBottom: '16px' }}>Button States</h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button className="aurora-btn aurora-btn-primary">Normal</button>
                    <button className="aurora-btn aurora-btn-primary" disabled>Disabled</button>
                    <button 
                        className={`aurora-btn aurora-btn-primary ${loadingBtn === 'loading' ? 'loading' : ''}`}
                        onClick={() => handleAsyncClick('loading')}
                    >
                        {loadingBtn === 'loading' ? 'Loading...' : 'Click Me'}
                    </button>
                </div>
            </section>
            
            <section>
                <h3 style={{ marginBottom: '16px' }}>Icon Buttons</h3>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button className="aurora-btn aurora-btn-primary aurora-btn-icon">
                        <span>🚀</span>
                        Launch
                    </button>
                    <button className="aurora-btn aurora-btn-subtle aurora-btn-icon aurora-btn-icon-only aurora-btn-sm">
                        ⚙️
                    </button>
                    <button className="aurora-btn aurora-btn-ghost aurora-btn-icon aurora-btn-icon-only">
                        ❤️
                    </button>
                    <button className="aurora-btn aurora-btn-surface aurora-btn-icon aurora-btn-icon-only aurora-btn-lg">
                        📊
                    </button>
                </div>
            </section>
            
            <section>
                <h3 style={{ marginBottom: '16px' }}>Button Groups</h3>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    <ButtonGroup>
                        <button className="aurora-btn aurora-btn-subtle">Left</button>
                        <button className="aurora-btn aurora-btn-subtle">Center</button>
                        <button className="aurora-btn aurora-btn-subtle">Right</button>
                    </ButtonGroup>
                    
                    <ButtonGroup>
                        <button className="aurora-btn aurora-btn-primary">Save</button>
                        <button className="aurora-btn aurora-btn-ghost-danger">Cancel</button>
                    </ButtonGroup>
                </div>
            </section>
            
            <section>
                <h3 style={{ marginBottom: '16px' }}>Full Width Buttons</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
                    <button className="aurora-btn aurora-btn-primary aurora-btn-block">
                        Full Width Primary
                    </button>
                    <button className="aurora-btn aurora-btn-surface aurora-btn-block">
                        Full Width Surface
                    </button>
                </div>
            </section>
            
            <section>
                <h3 style={{ marginBottom: '16px' }}>Special Effects</h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button className="aurora-btn aurora-btn-primary aurora-btn-pulse">
                        Pulse Effect
                    </button>
                    <button className="aurora-btn aurora-btn-secondary aurora-btn-glow">
                        Glow on Hover
                    </button>
                    <button className="aurora-btn aurora-btn-success aurora-btn-lg aurora-btn-pulse">
                        Large CTA
                    </button>
                </div>
            </section>
        </div>
    );
};

export default ButtonShowcase;