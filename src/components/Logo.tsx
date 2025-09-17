import logoImage from '@/assets/Logo.png';
import { Link } from 'react-router-dom';

const Logo = () => {
    return (
        <>
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
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

            </Link>
        </>
    )
}

export default Logo
