import React from 'react';

export const LoadingSpinner = ({ size = 'md', fullScreen = false }) => {
    const sizeClass = `loading-spinner__icon--${size}`;

    const spinner = (
        <div className="loading-spinner">
            <div className={`loading-spinner__icon ${sizeClass}`}></div>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="loading-spinner--full-screen">
                <div className="loading-spinner">
                    <div>
                        {spinner}
                        <p className="loading-spinner__text">Carregando...</p>
                    </div>
                </div>
            </div>
        );
    }

    return spinner;
};