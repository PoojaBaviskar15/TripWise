// components/BlogFilters.jsx
import { Box, TextField, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useState } from 'react';

const categories = ['All', 'Food', 'History', 'Art', 'Festivals', 'Architecture'];
const places = ['All', 'Jaipur', 'Varanasi', 'Kerala', 'Hampi', 'Mysore'];

const BlogFilters = ({ onChange }) => {
  const [category, setCategory] = useState('All');
  const [place, setPlace] = useState('All');
  const [search, setSearch] = useState('');

  const handleChange = () => {
    onChange({
      category: category === 'All' ? '' : category,
      place: place === 'All' ? '' : place,
      search: search.trim()
    });
  };

  return (
    <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
      <FormControl sx={{ minWidth: 150 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={category}
          label="Category"
          onChange={(e) => {
            setCategory(e.target.value);
            setTimeout(handleChange, 0);
          }}
        >
          {categories.map((cat, index) => (
            <MenuItem key={index} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 150 }}>
        <InputLabel>Place</InputLabel>
        <Select
          value={place}
          label="Place"
          onChange={(e) => {
            setPlace(e.target.value);
            setTimeout(handleChange, 0);
          }}
        >
          {places.map((pl, index) => (
            <MenuItem key={index} value={pl}>
              {pl}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Search"
        variant="outlined"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleChange()}
        sx={{ flex: 1, minWidth: 200 }}
      />
    </Box>
  );
};

export default BlogFilters;
