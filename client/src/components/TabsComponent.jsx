import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookIcon from '@mui/icons-material/Book';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
 // adjust if needed

const FooterTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const tabs = [
    { label: 'Wishlist', icon: <FavoriteIcon />, path: `/wishlist/${user?.id}` },
    // { label: 'Bookings', icon: <BookIcon />, path: `/bookings/${user?.id}` },
    { label: 'Reviews', icon: <RateReviewIcon />, path: `/reviews/${user?.id}` },
    // { label: 'Account', icon: <AccountCircleIcon />, path: `/account/${user?.id}` },
  ];

  const getCurrentTab = () => {
    return tabs.findIndex(tab => location.pathname.startsWith(tab.path.split('/:')[0]));
  };

  const [value, setValue] = useState(getCurrentTab());

  useEffect(() => {
    setValue(getCurrentTab());
  }, [location.pathname]);

  const handleChange = (event, newValue) => {
    if (tabs[newValue]?.path) {
      navigate(tabs[newValue].path);
      setValue(newValue);
    }
  };
  console.log("Current user ID:", user?.id);
    console.log("Tabs config:", tabs);

  
  if (!user) return null; // don’t show if user not logged in

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        borderTop: '1px solid #ccc',
      }}
      elevation={3}
    >
      <BottomNavigation value={value} onChange={handleChange}>
        {tabs.map((tab, index) => (
          <BottomNavigationAction
            key={index}
            label={tab.label}
            icon={tab.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default FooterTabs;
