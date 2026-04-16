import React from 'react';

const Template = () => {
    return (
        <div>
            {/* Other content */}
            <InputField {...{ name: 'name', label: 'Item', required: true }} />
            {/* Other content */}
        </div>
    );
};

export default Template;