import logoImage from '@/assets/Logo.png';
import { Link } from 'react-router-dom';

interface LogoProps {
    asLink?: boolean;
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ asLink = true, className = "" }) => {
    const logoElement = (
        <div className={`flex items-center hover:opacity-80 transition-opacity ${className}`}>
            <img
                src={logoImage}
                alt="Soit Medical"
                className=""
                width={200}
                height={150}
                onError={(e) => {
                    // Fallback to text if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                }}
            />
        </div>
    );

    return asLink ? (
        <Link to="/">
            {logoElement}
        </Link>
    ) : (
        logoElement
    );
};

export default Logo;
