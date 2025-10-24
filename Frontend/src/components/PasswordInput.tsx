import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

const textareaStyles = {
    "default": "w-full bg-black text-white border border-gray-800 py-3 px-4 rounded-lg placeholder-gray-600 focus:outline-none focus:border-gray-600 transition-colors"
}

interface PasswordInputProps {
    placeholder: string;
    className?: string;
}

export const PasswordInput = forwardRef(({ placeholder, className }: PasswordInputProps, ref) => {
    const [displayValue, setDisplayValue] = useState('');
    const [actualValue, setActualValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Expose the value through ref so parent components can access it
    useImperativeHandle(ref, () => ({
        get value() {
            return actualValue;
        }
    }));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        const newLength = newValue.length;
        const oldLength = actualValue.length;

        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (newLength > oldLength) {
            // Character was added
            const addedChar = newValue[newLength - 1];
            const newActual = actualValue + addedChar;
            setActualValue(newActual);

            // Show the new character briefly
            const maskedPrevious = '•'.repeat(oldLength);
            setDisplayValue(maskedPrevious + addedChar);

            // After 500ms, mask it
            timeoutRef.current = setTimeout(() => {
                setDisplayValue('•'.repeat(newLength));
            }, 500);
        } else if (newLength < oldLength) {
            // Character(s) were deleted
            const newActual = actualValue.slice(0, newLength);
            setActualValue(newActual);
            setDisplayValue('•'.repeat(newLength));
        } else {
            // Selection/cut/paste - just update everything
            setActualValue(newValue);
            setDisplayValue('•'.repeat(newLength));
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        const newActual = actualValue + pastedText;
        setActualValue(newActual);
        setDisplayValue('•'.repeat(newActual.length));
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="mb-4 mt-4">
            <input 
                ref={inputRef}
                type="text"
                value={displayValue}
                onChange={handleChange}
                onPaste={handlePaste}
                placeholder={placeholder}
                className={`${textareaStyles.default} ${className}`}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
            />
        </div>
    );
});

PasswordInput.displayName = 'PasswordInput';
