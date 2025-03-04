import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <Link to="/" className={`flex items-center ${className}`}>
      <div className="flex items-center">
        <div className="bg-indigo-600 text-white p-2 rounded-md mr-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="3" x2="9" y2="21"></line>
          </svg>
        </div>
        <span className="text-xl font-bold text-indigo-900">Cardify Lingo</span>
      </div>
    </Link>
  );
}

export default Logo; 