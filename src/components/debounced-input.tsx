import React, { memo, useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';

interface DebouncedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    value: string | number;
    onChange: (value: string | number) => void;
    debounce?: number;
}

const DebouncedInput: React.FC<DebouncedInputProps> = ({
    value: initialValue,
    onChange,
    debounce = 500,
    className,
    ...props
}) => {
    const [value, setValue] = useState(initialValue);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Sync state only when initialValue changes from parent
    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            onChange(newValue);
        }, debounce);
    };

    return (
        <Input
            {...props}
            value={value}
            onChange={handleChange}
            className={className}
        />
    );
};

export default memo(DebouncedInput);

