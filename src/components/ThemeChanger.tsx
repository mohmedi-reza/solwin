import { useEffect, useState } from 'react';
import Icon from './icon/icon.component';

const ThemeChanger = () => {
    const [theme, setTheme] = useState<'abyss' | 'light'>('abyss');

    useEffect(() => {
        // Get initial theme from localStorage or default to 'abyss'
        const savedTheme = localStorage.getItem('theme') as 'abyss' | 'light' || 'abyss';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'abyss' ? 'light' : 'abyss';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <label className="swap swap-rotate btn btn-soft btn-circle btn-sm">
            {/* this hidden checkbox controls the state */}
            <input
                type="checkbox"
                className="theme-controller"
                checked={theme === 'light'}
                onChange={toggleTheme}
            />

            {/* sun icon */}
            <Icon className='swap-off fill-current text-xl' name="sun1" />

            {/* moon icon */}
            <Icon className='swap-on fill-current text-xl' name="moon" />
        </label>
    )
}

export default ThemeChanger;
